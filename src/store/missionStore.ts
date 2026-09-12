import type { Mission } from '../types';
import { missions as defaultMissions } from '../data/missions';
import { supabase } from '../lib/supabaseClient';

// ─────────────────────────────────────────────────────────
// "미션 목록을 어디에 저장할 것인가"를 이 파일 안에만 모아뒀습니다.
// data/missions.ts의 배열은 "처음 시작할 때의 기본값"일 뿐이고,
// 관리자 페이지에서 추가/수정/삭제/활성-비활성한 내용은 여기를 통해
// localStorage에 저장됩니다. 나중에 서버(DB)로 바꿀 때는 이 파일 안의
// 구현만 API 호출로 교체하면 되고, 이 함수들을 쓰는 코드는 그대로 두어도 됩니다.
// ─────────────────────────────────────────────────────────

const STORAGE_KEY = 'mission-bingo:missions';

/** Supabase의 snake_case 행을 프론트엔드의 camelCase Mission 타입으로 변환합니다. */
function mapRowToMission(row: any): Mission {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    howTo: row.how_to ?? row.howTo ?? '',
    completionCondition: row.completion_condition ?? row.completionCondition ?? '',
    isActive: row.is_active ?? row.isActive ?? true,
  };
}

/** Mission 타입(camelCase)을 Supabase missions 테이블 컬럼(snake_case)으로 변환합니다. */
function mapMissionToRow(mission: Mission) {
  return {
    id: mission.id,
    title: mission.title,
    description: mission.description,
    how_to: mission.howTo,
    completion_condition: mission.completionCondition,
    is_active: mission.isActive,
  };
}

/** 저장된 미션 목록을 불러옵니다. 저장된 게 없으면 기본 미션 목록으로 시작합니다 */
export function loadMissions(): Mission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Mission[];
  } catch (error) {
    console.warn('저장된 미션 데이터를 불러오지 못했습니다. 기본 미션으로 시작합니다:', error);
  }
  saveMissions(defaultMissions);
  return defaultMissions;
}

/** 미션 목록 전체를 저장합니다 */
export function saveMissions(missions: Mission[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
    return true;
  } catch (error) {
    console.error('미션 데이터를 저장하지 못했습니다:', error);
    return false;
  }
}

/** 서버에서 미션 목록을 불러옵니다. 실패하면 로컬값을 반환합니다. */
export async function fetchMissionsFromServer(): Promise<Mission[]> {
  try {
    const { data, error } = await supabase.from('missions').select('*').order('created_at', { ascending: true });
    if (error) {
      console.warn('서버에서 미션을 불러오지 못했습니다:', error);
      return loadMissions();
    }
    if (!data || data.length === 0) {
      // 서버에 데이터가 없으면 로컬 기본값 사용
      return loadMissions();
    }
    return data.map(mapRowToMission);
  } catch (e) {
    console.warn('서버 미션 조회 중 오류:', e);
    return loadMissions();
  }
}

/** 서버에 미션 목록을 저장(업서트)합니다. 에러 발생 시 false를 반환합니다. */
export async function saveMissionsToServer(missions: Mission[]): Promise<boolean> {
  try {
    // upsert로 id 기준으로 갱신/삽입
    const { error } = await supabase.from('missions').upsert(missions.map(mapMissionToRow));
    if (error) {
      console.error('서버에 미션을 저장하지 못했습니다:', error);
      return false;
    }
    // 성공 시 로컬에도 저장해 둡니다.
    saveMissions(missions);
    return true;
  } catch (e) {
    console.error('서버 미션 저장 중 오류:', e);
    return false;
  }
}

/** 배열을 무작위로 섞은 새 배열을 반환합니다 (Fisher-Yates) */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** 활성 미션을 무작위로 섞어 16개를 서버에서 불러옵니다. 실패하면 로컬에서 대체됩니다. */
export async function getBoardMissionsFromServer(): Promise<Mission[]> {
  const missions = await fetchMissionsFromServer();
  return shuffle(missions.filter((m) => m.isActive)).slice(0, 16);
}

/** 활성화된 미션 중 앞에서부터 16개를 뽑아 빙고판을 구성합니다 */
export function getBoardMissions(): Mission[] {
  return loadMissions().filter((mission) => mission.isActive).slice(0, 16);
}

/** 새 미션에 쓸, 다른 것과 겹치지 않는 id를 만듭니다 */
export function generateMissionId(): string {
  return `mission-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
