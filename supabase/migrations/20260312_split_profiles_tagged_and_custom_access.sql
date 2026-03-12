alter table public.profiles
add column if not exists tagged_chapter text;

with allowed as (
  select array[
    'Chapter 1: Algebra 1',
    'Chapter 2: Polynomials and the binomial theorem',
    'Chapter 3: Trigonometry',
    'Chapter 4: Differentiation and integration',
    'Chapter 5: Exponentials and logarithms',
    'Chapter 6: Vectors',
    'Chapter 7: Units and kinematics',
    'Chapter 8: Forces and Newton''s laws',
    'Chapter 9: Collecting, representing and interpreting data',
    'Chapter 10: Probability and discrete random variables',
    'Chapter 11: Hypothesis testing 1',
    'Chapter 12: Algebra 2',
    'Chapter 13: Sequences',
    'Chapter 14: Trigonometric identities',
    'Chapter 15: Differentiation 2',
    'Chapter 16: Integration and differential equations',
    'Chapter 17: Numerical methods',
    'Chapter 18: Motion in two dimensions',
    'Chapter 19: Forces 2',
    'Chapter 20: Probability and continuous random variables',
    'Chapter 21: Hypothesis testing 2'
  ]::text[] as chapters
),
converted as (
  select
    profiles.id,
    profiles.unlocked_chapters,
    (
      select max(candidate.idx)
      from generate_subscripts(allowed.chapters, 1) as candidate(idx)
      where not exists (
        select 1
        from generate_subscripts(allowed.chapters, 1) as required(idx)
        where required.idx <= candidate.idx
          and not (allowed.chapters[required.idx] = any (coalesce(profiles.unlocked_chapters, array[]::text[])))
      )
    ) as prefix_index
  from public.profiles as profiles
  cross join allowed
)
update public.profiles as profiles
set
  tagged_chapter = case
    when converted.prefix_index is null or converted.prefix_index <= 1 then null
    else allowed.chapters[converted.prefix_index]
  end,
  unlocked_chapters = (
    select coalesce(
      array_agg(distinct chapter order by array_position(allowed.chapters, chapter)),
      array[]::text[]
    )
    from unnest(coalesce(converted.unlocked_chapters, array[]::text[])) as chapter
    where chapter = any (allowed.chapters)
      and chapter <> allowed.chapters[1]
      and (
        converted.prefix_index is null
        or array_position(allowed.chapters, chapter) > converted.prefix_index
      )
  )
from converted
cross join allowed
where profiles.id = converted.id
  and profiles.tagged_chapter is null;

create or replace function public.sanitize_profile_access()
returns trigger
language plpgsql
as $$
declare
  allowed_chapters text[] := array[
    'Chapter 1: Algebra 1',
    'Chapter 2: Polynomials and the binomial theorem',
    'Chapter 3: Trigonometry',
    'Chapter 4: Differentiation and integration',
    'Chapter 5: Exponentials and logarithms',
    'Chapter 6: Vectors',
    'Chapter 7: Units and kinematics',
    'Chapter 8: Forces and Newton''s laws',
    'Chapter 9: Collecting, representing and interpreting data',
    'Chapter 10: Probability and discrete random variables',
    'Chapter 11: Hypothesis testing 1',
    'Chapter 12: Algebra 2',
    'Chapter 13: Sequences',
    'Chapter 14: Trigonometric identities',
    'Chapter 15: Differentiation 2',
    'Chapter 16: Integration and differential equations',
    'Chapter 17: Numerical methods',
    'Chapter 18: Motion in two dimensions',
    'Chapter 19: Forces 2',
    'Chapter 20: Probability and continuous random variables',
    'Chapter 21: Hypothesis testing 2'
  ];
  sanitized_tagged_chapter text;
begin
  new.email = lower(trim(new.email));
  new.full_name = trim(new.full_name);

  if new.tagged_chapter = any (allowed_chapters) then
    sanitized_tagged_chapter := new.tagged_chapter;
  else
    sanitized_tagged_chapter := null;
  end if;

  new.tagged_chapter = sanitized_tagged_chapter;
  new.unlocked_chapters = (
    select coalesce(
      array_agg(distinct chapter order by array_position(allowed_chapters, chapter)),
      array[]::text[]
    )
    from unnest(coalesce(new.unlocked_chapters, array[]::text[])) as chapter
    where chapter = any (allowed_chapters)
      and chapter <> 'Chapter 1: Algebra 1'
      and (
        sanitized_tagged_chapter is null
        or array_position(allowed_chapters, chapter)
          > array_position(allowed_chapters, sanitized_tagged_chapter)
      )
  );

  return new;
end;
$$;
