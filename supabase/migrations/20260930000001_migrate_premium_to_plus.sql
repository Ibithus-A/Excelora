-- Run after the enum-extension migration has committed. This retires the old
-- database label while application normalization continues to support any
-- stale `premium` values during rollout.
update public.profiles
set plan = 'plus'
where plan = 'premium';

notify pgrst, 'reload schema';
