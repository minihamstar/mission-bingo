import { useState } from 'react';
import AdminMissionsPage from './AdminMissionsPage';
import AdminParticipantsPage from './AdminParticipantsPage';

type AdminTab = 'missions' | 'participants';

/** /admin 화면. 상단 탭으로 "미션 관리"와 "참여자 현황"을 오갑니다 */
export default function AdminHomePage() {
  const [tab, setTab] = useState<AdminTab>('missions');

  return (
    <div className="admin-page">
      <h1 className="admin-title">관리자 페이지</h1>

      <div className="admin-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'missions'}
          className={`admin-tab${tab === 'missions' ? ' admin-tab-active' : ''}`}
          onClick={() => setTab('missions')}
        >
          미션 관리
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'participants'}
          className={`admin-tab${tab === 'participants' ? ' admin-tab-active' : ''}`}
          onClick={() => setTab('participants')}
        >
          참여자 현황
        </button>
      </div>

      {tab === 'missions' ? <AdminMissionsPage /> : <AdminParticipantsPage />}
    </div>
  );
}
