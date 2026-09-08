// ─────────────────────────────────────────────────────────
// 이 파일은 앱 전체에서 사용하는 "데이터의 모양"을 정의합니다.
// 실제 값이 아니라 "이런 값이 들어있어야 한다"는 설계도라고 생각하면 됩니다.
// ─────────────────────────────────────────────────────────

/** 미션 하나의 정의 (data/missions.ts 에서 이 형태로 관리) */
export interface Mission {
  id: string;
  /** 빙고칸에 보이는 짧은 제목 */
  title: string;
  /** 모달에서 보여줄 상세 설명 */
  description: string;
  /** 수행 방법 (어떻게 하면 되는지) */
  howTo: string;
  /** 완료 조건 (무엇을 하면 완료로 인정되는지) */
  completionCondition: string;
  /** 관리자가 이 미션을 켜고 끌 수 있는 활성 여부 */
  isActive: boolean;
}

/** 완료한 미션 하나에 대한 인증 기록 (사진 + 소감) */
export interface MissionCompletion {
  missionId: string;
  /** MVP 단계: 이미지를 base64 문자열로 저장. 추후 서버 URL로 교체 가능 */
  photoDataUrl: string;
  comment: string;
  /** ISO 형식 시간 문자열 (예: new Date().toISOString()) */
  completedAt: string;
}

/** 한 팀(참여자)의 게임 전체 상태. localStorage에 이 단위로 저장됩니다 */
export interface GameState {
  participantName: string;
  /** 이번 게임에 배치된 16개 미션 (배치 순서 = 빙고판 순서, 0번이 왼쪽 위) */
  missions: Mission[];
  /** 완료된 미션들의 기록 (완료되지 않은 미션은 여기 없음) */
  completions: MissionCompletion[];
  bingoCount: number;
  gameStartedAt: string;
  gameCompletedAt: string | null;
}
