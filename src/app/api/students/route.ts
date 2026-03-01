import {
  isValidEmail,
  normalizeEmail,
  normalizeStudentName,
  type StudentAccount,
} from "@/lib/auth";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServerUserRole } from "@/lib/supabase/roles";
import { createClient } from "@/lib/supabase/server";
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
      event: "student_admin_action",
      action,
      actor_user_id: actor.id,
      actor_email: actor.email ?? "",
      timestamp: new Date().toISOString(),
      ...details,
    }),
  );
}

function toStudentAccount(user: User): StudentAccount | null {
  if (getServerUserRole(user) !== "student") return null;
  const email = user.email ? normalizeEmail(user.email) : "";
  if (!email) return null;

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? normalizeStudentName(user.user_metadata.full_name)
      : "";
  const fallbackName = normalizeStudentName(email.split("@")[0] ?? "");
  const name = fullName || fallbackName || "Student";

  return { name, email };
}

async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function listStudents(): Promise<StudentAccount[]> {
  const allUsers = await listAllUsers();
  const students = allUsers
    .map((user) => toStudentAccount(user))
    .filter((account): account is StudentAccount => Boolean(account));

  students.sort((left, right) => left.name.localeCompare(right.name));
  return students;
}

async function listAllUsers(): Promise<User[]> {
  const admin = createAdminClient();
  const perPage = 1000;
  let page = 1;
  const users: User[] = [];

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    users.push(...data.users);
    if (data.users.length < perPage) break;
    page += 1;
  }

  return users;
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (getServerUserRole(user) === "student") {
    const account = toStudentAccount(user);
    return Response.json({ students: account ? [account] : [] });
  }

  try {
    const students = await listStudents();
    return Response.json({ students });
  } catch {
    return Response.json({ error: "Unable to load students." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (getServerUserRole(user) !== "tutor") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }
  const postLimit = enforceTutorMutationRateLimit(`${user.id}:POST:/api/students`);
  if (!postLimit.allowed) {
    return Response.json(
      { error: "Too many requests. Please retry shortly." },
      { status: 429, headers: { "Retry-After": String(postLimit.retryAfterSeconds) } },
    );
  }

  try {
    const body = (await request.json()) as {
      name?: unknown;
      email?: unknown;
    };
    if (typeof body.name !== "string") {
      return Response.json({ error: "Student name is required." }, { status: 400 });
    }
    if (typeof body.email !== "string") {
      return Response.json({ error: "Student email is required." }, { status: 400 });
    }
    const normalizedName = normalizeStudentName(body.name);
    const normalizedEmail = normalizeEmail(body.email);
    if (!normalizedName) {
      return Response.json(
        { error: "Student name must contain letters or numbers." },
        { status: 400 },
      );
    }
    if (!isValidEmail(normalizedEmail)) {
      return Response.json({ error: "Student email must be valid." }, { status: 400 });
    }

    const admin = createAdminClient();
    const allUsers = await listAllUsers();
    const existingStudents = allUsers
      .map((candidate) => toStudentAccount(candidate))
      .filter((candidate): candidate is StudentAccount => Boolean(candidate));
    const existingNames = new Set(existingStudents.map((student) => student.name.toLowerCase()));
    if (existingNames.has(normalizedName.toLowerCase())) {
      return Response.json({ error: "A student with that name already exists." }, { status: 409 });
    }

    const emailTaken = allUsers.some(
      (candidate) => normalizeEmail(candidate.email ?? "") === normalizedEmail,
    );
    if (emailTaken) {
      return Response.json({ error: "A user with that email already exists." }, { status: 409 });
    }

    const requestUrl = new URL(request.url);
    const origin = requestUrl.origin;
    const inviteRedirectTo = `${origin}/reset-password`;

    const { data, error } = await admin.auth.admin.inviteUserByEmail(normalizedEmail, {
      data: {
        full_name: normalizedName,
        role: "student",
      },
      redirectTo: inviteRedirectTo,
    });

    if (error || !data.user) {
      return Response.json({ error: error?.message ?? "Unable to create student." }, { status: 500 });
    }

    const { error: roleUpdateError } = await admin.auth.admin.updateUserById(data.user.id, {
      app_metadata: {
        role: "student",
      },
      user_metadata: {
        full_name: normalizedName,
      },
    });
    if (roleUpdateError) {
      return Response.json({ error: roleUpdateError.message }, { status: 500 });
    }

    writeAuditLog("create_student", user, {
      target_user_id: data.user.id,
      target_email: normalizedEmail,
    });

    return Response.json({
      student: { name: normalizedName, email: normalizedEmail },
      invitationSent: true,
    });
  } catch {
    return Response.json({ error: "Unable to create student." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (getServerUserRole(user) !== "tutor") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }
  const deleteLimit = enforceTutorMutationRateLimit(`${user.id}:DELETE:/api/students`);
  if (!deleteLimit.allowed) {
    return Response.json(
      { error: "Too many requests. Please retry shortly." },
      { status: 429, headers: { "Retry-After": String(deleteLimit.retryAfterSeconds) } },
    );
  }

  try {
    const body = (await request.json()) as { email?: unknown };
    if (typeof body.email !== "string") {
      return Response.json({ error: "Student email is required." }, { status: 400 });
    }

    const targetEmail = normalizeEmail(body.email);
    const admin = createAdminClient();
    const allUsers = await listAllUsers();
    const target = allUsers.find(
      (candidate) => normalizeEmail(candidate.email ?? "") === targetEmail,
    );
    if (!target) {
      return Response.json({ error: "Student not found." }, { status: 404 });
    }
    if (getServerUserRole(target) !== "student") {
      return Response.json({ error: "Only student accounts can be removed here." }, { status: 400 });
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(target.id);
    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 500 });
    }

    writeAuditLog("delete_student", user, {
      target_user_id: target.id,
      target_email: targetEmail,
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Unable to delete student." }, { status: 500 });
  }
}
