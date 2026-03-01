How to Add User Authentication, Role-Based Access, and Progression Rules

1. Identity + Roles
- Use an auth provider (Auth.js, Clerk, or Supabase Auth).
- Users table fields:
  - id, email, password_hash (or provider ID)
  - role: admin | student
  - plan: standard | custom
  - is_active
- Admin is just a user with role=admin (or an isOwner flag for exactly one super-admin).

2. Course Access Model
- modules table: each module/chapter/subtopic with ordering.
- enrollments table: student ↔ course.
- module_access table: explicit overrides per student (locked/unlocked).
- module_prerequisites table: “Module B requires Module A pass”.
- module_results table: student test score + passed boolean.

3. Authorization Rules (server-side)
- Admin can view/edit everything, lock/unlock any module, override progression.
- Student can view only modules that satisfy:
  1. Enrolled in course, and
  2. One of:
     - plan=custom and admin has granted access, or
     - all prerequisite modules are passed, or
     - admin override unlock exists.
- Never trust frontend lock state alone; API/database policy must enforce this.

4. Progression Logic
- On “End of Topic Test” submission:
  - Grade attempt.
  - Mark passed=true if above threshold (e.g., 70%).
  - Recompute unlocks for next modules (or compute at read time).
- If failed, keep downstream locked unless admin override/custom plan unlock exists.

5. Admin Controls You Need
- Student management page:
  - assign plan (standard/custom)
  - enroll student in course
  - manual unlock/lock per module
  - view progress, scores, attempts
- Module policy editor:
  - define prerequisites
  - define pass threshold per module

6. Student Experience
- Sidebar shows all modules but locked ones are visibly gated.
- Locked module click shows reason:
  - “Pass Module X first” or
  - “Available on Custom Plan”.
- After passing a module, next eligible modules unlock instantly.

7. Security + Scale Best Practices
- Enforce role checks in middleware + API handlers.
- Use row-level security/policies (if Supabase/Postgres) for student-scoped data.
- Audit log admin actions (manual unlocks, plan changes).
- Rate-limit auth and test submission endpoints.
- Store only minimal PII; encrypt sensitive fields.

8. Recommended Rollout Order
1. Auth + roles
2. Enrollment + module access checks
3. Test result + pass/fail progression
4. Admin overrides
5. Plan-based unlock rules (custom)

If needed next, we can define the concrete backend schema and API contract endpoint-by-endpoint for Excelora.
