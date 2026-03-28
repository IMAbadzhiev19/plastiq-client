create table if not exists profiles (
  id text primary key,
  external_key text not null unique,
  display_name text not null default 'Eco Learner',
  joined_on text not null,
  streak_count integer not null default 0,
  last_correct_answer_on text,
  total_products_scanned integer not null default 0,
  total_correct_answers integer not null default 0,
  created_at text not null,
  updated_at text not null
);

create table if not exists inventory_items (
  id text primary key,
  profile_id text not null references profiles(id) on delete cascade,
  product_name text not null,
  plastic_digit integer not null check (plastic_digit between 1 and 7),
  plastic_code text not null,
  plastic_name text not null,
  image_path text,
  recyclable boolean not null default false,
  scanned_at text not null
);

create table if not exists unlocked_levels (
  profile_id text not null references profiles(id) on delete cascade,
  plastic_digit integer not null check (plastic_digit between 1 and 7),
  unlocked_at text not null,
  primary key (profile_id, plastic_digit)
);

create table if not exists practice_questions (
  id text primary key,
  plastic_digit integer not null check (plastic_digit between 1 and 7),
  prompt text not null,
  options text not null,
  correct_answer text not null,
  explanation text not null,
  created_at text not null
);

create table if not exists daily_question_assignments (
  id text primary key,
  profile_id text not null references profiles(id) on delete cascade,
  assignment_date text not null,
  question_id text not null references practice_questions(id) on delete cascade,
  position smallint not null,
  created_at text not null,
  unique (profile_id, assignment_date, question_id),
  unique (profile_id, assignment_date, position)
);

create table if not exists practice_attempts (
  id text primary key,
  profile_id text not null references profiles(id) on delete cascade,
  assignment_date text not null,
  question_id text not null references practice_questions(id) on delete cascade,
  selected_answer text not null,
  is_correct boolean not null default false,
  answered_at text not null,
  unique (profile_id, assignment_date, question_id)
);

create index if not exists inventory_items_profile_scanned_idx on inventory_items(profile_id, scanned_at desc);
create index if not exists assignments_profile_date_idx on daily_question_assignments(profile_id, assignment_date);
create index if not exists attempts_profile_date_idx on practice_attempts(profile_id, assignment_date);
