begin;

-- PostgreSQL grants EXECUTE on new functions to PUBLIC by default. These are
-- internal trigger functions, so neither anonymous nor signed-in API clients
-- should be able to invoke them directly.
revoke all on function
  public.capture_assessment_learning_event(),
  public.capture_practice_learning_event(),
  public.capture_quiz_learning_events(),
  public.capture_review_card_from_learning_event(),
  public.ensure_adaptive_quiz_from_learning_event(),
  public.refresh_reviewed_assessment_learning_event()
from public, anon, authenticated;

notify pgrst, 'reload schema';

commit;
