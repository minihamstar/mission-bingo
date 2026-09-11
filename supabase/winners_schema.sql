-- ─────────────────────────────────────────────────────────
-- 이벤트 당첨자 조회 페이지(/winners) 데이터 테이블
--
-- 사용법: Supabase 대시보드 → 왼쪽 메뉴 "SQL Editor" → "New query" →
-- 이 파일 내용을 전부 붙여넣고 "Run" 버튼을 누르면 됩니다. (딱 한 번만 실행하면 됩니다)
-- ─────────────────────────────────────────────────────────

-- 명단 전체를 한 행(id=1)에 JSON으로 저장합니다. (명단이 수백 명 수준이라 충분합니다)
create table if not exists public.event_winners_data (
  id integer primary key default 1,
  rows jsonb not null default '[]'::jsonb,
  total_applicants integer not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.event_winners_data (id, rows, total_applicants)
values (1, '[]'::jsonb, 0)
on conflict (id) do nothing;

-- 보안 설정 (RLS)
-- 이 페이지는 인터넷에 공개되는 조회 페이지라서, 누구나 "읽기"는 되지만
-- "쓰기"는 막아둡니다. 명단 업로드는 /api/winners-upload 서버 함수가
-- service_role 키(= RLS를 우회하는 관리자 키)로만 수행합니다.
alter table public.event_winners_data enable row level security;

drop policy if exists "event_winners_data_read" on public.event_winners_data;
create policy "event_winners_data_read" on public.event_winners_data
  for select using (true);

-- insert/update/delete 정책은 일부러 만들지 않습니다.
-- → anon 키(브라우저에 노출되는 키)로는 절대 쓰기가 불가능하고,
--   service_role 키를 쓰는 서버 함수만 수정할 수 있습니다.
