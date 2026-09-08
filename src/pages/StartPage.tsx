import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from '../components/common/Button';

interface StartPageProps {
  /** 팀 이름을 확정하고 게임을 시작할 때 호출됩니다 */
  onStart: (participantName: string) => void;
}

export default function StartPage({ onStart }: StartPageProps) {
  const [teamName, setTeamName] = useState('');

  const canStart = teamName.trim().length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canStart) return;
    onStart(teamName.trim());
  };

  return (
    <div className="start-page">
      <div className="start-card">
        <h1 className="start-title">🎯 미션 빙고</h1>
        <p className="start-description">
          교육 기간 동안 다양한 미션을 수행하며
          <br />
          동료, 선배와 함께 즐거운 추억을 만들어보세요!
        </p>

        <form onSubmit={handleSubmit} className="start-form">
          <label htmlFor="teamName" className="start-label">
            팀 이름을 입력해주세요
          </label>
          <input
            id="teamName"
            type="text"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            placeholder="예: 1조 파이팅"
            className="start-input"
            maxLength={20}
            autoComplete="off"
          />

          <Button type="submit" disabled={!canStart} className="start-button">
            빙고 시작하기
          </Button>
        </form>
      </div>
    </div>
  );
}
