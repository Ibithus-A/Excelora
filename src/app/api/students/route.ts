import { normalizeEmail, normalizeStudentName, type StudentAccount } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toRole(user: User): "tutor" | "student" {
  return user.user_metadata?.role === "tutor" ? "tutor" : "student";
}

function toStudentAccount(user: User): StudentAccount | null {
  if (toRole(user) !== "student") return null;
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
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(error.message);

  const students = data.users
    .map((user) => toStudentAccount(user))
    .filter((account): account is StudentAccount => Boolean(account));

  students.sort((left, right) => left.name.localeCompare(right.name));
  return students;
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (toRole(user) === "student") {
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
  if (toRole(user) !== "tutor") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
    };
    if (typeof body.name !== "string") {
      return Response.json({ error: "Student name is required." }, { status: 400 });
    }
    if (typeof body.email !== "string") {
      return Response.json({ error: "Student email is required." }, { status: 400 });
    }
    if (typeof body.password !== "string") {
      return Response.json({ error: "Student password is required." }, { status: 400 });
    }

    const normalizedName = normalizeStudentName(body.name);
    const normalizedEmail = normalizeEmail(body.email);
    const normalizedPassword = body.password.trim();
    if (!normalizedName) {
      return Response.json(
        { error: "Student name must contain letters or numbers." },
        { status: 400 },
      );
    }
    if (normalizedPassword.length < 8) {
      return Response.json(
        { error: "Student password must be at least 8 characters." },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return Response.json({ error: "Student email must be valid." }, { status: 400 });
    }

    const admin = createAdminClient();
    const existingStudents = await listStudents();
    const existingNames = new Set(existingStudents.map((student) => student.name.toLowerCase()));
    if (existingNames.has(normalizedName.toLowerCase())) {
      return Response.json({ error: "A student with that name already exists." }, { status: 409 });
    }

    const { data: allUsers, error: listError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listError) {
      return Response.json({ error: listError.message }, { status: 500 });
    }
    const emailTaken = allUsers.users.some(
      (candidate) => normalizeEmail(candidate.email ?? "") === normalizedEmail,
    );
    if (emailTaken) {
      return Response.json({ error: "A user with that email already exists." }, { status: 409 });
    }

    const { data, error } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password: normalizedPassword,
      email_confirm: true,
      user_metadata: {
        role: "student",
        full_name: normalizedName,
      },
    });

    if (error || !data.user) {
      return Response.json({ error: error?.message ?? "Unable to create student." }, { status: 500 });
    }

    return Response.json({
      student: { name: normalizedName, email: normalizedEmail },
      credentials: { email: normalizedEmail, password: normalizedPassword },
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
  if (toRole(user) !== "tutor") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { email?: unknown };
    if (typeof body.email !== "string") {
      return Response.json({ error: "Student email is required." }, { status: 400 });
    }

    const targetEmail = normalizeEmail(body.email);
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const target = data.users.find((candidate) => normalizeEmail(candidate.email ?? "") === targetEmail);
    if (!target) {
      return Response.json({ error: "Student not found." }, { status: 404 });
    }
    if (toRole(target) !== "student") {
      return Response.json({ error: "Only student accounts can be removed here." }, { status: 400 });
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(target.id);
    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Unable to delete student." }, { status: 500 });
  }
}
