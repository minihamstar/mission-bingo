interface BingoHeaderProps {
  participantName: string;
  completedCount: number;
  totalCount: number;
  bingoCount: number;
  onHome: () => void;
}

/** 빙고 화면 상단에 팀 이름, 완료 미션 수, 빙고 수, 진행률을 보여줍니다 */
export default function BingoHeader({
  participantName,
  completedCount,
  totalCount,
  bingoCount,
  onHome,
}: BingoHeaderProps) {
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bingo-header">
      <div className="bingo-header-top">
        <div className="bingo-header-team">{participantName} 팀</div>
        <button type="button" className="bingo-header-home" onClick={onHome} aria-label="처음 화면으로">
          🏠 처음으로
        </button>
      </div>

      <div className="bingo-header-stats">
        <div className="bingo-stat">
          <span className="bingo-stat-value">
            {completedCount}/{totalCount}
          </span>
          <span className="bingo-stat-label">완료 미션</span>
        </div>
        <div className="bingo-stat">
          <span className="bingo-stat-value">{bingoCount}</span>
          <span className="bingo-stat-label">빙고</span>
        </div>
        <div className="bingo-stat">
          <span className="bingo-stat-value">{progress}%</span>
          <span className="bingo-stat-label">진행률</span>
        </div>
      </div>

      <div className="bingo-progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="bingo-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
