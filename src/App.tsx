import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useGameState } from './hooks/useGameState';
import ErrorBoundary from './components/common/ErrorBoundary';
import StartPage from './pages/StartPage';
import BingoPage from './pages/BingoPage';
import CompletePage from './pages/CompletePage';
import AdminHomePage from './pages/admin/AdminHomePage';
import WinnersPage from './pages/WinnersPage';


/**
 * 참여자가 보는 화면 전체 흐름입니다.
 * - 아직 게임을 시작하지 않았으면 시작 화면
 * - 게임이 끝났으면(모든 미션 완료) 최종 완료 화면
 *   단, 마지막 미션으로 빙고가 새로 완성된 경우엔 축하 애니메이션을
 *   먼저 보여주고, 그게 사라진 뒤에 완료 화면으로 넘어갑니다.
 * - 그 외에는 빙고 게임 화면
 */
function ParticipantFlow() {
  const {
    gameState,
    startGame,
    completeMission,
    editCompletion,
    resetGame,
    celebrationBingoCount,
    dismissCelebration,
    saveError,
  } = useGameState();

  if (!gameState) {
    return <StartPage onStart={startGame} />;
  }

  const shouldShowCompletePage = gameState.gameCompletedAt !== null && celebrationBingoCount === null;

  if (shouldShowCompletePage) {
    return <CompletePage gameState={gameState} />;
  }

  return (
    <BingoPage
      gameState={gameState}
      onCompleteMission={completeMission}
      onEditMission={editCompletion}
      onReset={resetGame}
      celebrationBingoCount={celebrationBingoCount}
      onDismissCelebration={dismissCelebration}
      saveError={saveError}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<ParticipantFlow />} />
          <Route path="/admin" element={<AdminHomePage />} />
          <Route path="/winners" element={<WinnersPage />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
