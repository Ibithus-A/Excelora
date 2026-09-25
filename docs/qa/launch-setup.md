# Launch setup — Vercel and Supabase

Verified on 25 September 2026: all required migrations are installed. Authenticated student/tutor API tests pass against the locally built production app and live Supabase. No further SQL is required for the implemented practice/activity features. The updated source has not been deployed to Vercel, and account dashboard settings cannot be inspected with the credentials available here.

## 1. Vercel project settings

Open your existing Excelora project → Settings → Environment Variables. Check the **Production** environment has:

| Name | Value to use |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | The URL of the same Supabase project where you ran the SQL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | That project's publishable key (the existing anon-key fallback is also supported) |
| `SUPABASE_SERVICE_ROLE_KEY` | That project's service-role key, saved as a secret; never give this a `NEXT_PUBLIC_` prefix |
| `NEXT_PUBLIC_SITE_URL` | Your real website origin, for example `https://your-domain.com`, without a path |

Do not copy the local `NEXT_PUBLIC_SITE_URL` value (`http://localhost:3000`) into Production. Do not paste keys into chat or commit `.env.local`. No new AI API key is needed for notes, practice, assessments or tutor tracking. Arthur remains disabled until you choose a budget and connect the intended provider; DeepSeek is not integrated yet.

Use the **Next.js** framework preset, **Node.js 24.x**, install with `npm ci` and build with `npm run build`. Leave the output directory at the framework default. `EXCELORA_QA_FIXTURES` must be absent in Vercel. The temporary QA route has already been removed from application source.

Publish the updated source from this workspace through your normal connected Git repository/deployment process. Merely redeploying an old commit will not include these changes. Environment changes take effect on a new deployment. No Vercel token/project linkage is available here, so a production deployment has not been triggered. [Environment variables](https://vercel.com/docs/environment-variables), [Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

## 2. Supabase authentication

In Authentication → URL Configuration, set **Site URL** to the same public origin as `NEXT_PUBLIC_SITE_URL`.

Add the production URLs used by this app to **Redirect URLs**, replacing the example origin:

```text
https://your-domain.com/auth/callback?next=%2F%3Fconfirmed%3D1
https://your-domain.com/reset-password?recovery=1
```

Keep any other intentional existing callback entries. Production callbacks should use your exact domain; do not add a broad wildcard for every Vercel site. If you use a separate preview domain for authentication testing, configure that domain explicitly with matching preview environment settings. [Supabase redirect URL configuration](https://supabase.com/docs/guides/auth/redirect-urls).

In Authentication → email/SMTP settings, confirm **custom SMTP** is configured with a verified sender domain before inviting students to sign up. Supabase's default mail service restricts delivery to project-team addresses and is not a production email service. No email was sent during our tests, so delivery remains unverified. Use your existing email provider if available and account for its allowance before adding a paid service. [Supabase SMTP requirements](https://supabase.com/docs/guides/auth/auth-smtp).

After deployment, use your own test student email to confirm that sign-up and password-reset links arrive and open the real website. Tutor access and student isolation passed our temporary-account tests, but this does not confirm the role assigned to your personal account.

## 3. Cost controls

In Supabase organization Billing → Cost Control, keep **Spend Cap** enabled and check upcoming invoice, project count and compute size. Spend Cap does not cover every possible charge, including selected compute/add-ons. No new Supabase project, bucket or paid service is required by this change. [Supabase cost control](https://supabase.com/docs/guides/platform/cost-control).

On Vercel Pro, open team Settings → Billing → Spend Management. Choose an On-Demand Budget and enable **Pause Production Deployments** if you want serving to stop at the threshold. A notification/budget alone does not stop usage. Checks can lag by minutes, and this control does not include fixed seats/add-ons; pausing takes all the team's production sites offline. Set the threshold below your absolute maximum to allow for the delay. Account plan and budget remain unverified. [Vercel Spend Management](https://vercel.com/docs/spend-management).

Public course assets total about 88.74 MB, mostly videos served by Vercel. These consume Vercel delivery allowances, not Supabase Storage. Practice answers/history consume database capacity over time. Arthur is verified disabled with a zero monthly allowance. See `cost-and-capacity.md` for growth estimates and `scripts/supabase-usage-audit.sql` for a read-only size report.

## 4. Final website check

Once the new deployment is Ready, sign in as a test student and open a native lesson, mark its notes complete, start/check/continue/stop practice, and confirm the saved session returns after refresh. As tutor, verify the student's last-seen activity and saved work, unlock the completed chapter's assessment, then submit the assessment as the test student. Check calculator behavior on phone and desktop. Verify confirmation/reset email delivery separately.

The live API workflows pass, but a Vercel-domain browser/email check has not yet been performed. Mathematical/source sign-off and manual tutor mark adjustment remain separate limitations in `implementation-status.md`; provisional marks should not be treated as final grading.
