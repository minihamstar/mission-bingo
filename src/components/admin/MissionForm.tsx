import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Mission } from '../../types';
import Button from '../common/Button';

export interface MissionFormData {
  title: string;
  description: string;
  howTo: string;
  completionCondition: string;
}

interface MissionFormProps {
  /** 값이 있으면 "수정" 모드, 없으면 "추가" 모드입니다 */
  initialMission?: Mission;
  onSubmit: (data: MissionFormData) => void;
  onCancel: () => void;
}

/** 미션 추가/수정에 공통으로 쓰는 입력 폼입니다 */
export default function MissionForm({ initialMission, onSubmit, onCancel }: MissionFormProps) {
  const [title, setTitle] = useState(initialMission?.title ?? '');
  const [description, setDescription] = useState(initialMission?.description ?? '');
  const [howTo, setHowTo] = useState(initialMission?.howTo ?? '');
  const [completionCondition, setCompletionCondition] = useState(
    initialMission?.completionCondition ?? '',
  );

  const canSubmit = title.trim().length > 0 && description.trim().length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      howTo: howTo.trim(),
      completionCondition: completionCondition.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="admin-mission-form">
      <div className="admin-form-field">
        <label htmlFor="mission-title">미션 제목</label>
        <input
          id="mission-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={30}
          placeholder="예: 다른 팀 직원에게 먼저 인사하기"
        />
      </div>

      <div className="admin-form-field">
        <label htmlFor="mission-description">설명</label>
        <textarea
          id="mission-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
        />
      </div>

      <div className="admin-form-field">
        <label htmlFor="mission-howto">수행 방법</label>
        <textarea
          id="mission-howto"
          value={howTo}
          onChange={(event) => setHowTo(event.target.value)}
          rows={2}
        />
      </div>

      <div className="admin-form-field">
        <label htmlFor="mission-condition">완료 조건</label>
        <textarea
          id="mission-condition"
          value={completionCondition}
          onChange={(event) => setCompletionCondition(event.target.value)}
          rows={2}
        />
      </div>

      <div className="admin-form-actions">
        <Button type="submit" disabled={!canSubmit}>
          {initialMission ? '수정 완료' : '추가하기'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          취소
        </Button>
      </div>
    </form>
  );
}
