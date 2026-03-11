import { CHAPTER_ONE_TITLE, sanitizeUnlockedChapterTitles } from "@/lib/access";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getStudentProfileById,
  getViewerProfile,
  listStudentProfiles,
  updateStudentProfileAccess,
} from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import type { UserAccessProfile, UserPlan } from "@/types/auth";
import type { User } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const enforceTutorMutationRateLimit = createRateLimiter({
  maxRequests: 30,
  windowMs: 10 * 60 * 1000,
});

function writeAuditLog(action: string, actor: User, details: Record<string, string>) {
  console.info(
    JSON.stringify({
      event: "student_access_update",
      action,
      actor_user_id: actor.id,
      actor_email: actor.email ?? "",
      timestamp: new Date().toISOString(),
      ...details,
    }),
  );
}

function getMutationRateLimitKey(userId: string, method: string) {
  return `${userId}:${method}:/api/students`;
}

function normalizePlan(value: unknown): UserPlan | null {
  if (value === "basic" || value === "premium") return value;
  return null;
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const viewer = await getViewerProfile(supabase, user.id);
    if (!viewer) {
      return Response.json({ error: "Profile not found." }, { status: 404 });
    }

    const students = viewer.role === "tutor" ? await listStudentProfiles(supabase) : [];

    return Response.json({ viewer, students });
  } catch {
    return Response.json({ error: "Unable to load access data." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const viewer = await getViewerProfile(supabase, user.id);
  if (!viewer) {
    return Response.json({ error: "Profile not found." }, { status: 404 });
  }
  if (viewer.role !== "tutor") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const patchLimit = enforceTutorMutationRateLimit(getMutationRateLimitKey(user.id, "PATCH"));
  if (!patchLimit.allowed) {
    return Response.json(
      { error: "Too many requests. Please retry shortly." },
      { status: 429, headers: { "Retry-After": String(patchLimit.retryAfterSeconds) } },
    );
  }

  try {
    const body = (await request.json()) as {
      userId?: unknown;
      plan?: unknown;
      unlockedChapterTitles?: unknown;
    };

    if (typeof body.userId !== "string" || !body.userId.trim()) {
      return Response.json({ error: "Student user id is required." }, { status: 400 });
    }

    const plan = normalizePlan(body.plan);
    if (!plan) {
      return Response.json({ error: "Plan must be basic or premium." }, { status: 400 });
    }

    const unlockedChapterTitles = sanitizeUnlockedChapterTitles(
      Array.isArray(body.unlockedChapterTitles) ? body.unlockedChapterTitles : [CHAPTER_ONE_TITLE],
      plan,
    );

    const updated = await updateStudentProfileAccess(
      supabase,
      body.userId,
      plan,
      unlockedChapterTitles,
    );

    writeAuditLog("update_student_access", user, {
      target_user_id: updated.id,
      target_email: updated.email,
      plan: updated.plan,
      unlocked_chapters: updated.unlockedChapterTitles.join(", "),
    });

    return Response.json({ student: updated as UserAccessProfile });
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "Unable to update student access.";
    const status = message === "Student profile not found." ? 404 : 500;
    return Response.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const viewer = await getViewerProfile(supabase, user.id);
  if (!viewer) {
    return Response.json({ error: "Profile not found." }, { status: 404 });
  }
  if (viewer.role !== "tutor") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const deleteLimit = enforceTutorMutationRateLimit(getMutationRateLimitKey(user.id, "DELETE"));
  if (!deleteLimit.allowed) {
    return Response.json(
      { error: "Too many requests. Please retry shortly." },
      { status: 429, headers: { "Retry-After": String(deleteLimit.retryAfterSeconds) } },
    );
  }

  try {
    const body = (await request.json()) as { userId?: unknown };
    if (typeof body.userId !== "string" || !body.userId.trim()) {
      return Response.json({ error: "Student user id is required." }, { status: 400 });
    }
    if (body.userId === user.id) {
      return Response.json({ error: "You cannot delete your own tutor account." }, { status: 400 });
    }

    const student = await getStudentProfileById(supabase, body.userId);
    if (!student) {
      return Response.json({ error: "Student profile not found." }, { status: 404 });
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(body.userId);
    if (error) {
      throw new Error(error.message);
    }

    writeAuditLog("delete_student", user, {
      target_user_id: student.id,
      target_email: student.email,
      plan: student.plan,
      unlocked_chapters: student.unlockedChapterTitles.join(", "),
    });

    return Response.json({ deletedUserId: student.id });
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "Unable to delete student.";
    const status = message === "Student profile not found." ? 404 : 500;
    return Response.json({ error: message }, { status });
  }
}
