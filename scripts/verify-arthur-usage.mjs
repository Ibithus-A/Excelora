// Local PostgreSQL only; no provider requests or live accounts.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
const { PGlite } = await import(
  process.env.EXCELORA_PGLITE_MODULE ?? "@electric-sql/pglite"
);
const db = new PGlite();
await db.exec(
  "create schema auth; create table auth.users(id uuid primary key); create role anon; create role authenticated; create role service_role;",
);
await db.exec(
  readFileSync("supabase/migrations/20260924_arthur_usage_limits.sql", "utf8"),
);
const a = "11111111-1111-4111-8111-111111111111",
  b = "22222222-2222-4222-8222-222222222222";
await db.query("insert into auth.users values($1),($2)", [a, b]);
const reserve = async (id) =>
  (await db.query("select reserve_arthur_request($1) as result", [id])).rows[0]
    .result;
assert.equal(await reserve(a), "disabled");
await db.exec(
  "update arthur_usage_settings set enabled=true,monthly_request_limit=3,daily_user_limit=2",
);
assert.equal(await reserve(a), "allowed");
assert.equal(await reserve(a), "allowed");
assert.equal(await reserve(a), "daily_limit");
assert.equal(await reserve(b), "allowed");
assert.equal(await reserve(b), "monthly_limit");
await db.exec(
  "update arthur_monthly_usage set month=month - interval '1 month'; update arthur_daily_usage set day=day - interval '1 month'",
);
assert.equal(await reserve(b), "allowed");
assert.equal(
  (await db.query("select count(*)::int as n from arthur_daily_usage")).rows[0]
    .n,
  1,
);
await db.exec("update arthur_usage_settings set monthly_request_limit=2");
const racing = await Promise.all(Array.from({ length: 12 }, () => reserve(a)));
assert.equal(racing.filter((x) => x === "allowed").length, 1);
for (const role of ["anon", "authenticated"]) {
  await db.exec(`set role ${role}`);
  await assert.rejects(() => reserve(a));
  await assert.rejects(() => db.query("select * from arthur_usage_settings"));
  await db.exec("reset role");
}
await db.exec("set role service_role");
assert.equal(await reserve(b), "monthly_limit");
await db.exec("reset role");
// Reapplying must preserve owner settings and usage.
await db.exec(
  readFileSync("supabase/migrations/20260924_arthur_usage_limits.sql", "utf8"),
);
assert.equal(await reserve(b), "monthly_limit");
const report = {
  date: "2026-09-24",
  checks: [
    "disabled by default",
    "daily user limit",
    "global monthly limit",
    "UTC month reset",
    "old daily counters pruned",
    "competing reservations bounded",
    "anonymous and authenticated callers denied",
    "service role allowed",
    "idempotent migration preserves settings",
  ],
  providerCalls: 0,
};
writeFileSync(
  "docs/qa/arthur-usage-tests.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(report);
await db.close();
