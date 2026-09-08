import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameState, MissionCompletion } from '../types';
import { getBoardMissionsFromServer } from '../store/missionStore';
import { countBingoLines } from '../utils/bingoChecker';
import { loadGame, saveGame } from '../store/gameStorage';

// ─────────────────────────────────────────────────────────
// 게임 상태를 만들고 다루는 로직을 한 곳에 모아둔 훅(hook)입니다.
//
// STEP 7부터는 gameStorage.ts를 통해 localStorage에 저장/불러오기를 합니다.
// 나중에 서버(DB)로 바꿀 때는 gameStorage.ts 안의 구현만 API 호출로 교체하면
// 되고, 이 훅을 사용하는 화면 코드(StartPage, BingoPage 등)는 그대로 두어도 됩니다.
// ─────────────────────────────────────────────────────────

export function useGameState() {
  // 처음 렌더링될 때 딱 한 번, 저장된 게임이 있으면 그걸 불러옵니다.
  const [gameState, setGameState] = useState<GameState | null>(() => loadGame());
  // "방금 새로 완성된 빙고가 몇 번째인지" — 축하 애니메이션을 띄우는 용도로만 씁니다.
  const [celebrationBingoCount, setCelebrationBingoCount] = useState<number | null>(null);
  // 저장이 실패했는지(주로 브라우저 저장 공간 부족) 여부. 화면에 안내 문구를 띄우는 데 씁니다.
  const [saveError, setSaveError] = useState(false);
  const previousBingoCountRef = useRef(gameState?.bingoCount ?? 0);

  /** 팀 이름을 받아 새 게임을 시작합니다 (빙고판에 쓰일 미션 16개를 배정) */
  const startGame = useCallback(async (participantName: string) => {
    previousBingoCountRef.current = 0;
    const missions = await getBoardMissionsFromServer();
    const initialState: GameState = {
      participantName,
      missions,
      completions: [],
      bingoCount: 0,
      gameStartedAt: new Date().toISOString(),
      gameCompletedAt: null,
    };
    setGameState(initialState);
    // 서버에 게임 생성 요청(비동기)
    try {
      // import dynamically to avoid circular import issues
      const { createGameOnServer } = await import('../store/gameStorage');
      createGameOnServer(initialState);
    } catch (e) {
      console.warn('게임을 서버에 생성하는 중 오류 발생:', e);
    }
  }, []);

  /** 미션 하나를 완료 처리하고, 빙고 수 / 전체 완료 여부를 함께 갱신합니다 */
  const completeMission = useCallback(
    (missionId: string, photoDataUrl: string, comment: string) => {
      setGameState((prev) => {
        if (!prev) return prev;
        // 이미 완료된 미션이면 중복으로 추가하지 않습니다.
        if (prev.completions.some((c) => c.missionId === missionId)) return prev;

        const newCompletion: MissionCompletion = {
          missionId,
          photoDataUrl,
          comment,
          completedAt: new Date().toISOString(),
        };
        const completions = [...prev.completions, newCompletion];

        const completedIds = new Set(completions.map((c) => c.missionId));
        const isCompleted = prev.missions.map((mission) => completedIds.has(mission.id));
        const bingoCount = countBingoLines(isCompleted);
        const allMissionsCompleted = completions.length === prev.missions.length;

        return {
          ...prev,
          completions,
          bingoCount,
          gameCompletedAt: allMissionsCompleted
            ? (prev.gameCompletedAt ?? new Date().toISOString())
            : prev.gameCompletedAt,
        };
      });
    },
    [],
  );

    /** 이미 완료된 미션의 인증(사진/소감)을 수정합니다. */
    const editCompletion = useCallback((missionId: string, photoDataUrl: string, comment: string) => {
      setGameState((prev) => {
        if (!prev) return prev;
        const completions = prev.completions.map((c) =>
          c.missionId === missionId
            ? { ...c, photoDataUrl, comment, completedAt: new Date().toISOString() }
            : c,
        );

        const completedIds = new Set(completions.map((c) => c.missionId));
        const isCompleted = prev.missions.map((mission) => completedIds.has(mission.id));
        const bingoCount = countBingoLines(isCompleted);

        return {
          ...prev,
          completions,
          bingoCount,
        };
      });
    }, []);

  // gameState.bingoCount가 늘어난 순간을 감지해서 축하 애니메이션을 트리거합니다.
  // (setGameState의 업데이트 함수 안에서 직접 다른 상태를 바꾸면 예상치 못한 동작이
  //  생길 수 있어서, 이렇게 별도의 useEffect로 분리했습니다.)
  useEffect(() => {
    if (!gameState) return;
    if (gameState.bingoCount > previousBingoCountRef.current) {
      setCelebrationBingoCount(gameState.bingoCount);
    }
    previousBingoCountRef.current = gameState.bingoCount;
  }, [gameState?.bingoCount]);

  // gameState가 바뀔 때마다 localStorage에 저장해서, 새로고침해도 유지되게 합니다.
  useEffect(() => {
    if (!gameState) return;
    const success = saveGame(gameState);
    setSaveError(!success);
  }, [gameState]);

  const dismissCelebration = useCallback(() => setCelebrationBingoCount(null), []);

  return {
    gameState,
    startGame,
    completeMission,
    editCompletion,
    celebrationBingoCount,
    dismissCelebration,
    saveError,
    setGameState,
  };
}
