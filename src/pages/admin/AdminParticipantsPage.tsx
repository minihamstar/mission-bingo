import { useEffect, useState } from 'react';
import type { GameState } from '../../types';
import { fetchGamesFromServer } from '../../store/gameStorage';

interface ParticipantRow {
  participantName: string;
  completedCount: number;
  totalCount: number;
  bingoCount: number;
  progress: number;
  isCompleted: boolean;
  isTest: boolean;
}

type FilterMode = 'real' | 'test' | 'all';

function toRow(gameState: GameState): ParticipantRow {
  const totalCount = gameState.missions.length;
  const completedCount = gameState.completions.length;
  return {
    participantName: gameState.participantName,
    completedCount,
    totalCount,
    bingoCount: gameState.bingoCount,
    progress: totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100),
    isCompleted: gameState.gameCompletedAt !== null,
    isTest: gameState.isTest,
  };
}

export default function AdminParticipantsPage() {
  const [rows, setRows] = useState<ParticipantRow[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>('real');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const games = await fetchGamesFromServer();
      if (!mounted) return;
      setRows(games.map((g) => toRow(g)));
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const visibleRows = rows.filter((row) => {
    if (filterMode === 'real') return !row.isTest;
    if (filterMode === 'test') return row.isTest;
    return true;
  });

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">참여자 현황</h2>
      <p className="admin-section-subtitle">
        주소 뒤에 <code>?test=1</code>을 붙여 시작한 게임은 "테스트"로 표시됩니다. 실제 참여자는
        일반 링크로 접속하면 자동으로 "실제 참여"로 기록돼요.
      </p>

      <div className="admin-filter-tabs">
        <button
          type="button"
          className={`admin-filter-tab${filterMode === 'real' ? ' admin-filter-tab-active' : ''}`}
          onClick={() => setFilterMode('real')}
        >
          실제 참여만
        </button>
        <button
          type="button"
          className={`admin-filter-tab${filterMode === 'test' ? ' admin-filter-tab-active' : ''}`}
          onClick={() => setFilterMode('test')}
        >
          테스트만
        </button>
        <button
          type="button"
          className={`admin-filter-tab${filterMode === 'all' ? ' admin-filter-tab-active' : ''}`}
          onClick={() => setFilterMode('all')}
        >
          전체
        </button>
      </div>

      {visibleRows.length === 0 ? (
        <p className="admin-empty">표시할 게임 기록이 없어요.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>팀 이름</th>
                <th>구분</th>
                <th>완료 미션</th>
                <th>빙고 수</th>
                <th>진행률</th>
                <th>완료 여부</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.participantName}>
                  <td>{row.participantName}</td>
                  <td>
                    <span
                      className={`admin-status-badge${row.isTest ? ' admin-status-test' : ''}`}
                    >
                      {row.isTest ? '테스트' : '실제 참여'}
                    </span>
                  </td>
                  <td>
                    {row.completedCount}/{row.totalCount}
                  </td>
                  <td>{row.bingoCount}</td>
                  <td>{row.progress}%</td>
                  <td>
                    <span
                      className={`admin-status-badge${row.isCompleted ? ' admin-status-done' : ''}`}
                    >
                      {row.isCompleted ? '완료' : '진행 중'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
