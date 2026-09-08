import type { Mission, MissionCompletion } from '../../types';
import BingoCell from './BingoCell';

interface BingoBoardProps {
  missions: Mission[];
  completions: MissionCompletion[];
  onCellClick: (missionId: string) => void;
}

/** 미션 16개를 4x4 그리드로 배치합니다 */
export default function BingoBoard({ missions, completions, onCellClick }: BingoBoardProps) {
  return (
    <div className="bingo-board">
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
    </div>
  );
}
