import type { Mission, MissionCompletion } from '../../types';

interface BingoCellProps {
  mission: Mission;
  completion: MissionCompletion | null;
  onClick: () => void;
}

/**
 * 빙고판 한 칸.
 * 미완료: 미션 제목만 보여줍니다.
 * 완료: 제출한 인증사진이 칸을 가득 채우고, 그 위에 체크 표시가 보입니다.
 */
export default function BingoCell({ mission, completion, onClick }: BingoCellProps) {
  const isCompleted = completion !== null;

  return (
    <button
      type="button"
      className={`bingo-cell${isCompleted ? ' bingo-cell-completed' : ''}`}
      onClick={onClick}
      aria-label={`${mission.title}${isCompleted ? ' (완료됨, 눌러서 인증사진과 소감 보기)' : ' (미완료, 눌러서 미션 확인하기)'}`}
      style={completion ? { backgroundImage: `url(${completion.photoDataUrl})` } : undefined}
    >
      {isCompleted ? (
        <span className="bingo-cell-overlay">
          <span className="bingo-cell-check">✓</span>
        </span>
      ) : (
        <span className="bingo-cell-title">{mission.title}</span>
      )}
    </button>
  );
}
