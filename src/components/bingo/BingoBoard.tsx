import type { Mission, MissionCompletion } from '../../types';
import { useState } from 'react';
import BingoCell from './BingoCell';

interface BingoBoardProps {
  missions: Mission[];
  completions: MissionCompletion[];
  onCellClick: (missionId: string) => void;
}

/** 미션 16개를 4x4 그리드로 배치합니다 */
export default function BingoBoard({ missions, completions, onCellClick }: BingoBoardProps) {
  const [toast, setToast] = useState<string | null>(null);

  const handleCaptureClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement | null;
    const btn = target?.closest('button[data-mission-id]') as HTMLButtonElement | null;
    if (btn) {
      const id = btn.dataset.missionId ?? 'unknown';
      setToast(`tapped ${id}`);
      window.setTimeout(() => setToast(null), 1200);
    }
  };

  return (
    <div className="bingo-board" onClickCapture={handleCaptureClick}>
      {missions.map((mission) => {
        const completion = completions.find((c) => c.missionId === mission.id) ?? null;
        return (
          <BingoCell
            key={mission.id}
            mission={mission}
            completion={completion}
            onClick={() => onCellClick(mission.id)}
          />
        );
      })}
      {toast && <div className="bingo-debug-toast">{toast}</div>}
    </div>
  );
}
