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
}

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
  };
}

export default function AdminParticipantsPage() {
  const [rows, setRows] = useState<ParticipantRow[]>([]);

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

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">참여자 현황</h2>
      <p className="admin-section-subtitle">
        지금은 이 기기(브라우저)에 저장된 진행 상황만 보여줄 수 있어요. 여러 참여자의 현황을 한
        화면에서 모아보려면 서버(DB) 연동이 필요합니다 — 처음 설계 단계에서 안내드렸던 확장 지점이에요.
      </p>

      {rows.length === 0 ? (
        <p className="admin-empty">아직 이 기기에서 진행한 게임 기록이 없어요.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>팀 이름</th>
                <th>완료 미션</th>
                <th>빙고 수</th>
                <th>진행률</th>
                <th>완료 여부</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.participantName}>
                  <td>{row.participantName}</td>
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
