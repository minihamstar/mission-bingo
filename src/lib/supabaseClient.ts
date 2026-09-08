import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────
// Supabase(백엔드/DB) 연결 지점입니다. 실제 주소와 키는 .env 파일에서
// 가져옵니다 (.env.example을 복사해서 .env를 만들고 값을 채워주세요).
// 이 파일 하나만 있으면 store/gameStorage.ts, store/missionStore.ts에서
// 똑같은 supabase 객체를 가져다 씁니다.
// ─────────────────────────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // 개발 중 .env 설정을 깜빡했을 때 바로 알아챌 수 있도록 경고를 띄웁니다.
  console.warn(
    '[supabaseClient] .env에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY가 설정되지 않았어요. ' +
      '.env.example을 복사해서 .env를 만들고 Supabase 프로젝트 값을 채워주세요.',
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');
