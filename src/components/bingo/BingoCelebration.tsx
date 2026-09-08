import { useEffect } from 'react';

interface BingoCelebrationProps {
  /** 새로 완성된 빙고가 몇 번째인지 (없으면 null → 아무것도 표시 안 함) */
  bingoNumber: number | null;
  onDismiss: () => void;
}

const ORDINALS = ['첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];

/** 빙고가 새로 완성됐을 때 잠깐 떴다가 사라지는 축하 화면입니다 */
export default function BingoCelebration({ bingoNumber, onDismiss }: BingoCelebrationProps) {
  useEffect(() => {
    if (bingoNumber === null) return;
    const timer = setTimeout(onDismiss, 2200);
    return () => clearTimeout(timer);
  }, [bingoNumber, onDismiss]);

  if (bingoNumber === null) return null;

  const ordinalText = ORDINALS[bingoNumber - 1] ?? `${bingoNumber}`;

  return (
    <div className="bingo-celebration" onClick={onDismiss}>
      <div className="bingo-celebration-card">
        <div className="bingo-celebration-emoji">🎉</div>
        <div className="bingo-celebration-title">빙고 완성!</div>
        <div className="bingo-celebration-subtitle">{ordinalText} 번째 빙고를 달성했어요!</div>
      </div>
    </div>
  );
}
