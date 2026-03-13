import {
  sanitizeCustomUnlockedChapterTitles,
  sanitizeTaggedChapterTitle,
} from "@/lib/access";
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

function jsonError(message: string, status: number, headers?: HeadersInit) {
  return Response.json({ error: message }, { status, headers });
}

async function requireAuthenticatedViewer() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) {
    return { errorResponse: jsonError("Unauthorized.", 401) } as const;
  }

  const viewer = await getViewerProfile(supabase, user.id);
  if (!viewer) {
    return { errorResponse: jsonError("Profile not found.", 404) } as const;
  }

  return { supabase, user, viewer } as const;
}

async function requireTutorViewer() {
  const viewerContext = await requireAuthenticatedViewer();
  if ("errorResponse" in viewerContext) {
    return viewerContext;
  }

  if (viewerContext.viewer.role !== "tutor") {
    return { errorResponse: jsonError("Forbidden.", 403) } as const;
  }

  return viewerContext;
}

export async function GET() {
  const viewerContext = await requireAuthenticatedViewer();
  if ("errorResponse" in viewerContext) {
    return viewerContext.errorResponse;
  }

  try {
    const { supabase, viewer } = viewerContext;
    const students = viewer.role === "tutor" ? await listStudentProfiles(supabase) : [];

    return Response.json({ viewer, students });
  } catch {
    return jsonError("Unable to load access data.", 500);
  }
}

export async function PATCH(request: Request) {
  const viewerContext = await requireTutorViewer();
  if ("errorResponse" in viewerContext) {
    return viewerContext.errorResponse;
  }
  const { supabase, user } = viewerContext;

  const patchLimit = enforceTutorMutationRateLimit(getMutationRateLimitKey(user.id, "PATCH"));
  if (!patchLimit.allowed) {
    return jsonError(
      "Too many requests. Please retry shortly.",
      429,
      { "Retry-After": String(patchLimit.retryAfterSeconds) },
    );
  }

  try {
    const body = (await request.json()) as {
      userId?: unknown;
      plan?: unknown;
      taggedChapterTitle?: unknown;
      customUnlockedChapterTitles?: unknown;
    };

    if (typeof body.userId !== "string" || !body.userId.trim()) {
      return jsonError("Student user id is required.", 400);
    }

    const plan = normalizePlan(body.plan);
    if (!plan) {
      return jsonError("Plan must be basic or premium.", 400);
    }

    const taggedChapterTitle = sanitizeTaggedChapterTitle(body.taggedChapterTitle);
    const customUnlockedChapterTitles = sanitizeCustomUnlockedChapterTitles(
      body.customUnlockedChapterTitles,
    );

    const updated = await updateStudentProfileAccess(
      supabase,
      body.userId,
      plan,
      taggedChapterTitle,
      customUnlockedChapterTitles,
    );

    writeAuditLog("update_student_access", user, {
      target_user_id: updated.id,
      target_email: updated.email,
      plan: updated.plan,
      tagged_chapter: updated.taggedChapterTitle ?? "",
      custom_unlocked_chapters: updated.customUnlockedChapterTitles.join(", "),
    });

    return Response.json({ student: updated as UserAccessProfile });
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "Unable to update student access.";
    const status = message === "Student profile not found." ? 404 : 500;
    return jsonError(message, status);
  }
}

export async function DELETE(request: Request) {
  const viewerContext = await requireTutorViewer();
  if ("errorResponse" in viewerContext) {
    return viewerContext.errorResponse;
  }
  const { supabase, user } = viewerContext;

  const deleteLimit = enforceTutorMutationRateLimit(getMutationRateLimitKey(user.id, "DELETE"));
  if (!deleteLimit.allowed) {
    return jsonError(
      "Too many requests. Please retry shortly.",
      429,
      { "Retry-After": String(deleteLimit.retryAfterSeconds) },
    );
  }

  try {
    const body = (await request.json()) as { userId?: unknown };
    if (typeof body.userId !== "string" || !body.userId.trim()) {
      return jsonError("Student user id is required.", 400);
    }
    if (body.userId === user.id) {
      return jsonError("You cannot delete your own tutor account.", 400);
    }

    const student = await getStudentProfileById(supabase, body.userId);
    if (!student) {
      return jsonError("Student profile not found.", 404);
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
      tagged_chapter: student.taggedChapterTitle ?? "",
      custom_unlocked_chapters: student.customUnlockedChapterTitles.join(", "),
    });

    return Response.json({ deletedUserId: student.id });
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "Unable to delete student.";
    const status = message === "Student profile not found." ? 404 : 500;
    return jsonError(message, status);
  }
}
