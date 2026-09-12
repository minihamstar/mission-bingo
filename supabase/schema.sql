-- ─────────────────────────────────────────────────────────
-- 미션 빙고 - Supabase 테이블 생성 스크립트
--
-- 사용법: Supabase 대시보드 → 왼쪽 메뉴 "SQL Editor" → "New query" →
-- 이 파일 내용을 전부 붙여넣고 "Run" 버튼을 누르면 됩니다. (딱 한 번만 실행하면 됩니다)
-- ─────────────────────────────────────────────────────────

-- 1) 미션 목록 테이블 (관리자 페이지에서 추가/수정/삭제/활성-비활성 관리)
create table if not exists public.missions (
  id text primary key,
  title text not null,
  description text not null default '',
  how_to text not null default '',
  completion_condition text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2) 참여자(팀)별 게임 진행 상태 테이블
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  participant_name text not null,
  missions jsonb not null default '[]'::jsonb,
  completions jsonb not null default '[]'::jsonb,
  bingo_count integer not null default 0,
  game_started_at timestamptz not null default now(),
  game_completed_at timestamptz,
  updated_at timestamptz not null default now(),
  is_test boolean not null default false
);

-- 이미 games 테이블이 있는 환경(기존 운영 DB)에도 안전하게 반영되도록 별도로 추가합니다.
alter table public.games add column if not exists is_test boolean not null default false;

-- 3) 보안 설정 (RLS)
-- 이 앱은 로그인 없이 누구나 참여하는 사내 교육용 도구라서, "링크를 아는 사람은
-- 읽고 쓸 수 있다"는 단순한 정책을 씁니다. 로그인/권한 구분이 필요해지면
-- 이 정책을 더 세밀하게 바꿀 수 있습니다.
alter table public.missions enable row level security;
alter table public.games enable row level security;

drop policy if exists "missions_all_access" on public.missions;
create policy "missions_all_access" on public.missions
  for all using (true) with check (true);

drop policy if exists "games_all_access" on public.games;
create policy "games_all_access" on public.games
  for all using (true) with check (true);

-- 4) updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_games_updated_at on public.games;
create trigger set_games_updated_at
  before update on public.games
  for each row execute function public.set_updated_at();
