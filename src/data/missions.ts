import type { Mission } from '../types';

// ─────────────────────────────────────────────────────────
// 여기 있는 미션 목록은 "처음 시작할 때의 기본값(seed data)"입니다.
// STEP 8부터는 관리자 페이지(/admin)에서 미션을 추가/수정/삭제/활성-비활성할 수
// 있는데, 그렇게 바뀐 내용은 브라우저(localStorage)에 저장됩니다.
// 그 저장/불러오기 로직은 store/missionStore.ts에 모여 있습니다.
//
// 4×4 빙고판을 채우려면 최소 16개의 "활성(isActive: true)" 미션이 필요합니다.
// ─────────────────────────────────────────────────────────

export const missions: Mission[] = [
  {
    id: 'mission-01',
    title: '다른 법인 직원과 인사하기',
    description: '우리 회사에는 여러 법인/계열사 동료들이 함께합니다. 다른 법인 소속 직원과 짧게 인사를 나눠보세요.',
    howTo: '쉬는 시간이나 식사 시간에 다른 법인 명찰(또는 소속)을 가진 분에게 먼저 다가가 인사해보세요.',
    completionCondition: '인사를 나눈 순간을 사진으로 남기고, 어떤 대화를 나눴는지 소감을 적어주세요.',
    isActive: true,
  },
  {
    id: 'mission-02',
    title: '같은 조원과 점심 먹기',
    description: '교육 기간 동안 함께할 조원들과 친해지는 시간을 가져보세요.',
    howTo: '같은 조원 중 한 명 이상과 함께 점심 식사를 해보세요.',
    completionCondition: '함께 식사하는 모습을 사진으로 남기고 소감을 적어주세요.',
    isActive: true,
  },
  {
    id: 'mission-03',
    title: '선배에게 회사생활 꿀팁 묻기',
    description: '먼저 입사한 선배들의 경험에는 도움이 되는 팁이 많습니다.',
    howTo: '사내에서 만난 선배 한 분에게 회사생활 팁을 하나 물어보세요.',
    completionCondition: '선배와 대화하는 모습(또는 함께 찍은 사진)과 함께 들은 팁을 소감에 적어주세요.',
    isActive: true,
  },
  {
    id: 'mission-04',
    title: '가장 마음에 드는 공간 찾기',
    description: '회사 곳곳을 둘러보며 나만의 아지트가 될 만한 공간을 찾아보세요.',
    howTo: '사내를 돌아다니며 마음에 드는 공간(카페, 라운지, 회의실 등)을 하나 찾아보세요.',
    completionCondition: '그 공간에서 사진을 찍고, 왜 마음에 드는지 소감을 적어주세요.',
    isActive: true,
  },
  {
    id: 'mission-05',
    title: '회사의 주요 사업 알아보기',
    description: '우리 회사가 어떤 사업을 하는지 알아가는 시간입니다.',
    howTo: '교육 자료, 사내 게시판, 또는 선배에게 물어봐서 회사의 주요 사업 하나를 조사해보세요.',
    completionCondition: '알게 된 사업 내용을 사진(자료 캡처 등)과 함께 소감에 정리해주세요.',
    isActive: true,
  },
  {
    id: 'mission-06',
    title: '동료의 MBTI 알아보기',
    description: '동료를 조금 더 알아가는 가벼운 대화 미션입니다.',
    howTo: '같은 조원 한 명에게 MBTI를 물어보고 어떤 성향인지 이야기 나눠보세요.',
    completionCondition: '대화 장면을 사진으로 남기고, 알게 된 MBTI와 느낀 점을 적어주세요.',
    isActive: true,
  },
  {
    id: 'mission-07',
    title: '새롭게 알게 된 것 공유하기',
    description: '교육 내용 중 인상 깊었던 내용을 동료와 나눠보세요.',
    howTo: '교육에서 새롭게 알게 된 것 1가지를 조원에게 이야기해주세요.',
    completionCondition: '공유하는 모습을 사진으로 남기고, 무엇을 공유했는지 소감에 적어주세요.',
    isActive: true,
  },
  {
    id: 'mission-08',
    title: '다른 팀 직원에게 먼저 인사하기',
    description: '낯선 동료에게 먼저 다가가는 용기를 내보세요.',
    howTo: '우리 조가 아닌 다른 팀/조 직원에게 먼저 인사를 건네보세요.',
    completionCondition: '인사한 순간을 사진으로 남기고 소감을 적어주세요.',
    isActive: true,
  },
  {
    id: 'mission-09',
    title: '동료에게 응원 메시지 보내기',
    description: '사내 메신저로 따뜻한 한마디를 전해보세요.',
    howTo: '사내 메신저(또는 단체 채팅방)로 동료 한 명에게 응원 메시지를 보내보세요.',
    completionCondition: '보낸 메시지 화면을 캡처(사진)하고, 왜 그 메시지를 보냈는지 소감을 적어주세요.',
    isActive: true,
  },
  {
    id: 'mission-10',
    title: '회사 로고의 의미 알아보기',
    description: '매일 보는 로고에도 담긴 이야기가 있습니다.',
    howTo: '회사 로고나 CI에 담긴 의미를 자료나 선배를 통해 알아보세요.',
    completionCondition: '로고 사진과 함께 알게 된 의미를 소감에 정리해주세요.',
    isActive: true,
  },
  {
    id: 'mission-11',
    title: '조원과 단체 사진 찍기',
    description: '함께하는 조원들과의 추억을 사진으로 남겨보세요.',
    howTo: '같은 조원들과 함께 모여 단체 사진을 찍어보세요.',
    completionCondition: '단체 사진을 인증사진으로 제출하고 소감을 적어주세요.',
    isActive: true,
  },
  {
    id: 'mission-12',
    title: '선배의 부서와 담당 업무 묻기',
    description: '선배가 어떤 일을 하는지 알아보며 조직을 이해해보세요.',
    howTo: '사내에서 만난 선배에게 소속 부서와 담당 업무를 물어보세요.',
    completionCondition: '대화 사진과 함께 알게 된 부서/업무 내용을 소감에 적어주세요.',
    isActive: true,
  },
  {
    id: 'mission-13',
    title: '사내 공지사항 살펴보기',
    description: '회사 소식에 관심을 가져보는 시간입니다.',
    howTo: '사내 게시판이나 공지사항에서 눈에 띄는 소식을 하나 찾아보세요.',
    completionCondition: '찾은 소식을 캡처(사진)하고, 어떤 내용인지 소감에 적어주세요.',
    isActive: true,
  },
  {
    id: 'mission-14',
    title: '기억에 남는 키워드 적어보기',
    description: '오늘 배운 내용을 정리하며 되새겨보세요.',
    howTo: '오늘 교육에서 기억에 남는 키워드를 3개 이상 떠올려보세요.',
    completionCondition: '키워드를 적은 메모(또는 노트) 사진과 함께 소감을 적어주세요.',
    isActive: true,
  },
  {
    id: 'mission-15',
    title: '다른 조원과 통성명하고 별명 짓기',
    description: '다른 조에 있는 동기와도 친해져보세요.',
    howTo: '다른 조 동기 한 명과 이름을 나누고, 재미있는 별명을 지어보세요.',
    completionCondition: '함께 찍은 사진과 함께 정한 별명, 소감을 적어주세요.',
    isActive: true,
  },
  {
    id: 'mission-16',
    title: '회사의 핵심 가치 하나 말해보기',
    description: '회사가 중요하게 생각하는 가치를 알아가는 미션입니다.',
    howTo: '교육 자료나 선배를 통해 회사의 핵심 가치(인재상) 하나를 알아보세요.',
    completionCondition: '알게 된 핵심 가치와 그 이유를 사진과 함께 소감에 정리해주세요.',
    isActive: true,
  },
];
