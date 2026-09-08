import { useEffect, useState } from 'react';
import type { Mission } from '../../types';
import {
  loadMissions,
  generateMissionId,
  fetchMissionsFromServer,
  saveMissionsToServer,
} from '../../store/missionStore';
import MissionForm from '../../components/admin/MissionForm';
import type { MissionFormData } from '../../components/admin/MissionForm';
import Button from '../../components/common/Button';

type FormMode = { type: 'closed' } | { type: 'create' } | { type: 'edit'; mission: Mission };

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>(() => loadMissions());
  const [formMode, setFormMode] = useState<FormMode>({ type: 'closed' });

  // 초기 로드: 서버에서 먼저 불러오고, 실패하면 로컬값을 사용합니다.
  useEffect(() => {
    let mounted = true;
    (async () => {
      const serverMissions = await fetchMissionsFromServer();
      if (!mounted) return;
      setMissions(serverMissions);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 미션 목록이 바뀔 때마다 서버에 저장합니다 (비동기).
  useEffect(() => {
    let mounted = true;
    (async () => {
      await saveMissionsToServer(missions);
      if (!mounted) return;
    })();
    return () => {
      mounted = false;
    };
  }, [missions]);

  const handleCreate = (data: MissionFormData) => {
    const newMission: Mission = { ...data, id: generateMissionId(), isActive: true };
    setMissions((prev) => [...prev, newMission]);
    setFormMode({ type: 'closed' });
  };

  const handleUpdate = (missionId: string, data: MissionFormData) => {
    setMissions((prev) => prev.map((m) => (m.id === missionId ? { ...m, ...data } : m)));
    setFormMode({ type: 'closed' });
  };

  const handleDelete = (missionId: string) => {
    setMissions((prev) => prev.filter((m) => m.id !== missionId));
  };

  const handleToggleActive = (missionId: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, isActive: !m.isActive } : m)),
    );
  };

  const activeCount = missions.filter((m) => m.isActive).length;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">미션 관리</h2>
          <p className="admin-section-subtitle">
            활성 미션 {activeCount}개 / 전체 {missions.length}개 · 빙고판에는 활성 미션 중 앞에서부터
            16개가 사용됩니다.
          </p>
        </div>
        {formMode.type === 'closed' && (
          <Button type="button" onClick={() => setFormMode({ type: 'create' })}>
            + 미션 추가
          </Button>
        )}
      </div>

      {formMode.type !== 'closed' && (
        <MissionForm
          key={formMode.type === 'edit' ? formMode.mission.id : 'create'}
          initialMission={formMode.type === 'edit' ? formMode.mission : undefined}
          onCancel={() => setFormMode({ type: 'closed' })}
          onSubmit={(data) => {
            if (formMode.type === 'edit') {
              handleUpdate(formMode.mission.id, data);
            } else {
              handleCreate(data);
            }
          }}
        />
      )}

      <ul className="admin-mission-list">
        {missions.map((mission) => (
          <li
            key={mission.id}
            className={`admin-mission-row${mission.isActive ? '' : ' admin-mission-row-inactive'}`}
          >
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={mission.isActive}
                onChange={() => handleToggleActive(mission.id)}
              />
              <span>{mission.isActive ? '활성' : '비활성'}</span>
            </label>

            <div className="admin-mission-info">
              <div className="admin-mission-title">{mission.title}</div>
              <div className="admin-mission-description">{mission.description}</div>
            </div>

            <div className="admin-mission-actions">
              <button
                type="button"
                className="admin-text-button"
                onClick={() => setFormMode({ type: 'edit', mission })}
              >
                수정
              </button>
              <button
                type="button"
                className="admin-text-button admin-delete-button"
                onClick={() => handleDelete(mission.id)}
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
