import type { GameState } from '../types';
import { supabase } from '../lib/supabaseClient';

// ─────────────────────────────────────────────────────────
// "게임 상태를 어디에 저장할 것인가"를 이 파일 안에만 모아뒀습니다.
// 지금은 localStorage(브라우저 저장소)를 사용하지만, 나중에 서버(DB)로
// 바꿀 때는 이 파일 안의 함수 구현만 API 호출로 교체하면 됩니다.
// loadGame / saveGame을 사용하는 코드(useGameState)는 그대로 두어도 됩니다.
// ─────────────────────────────────────────────────────────

const STORAGE_KEY = 'mission-bingo:game-state';

/** 저장된 게임 상태를 불러옵니다. 저장된 게 없거나 형식이 깨졌으면 null을 반환합니다 */
export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch (error) {
    console.warn('저장된 게임 데이터를 불러오지 못했습니다:', error);
    return null;
  }
}

/**
 * 게임 상태를 저장합니다.
 * 인증사진 용량 때문에 브라우저 저장 공간이 꽉 찰 수도 있는데, 그런 경우에도
 * 앱이 멈추지 않도록 에러를 잡아서 성공 여부(boolean)만 반환합니다.
 */
export function saveGame(gameState: GameState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    // 백그라운드에서 서버에 업데이트를 시도합니다. 서버에 저장된 게임 ID가
    // 로컬에 있으면 업데이트하고, 없으면 생략합니다.
    (async () => {
      const serverIdKey = `${STORAGE_KEY}:serverId`;
      const serverId = localStorage.getItem(serverIdKey);
      try {
        if (serverId) {
          await updateGameOnServer(serverId, gameState as any);
        }
      } catch (e) {
        // 서버 업데이트 실패는 로컬에는 영향 없음
        console.warn('서버 게임 업데이트 중 오류:', e);
      }
    })();
    return true;
  } catch (error) {
    console.error('게임 데이터를 저장하지 못했습니다 (저장 공간 부족일 수 있어요):', error);
    return false;
  }
}

/** 서버에 게임을 생성합니다. 에러가 나도 로컬 저장은 계속 유지됩니다. */
export async function createGameOnServer(gameState: GameState) {
  try {
    const payload = {
      participant_name: gameState.participantName,
      missions: gameState.missions,
      completions: gameState.completions,
      bingo_count: gameState.bingoCount,
      game_started_at: gameState.gameStartedAt,
      game_completed_at: gameState.gameCompletedAt,
    };
    const { data, error } = await supabase.from('games').insert(payload).select().single();
    if (error) throw error;
    // 서버에서 받은 id를 로컬에 저장해 두면 이후 업데이트에 사용합니다.
    try {
      const serverIdKey = `${STORAGE_KEY}:serverId`;
      if (data && data.id) localStorage.setItem(serverIdKey, data.id);
    } catch (e) {
      // 로컬 저장 실패는 치명적이지 않음
      console.warn('server id를 로컬에 저장하지 못했습니다:', e);
    }
    return data;
  } catch (e) {
    console.warn('서버에 게임을 생성하지 못했습니다:', e);
    return null;
  }
}

/** 서버의 게임을 업데이트합니다 (id로). */
export async function updateGameOnServer(gameId: string, patch: Partial<GameState>) {
  try {
    const payload: any = {};
    if (patch.missions) payload.missions = patch.missions;
    if (patch.completions) payload.completions = patch.completions;
    if (typeof patch.bingoCount === 'number') payload.bingo_count = patch.bingoCount;
    if (patch.gameCompletedAt) payload.game_completed_at = patch.gameCompletedAt;

    const { data, error } = await supabase.from('games').update(payload).eq('id', gameId).select().single();
    if (error) throw error;
    return data;
  } catch (e) {
    console.warn('서버 게임 업데이트 실패:', e);
    return null;
  }
}

/** 서버에 저장된 게임 목록을 불러옵니다. */
export async function fetchGamesFromServer() {
  try {
    const { data, error } = await supabase.from('games').select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    // Supabase는 snake_case 필드명을 사용하므로, 프론트엔드의 GameState 타입(camelCase)에 맞게 매핑합니다.
    const mapped = (data || []).map((row: any) => {
      return {
        participantName: row.participant_name ?? row.participantName ?? '',
        missions: row.missions ?? [],
        completions: row.completions ?? [],
        bingoCount: typeof row.bingo_count === 'number' ? row.bingo_count : row.bingoCount ?? 0,
        gameStartedAt: row.game_started_at ?? row.gameStartedAt ?? '',
        gameCompletedAt: row.game_completed_at ?? row.gameCompletedAt ?? null,
      } as GameState;
    });
    return mapped;
  } catch (e) {
    console.warn('서버에서 게임 목록을 불러오지 못했습니다:', e);
    return [];
  }
}

/** 저장된 게임 데이터를 지웁니다 (새 게임을 시작할 때 등에 사용) */
export function clearGame(): void {
  localStorage.removeItem(STORAGE_KEY);
}
