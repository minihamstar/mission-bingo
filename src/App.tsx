import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import StartPage from './pages/StartPage';
import BingoPage from './pages/BingoPage';
import CompletePage from './pages/CompletePage';
import AdminHomePage from './pages/admin/AdminHomePage';

function UpdateHelper() {
  const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent);
  const isStandalone = typeof (navigator as any).standalone === 'boolean' ? (navigator as any).standalone : false;

  if (!isMobile) return null;

  const handleForceReload = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) {
          try {
            await r.unregister();
          } catch (e) {}
        }
      }
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          for (const k of keys) {
            try {
              await caches.delete(k);
            } catch (e) {}
          }
        } catch (e) {}
      }
    } catch (e) {}
    try {
      // soft reload
      window.location.reload();
    } catch (e) {}
  };

  return (
    <div style={{ position: 'fixed', bottom: 12, left: 12, right: 12, zIndex: 9999, display: 'flex', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontSize: 13 }}>
        <div style={{ marginBottom: 6 }}>앱이 업데이트되지 않은 경우 아래 버튼으로 강제 갱신하세요.</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={handleForceReload} style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6 }}>업데이트 로드</button>
        </div>
        {isStandalone && <div style={{ marginTop: 6, color: '#666' }}>홈화면으로 추가한 경우 아이콘을 삭제 후 다시 추가하세요.</div>}
      </div>
    </div>
  );
}

function ClickDebugOverlay() {
  const [info, setInfo] = useState<string | null>(null);
  const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent);
  if (!isMobile) return null;

  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const ev = e as MouseEvent & TouchEvent & PointerEvent;
        const target = (ev.target as Element) || null;
        const desc = target ? `${target.tagName.toLowerCase()}${target.className ? ' .' + target.className : ''}${target.id ? ' #' + target.id : ''}` : 'no-target';
        setInfo(`${desc} @ ${Math.round((ev as any).clientX || 0)},${Math.round((ev as any).clientY || 0)}`);
      } catch (e) {
        setInfo('err');
      }
    };
    document.addEventListener('click', handler, true);
    document.addEventListener('touchstart', handler, true);
    return () => {
      document.removeEventListener('click', handler, true);
      document.removeEventListener('touchstart', handler, true);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 99999 }}>
      <div style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 8px', borderRadius: 6, fontSize: 12, maxWidth: 220 }}>{info ?? 'no clicks yet'}</div>
    </div>
  );
}

/**
 * 참여자가 보는 화면 전체 흐름입니다.
 * - 아직 게임을 시작하지 않았으면 시작 화면
 * - 게임이 끝났으면(모든 미션 완료) 최종 완료 화면
 *   단, 마지막 미션으로 빙고가 새로 완성된 경우엔 축하 애니메이션을
 *   먼저 보여주고, 그게 사라진 뒤에 완료 화면으로 넘어갑니다.
 * - 그 외에는 빙고 게임 화면
 */
function ParticipantFlow() {
  const { gameState, startGame, completeMission, celebrationBingoCount, dismissCelebration, saveError } =
    useGameState();

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
      celebrationBingoCount={celebrationBingoCount}
      onDismissCelebration={dismissCelebration}
      saveError={saveError}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <UpdateHelper />
      <ClickDebugOverlay />
      <Routes>
        <Route path="/" element={<ParticipantFlow />} />
        <Route path="/admin" element={<AdminHomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
