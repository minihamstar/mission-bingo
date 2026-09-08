import { useState } from 'react';
import type { GameState } from '../types';
import BingoHeader from '../components/bingo/BingoHeader';
import BingoBoard from '../components/bingo/BingoBoard';
import BingoCelebration from '../components/bingo/BingoCelebration';
import MissionModal from '../components/mission/MissionModal';

interface BingoPageProps {
  gameState: GameState;
  onCompleteMission: (missionId: string, photoDataUrl: string, comment: string) => void;
  celebrationBingoCount: number | null;
  onDismissCelebration: () => void;
  saveError: boolean;
}

export default function BingoPage({
  gameState,
  onCompleteMission,
  celebrationBingoCount,
  onDismissCelebration,
  saveError,
}: BingoPageProps) {
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  const selectedMission = gameState.missions.find((m) => m.id === selectedMissionId) ?? null;
  const selectedCompletion =
    gameState.completions.find((c) => c.missionId === selectedMissionId) ?? null;

  const handleComplete = (missionId: string, photoDataUrl: string, comment: string) => {
    onCompleteMission(missionId, photoDataUrl, comment);
    setSelectedMissionId(null);
  };

  return (
    <div className="bingo-page">
      {saveError && (
        <p className="save-error-banner">
          ⚠️ 저장 공간이 부족해서 최근 진행 상황이 저장되지 않았을 수 있어요. 사진 용량을 확인하거나
          브라우저 저장공간을 정리해주세요.
        </p>
      )}

      <BingoHeader
        participantName={gameState.participantName}
        completedCount={gameState.completions.length}
        totalCount={gameState.missions.length}
        bingoCount={gameState.bingoCount}
      />

      <BingoBoard
        missions={gameState.missions}
        completions={gameState.completions}
        onCellClick={setSelectedMissionId}
      />

      <MissionModal
        mission={selectedMission}
        completion={selectedCompletion}
        isOpen={selectedMissionId !== null}
        onClose={() => setSelectedMissionId(null)}
        onComplete={handleComplete}
      />

      <BingoCelebration bingoNumber={celebrationBingoCount} onDismiss={onDismissCelebration} />
    </div>
  );
}
