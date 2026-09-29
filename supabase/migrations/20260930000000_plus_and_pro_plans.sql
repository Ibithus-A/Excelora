-- Additive three-tier access model. Existing `premium` rows remain valid and
-- are interpreted by the application as Plus, so this migration is reversible
-- at the application layer and does not rewrite student accounts.
alter type public.app_plan add value if not exists 'plus';
alter type public.app_plan add value if not exists 'pro';

notify pgrst, 'reload schema';
