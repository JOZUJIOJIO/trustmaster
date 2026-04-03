-- Health assessments (questionnaire results)
create table if not exists health_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,
  constitution_type text not null,
  constitution_subtype text not null,
  secondary_type text,
  five_elements_score jsonb not null,
  nine_constitutions_score jsonb not null,
  bazi_chart_hash text,
  created_at timestamptz not null default now()
);

create index idx_health_assessments_user on health_assessments(user_id);

-- AI-generated health readings cache
create table if not exists health_readings_cache (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references health_assessments(id) on delete cascade,
  reading jsonb not null,
  created_at timestamptz not null default now()
);

create unique index idx_health_readings_assessment on health_readings_cache(assessment_id);

-- Health follow-up conversations
create table if not exists health_conversations (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references health_assessments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  message_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_health_conversations_assessment on health_conversations(assessment_id);

-- Enable RLS
alter table health_assessments enable row level security;
alter table health_readings_cache enable row level security;
alter table health_conversations enable row level security;

-- RLS policies
create policy "Users read own assessments" on health_assessments for select using (auth.uid() = user_id);
create policy "Users insert own assessments" on health_assessments for insert with check (auth.uid() = user_id);

create policy "Users read own readings" on health_readings_cache for select
  using (assessment_id in (select id from health_assessments where user_id = auth.uid()));
create policy "Service inserts readings" on health_readings_cache for insert with check (true);

create policy "Users read own conversations" on health_conversations for select using (auth.uid() = user_id);
create policy "Users update own conversations" on health_conversations for update using (auth.uid() = user_id);
create policy "Users insert own conversations" on health_conversations for insert with check (auth.uid() = user_id);
