# Course costs and capacity — 25 September 2026

The course files are small enough that storage is unlikely to be the first constraint. The main costs to control are website/video delivery and Arthur. **The actual plan, upcoming invoice and spend-cap settings have not been verified.** No paid service, project or upgrade was created during this work and no Cohere requests were made for these checks.

## What this website uses

| Feature | Where it lives / what can be charged |
| --- | --- |
| Native lessons and diagrams | Website deployment; no AI request per page |
| Videos | `/public/assets/videos`, delivered by the website host; traffic is charged there if its allowance is exceeded |
| Accounts, question bank, assessment and practice history | Supabase database and API traffic |
| Practice question generation | Selects and mixes existing bank questions; no Cohere fee |
| Numeric marking | Server code; no paid AI marking |
| Arthur | Cohere Chat API, `command-a-03-2025`; input and output tokens charged separately from Supabase |
| Workspace drafts | Browser local storage; this is not a cloud backup or cross-device sync |
| Authentication email, domain, hosting subscription | External/account configuration; providers and invoices still need confirmation |

Measured public assets after PDF withdrawal: **88,744,983 bytes (88.74 MB)**: nine videos / 88.19 MB, plus images and other assets. The 170 PDFs / 11.73 MB are preserved under `archives/course-pdfs` and are no longer publicly served. See `asset-storage-inventory.json`. This inventory covers files currently present, not future videos. Read-only live Supabase checks found **zero Storage buckets**. Database capacity is separate from Storage capacity; file sizes do not establish database usage.

Supabase currently calls its entry paid plan **Pro**, starting at **US$25/month**, with 8 GB database disk per project, 100 GB file storage, 250 GB uncached egress and a separate 250 GB cached allowance. One Micro project's compute is covered by the included credit; additional projects and larger compute can add charges. These are published allowances, not confirmation of your account. [Supabase pricing](https://supabase.com/pricing)

**Keep Supabase Spend Cap on.** It covers specified usage items, including storage, disk and egress, but does not cap the entire invoice: opted-in compute, extra projects/branches and add-ons can still cost more. Verify Billing → Cost Control, Upcoming Invoice and project Compute and Disk. Use an existing staging environment or local PostgreSQL for tests; creating another paid project adds cost. [Supabase cost control](https://supabase.com/docs/guides/platform/cost-control)

## Capacity estimates (not measured production usage)

At a planning assumption of 4 KB per saved question including response and index overhead, 100 students each answering 50 questions/day produce about **600 MB/month**; 20 students produce about **120 MB/month**. This is deliberately a planning assumption, not a measured row size. Long answers, database indexes, logs, bloat, other tables and existing records alter it. History grows over time. No student history was deleted or expiry policy imposed.

For hosting traffic, one full viewing of all nine current videos transfers roughly 88 MB before caching/range/replay effects: 100 students doing that is roughly **8.8 GB**, and ten repeats roughly **88 GB**. Future videos can dominate this. Host bandwidth limits must be checked once the provider and plan are known. Do not assume Supabase's bandwidth allowance pays for website-host traffic.

Run `scripts/supabase-usage-audit.sql` in Supabase SQL Editor to obtain database/table sizes and stored-file totals without reading student content. Compare against the dashboard's provisioned disk, usage and invoice; database SQL cannot reveal all billing settings. Review usage weekly initially and before increasing enrolment; investigate at 70% of included capacity. Do not automatically enable overages or delete history.

## Arthur safeguards implemented

Apply `20260924_arthur_usage_limits.sql` before deploying the updated Arthur route. It defaults to **disabled with zero monthly calls**. The existing deployed app is not protected until the updated code is deployed. An owner must deliberately set an allowance to turn it on.

- Every paid call must first reserve one slot in PostgreSQL. The global monthly cap works across users, server instances and restarts. A daily per-user limit defaults to 20.
- Missing migration, database errors, disabled settings and exhausted limits stop the request before Cohere.
- Failed calls/timeouts still use a slot, since the provider may already have billed them. No automatic paid retries.
- Replies are limited to 1,024 output tokens. Existing conversation/context limits are retained. Calls time out after 45 seconds; a timeout is not assumed to cancel provider billing.
- Counters use UTC calendar months/days. Only counters, not chat contents, are stored. Old daily counters are pruned; monthly aggregate totals remain.
- Lessons and practice remain usable when Arthur's allowance is exhausted.

This is a **request cap**, not an invoice meter. Command A's published rates are $2.50 per million input tokens and $10 per million output tokens. For example, 8,000 input + 1,024 output tokens cost about **$0.03024 per request**, or **$30.24 per 1,000 requests**. Actual inputs vary. [Cohere Command A](https://docs.cohere.com/docs/command-a)

For deliberately conservative planning at those rates, even charging the full published 256,000-token context as input plus 1,024 output tokens is below **$0.66 per admitted request**. A $20 pre-tax model-usage budget would therefore allow at most **30 calls/month** under that ceiling. This is intentionally much more restrictive than typical usage. It excludes tax, currency conversion, other uses of the API key and future price changes. Use a dedicated course key and verify the provider invoice/rates before choosing an allowance. Trial keys are not a production plan. [Cohere key and billing policy](https://cohere.com/pricing)

The following is a template, **not applied**. Replace `0` with the explicitly chosen allowance after checking the budget; zero admits no calls:

```sql
update public.arthur_usage_settings
set enabled = true, monthly_request_limit = 0, daily_user_limit = 20
where id = true;
```

To pause Arthur immediately on the updated app:

```sql
update public.arthur_usage_settings set enabled = false where id = true;
```

To inspect counters without exposing conversations:

```sql
select * from public.arthur_usage_settings;
select * from public.arthur_monthly_usage order by month desc;
```

## Still needed to verify the total bill

Confirm hosting provider/plan, intended student count, Supabase plan/compute/project count/spend cap, current usage/invoice, and the permitted Arthur budget. The application cannot inspect or enforce another provider's account-wide billing settings. Set the host's available hard spending controls as well as notifications; an alert alone does not stop charges. Exact hosting steps depend on the provider. No claim of zero overage is made while these settings are unknown.

## Continuous practice and tutor activity

Practice selects stored questions and uses local/server marking, with no paid model calls. Saved answers and question exposure history grow with use; the capacity estimate above still applies. Activity heartbeats overwrite one row per student rather than accumulating a log. Visible student tabs send at most one periodic heartbeat per 45 seconds, plus page changes; the tutor dashboard polls every 30 seconds. These API requests and autosaves still consume host/database resources and network traffic; they are not an account-wide spending cap.

The live QA checks created and removed nine temporary authenticated users across three runs. They can count toward this billing period's active-user usage. No messages were sent and no paid AI calls were made. No additional Supabase project or paid service was created. DeepSeek integration remains pending; any future provider must retain explicit usage limits before activation.

Supabase pricing and cost-control documentation were rechecked on 25 September 2026. The account's actual subscription and spend-cap setting have not been inspected.

Live verification on 25 September confirms Arthur `enabled=false` and `monthly_request_limit=0`; see `live-cost-guards.json`. Supabase billing settings remain unverified. Vercel launch and spending controls are described in `launch-setup.md`.
