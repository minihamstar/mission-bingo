import { useState } from 'react';
import type { GameState } from '../types';
import BingoHeader from '../components/bingo/BingoHeader';
import BingoBoard from '../components/bingo/BingoBoard';
import BingoCelebration from '../components/bingo/BingoCelebration';
import MissionModal from '../components/mission/MissionModal';

interface BingoPageProps {
  gameState: GameState;
  onCompleteMission: (missionId: string, photoDataUrl: string, comment: string) => void;
  onEditMission?: (missionId: string, photoDataUrl: string, comment: string) => void;
  onReset: () => void;
  celebrationBingoCount: number | null;
  onDismissCelebration: () => void;
  saveError: boolean;
}

export default function BingoPage({
  gameState,
  onCompleteMission,
  onEditMission,
  onReset,
  celebrationBingoCount,
  onDismissCelebration,
  saveError,
}: BingoPageProps) {
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  const handleHome = () => {
    const confirmed = window.confirm(
      '처음 화면으로 돌아갈까요?\n지금까지 완료한 미션 기록(사진/소감)이 모두 사라지고 되돌릴 수 없어요.',
    );
    if (confirmed) onReset();
  };

  const selectedMission = gameState.missions.find((m) => m.id === selectedMissionId) ?? null;
  const selectedCompletion =
    gameState.completions.find((c) => c.missionId === selectedMissionId) ?? null;

  const handleComplete = (missionId: string, photoDataUrl: string, comment: string) => {
    onCompleteMission(missionId, photoDataUrl, comment);
    setSelectedMissionId(null);
  };

  const handleEdit = (missionId: string, photoDataUrl: string, comment: string) => {
    if (onEditMission) onEditMission(missionId, photoDataUrl, comment);
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
        onHome={handleHome}
      />

      <BingoBoard
        missions={gameState.missions}
        completions={gameState.completions}
        onCellClick={setSelectedMissionId}
      />

      <MissionModal
        mission={selectedMission}
        completion={selectedCompletion}
        participantName={gameState.participantName}
        isOpen={selectedMissionId !== null}
        onClose={() => setSelectedMissionId(null)}
        onComplete={handleComplete}
        onEdit={handleEdit}
      />

      <BingoCelebration bingoNumber={celebrationBingoCount} onDismiss={onDismissCelebration} />
    </div>
  );
}
