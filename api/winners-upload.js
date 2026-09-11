import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────
// /winners 페이지의 "관리자 모드"에서 엑셀 업로드를 저장할 때 호출되는
// 서버 전용 함수입니다. 브라우저에는 절대 노출되지 않는 service_role 키를
// 여기서만 사용해서, RLS를 우회해 event_winners_data 테이블을 갱신합니다.
//
// 필요한 Vercel 환경변수 (프로젝트 설정 → Environment Variables 에서 추가):
// - VITE_SUPABASE_URL          (이미 설정되어 있음)
// - SUPABASE_SERVICE_ROLE_KEY  (Supabase 대시보드 → Project Settings → API → service_role)
// - ADMIN_UPLOAD_PASSWORD      (관리자만 아는 업로드 비밀번호, 직접 정해서 등록)
// ─────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const { password, rows, totalApplicants } = req.body ?? {};

  const adminPassword = process.env.ADMIN_UPLOAD_PASSWORD;
  if (!adminPassword) {
    res.status(500).json({ error: 'server_misconfigured', message: 'ADMIN_UPLOAD_PASSWORD가 설정되지 않았습니다.' });
    return;
  }
  if (password !== adminPassword) {
    res.status(401).json({ error: 'invalid_password' });
    return;
  }

  if (!Array.isArray(rows)) {
    res.status(400).json({ error: 'invalid_rows' });
    return;
  }
  for (const row of rows) {
    if (!row || typeof row.name !== 'string' || !row.name.trim()) {
      res.status(400).json({ error: 'invalid_rows', message: '이름이 없는 행이 있습니다.' });
      return;
    }
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    res.status(500).json({ error: 'server_misconfigured', message: 'Supabase 서버 환경변수가 설정되지 않았습니다.' });
    return;
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { error } = await admin
    .from('event_winners_data')
    .upsert({
      id: 1,
      rows,
      total_applicants: Number.isFinite(totalApplicants) ? totalApplicants : rows.length,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    res.status(500).json({ error: 'save_failed', message: error.message });
    return;
  }

  res.status(200).json({ ok: true, count: rows.length });
}
