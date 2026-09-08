import type { GameState } from '../types';

interface CompletePageProps {
  gameState: GameState;
}

/** 16개 미션을 모두 완료했을 때 보여주는 최종 화면입니다 */
export default function CompletePage({ gameState }: CompletePageProps) {
  return (
    <div className="complete-page">
      <div className="complete-card">
        <div className="complete-emoji">🏆</div>
        <h1 className="complete-title">모든 미션 완료!</h1>
        <p className="complete-description">
          {gameState.participantName} 팀, 축하합니다!
          <br />
          16개 미션을 모두 완료하고 빙고 {gameState.bingoCount}개를 달성했어요.
        </p>
      </div>
    </div>
  );
}
