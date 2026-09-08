import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Mission, MissionCompletion } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { compressImage } from '../../utils/compressImage';

interface MissionModalProps {
  mission: Mission | null;
  completion: MissionCompletion | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (missionId: string, photoDataUrl: string, comment: string) => void;
}

/**
 * 미션 칸을 클릭했을 때 뜨는 모달입니다.
 * - 아직 완료 전이면: 미션 설명 + 인증사진 업로드 + 소감 입력 + "미션 완료" 버튼
 * - 이미 완료했으면: 제출했던 인증사진과 소감을 보여주는 확인 화면
 */
export default function MissionModal({
  mission,
  completion,
  isOpen,
  onClose,
  onComplete,
}: MissionModalProps) {
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [comment, setComment] = useState('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  // 모달이 새로 열리거나 다른 미션으로 바뀌면 입력값을 초기화합니다.
  useEffect(() => {
    setPhotoDataUrl('');
    setComment('');
    setPhotoError('');
    setIsProcessingPhoto(false);
  }, [mission?.id, isOpen]);

  if (!mission) return null;

  const isCompleted = completion !== null;
  const canSubmit = photoDataUrl.length > 0 && comment.trim().length > 0 && !isProcessingPhoto;

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    setIsProcessingPhoto(true);

    // 사진 용량이 커서 그대로 저장하면 브라우저 저장 공간을 금방 채우기 때문에,
    // 가로 크기를 줄이고 압축한 뒤에 저장용 데이터로 사용합니다.
    compressImage(file)
      .then((dataUrl) => setPhotoDataUrl(dataUrl))
      .catch((error) => {
        console.error('사진 처리 중 문제가 발생했어요:', error);
        setPhotoError('사진을 처리하지 못했어요. 다른 사진으로 다시 시도해주세요.');
      })
      .finally(() => setIsProcessingPhoto(false));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onComplete(mission.id, photoDataUrl, comment.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel={mission.title}>
      <button type="button" className="modal-close" onClick={onClose} aria-label="닫기">
        ✕
      </button>

      <h2 className="mission-modal-title">{mission.title}</h2>

      {isCompleted && completion ? (
        <div className="mission-modal-body">
          <img src={completion.photoDataUrl} alt="제출한 인증 사진" className="mission-modal-photo" />
          <div className="mission-modal-section">
            <div className="mission-modal-label">소감</div>
            <p className="mission-modal-comment">{completion.comment}</p>
          </div>
          <div className="mission-modal-completed-badge">✓ 완료된 미션이에요</div>
        </div>
      ) : (
        <div className="mission-modal-body">
          <p className="mission-modal-description">{mission.description}</p>

          <div className="mission-modal-section">
            <div className="mission-modal-label">수행 방법</div>
            <p>{mission.howTo}</p>
          </div>

          <div className="mission-modal-section">
            <div className="mission-modal-label">완료 조건</div>
            <p>{mission.completionCondition}</p>
          </div>

          <div className="mission-modal-section">
            <label htmlFor="mission-photo" className="mission-modal-label">
              인증 사진
            </label>
            <input
              id="mission-photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="mission-modal-file-input"
            />
            {isProcessingPhoto && <p className="mission-modal-hint">사진을 처리하는 중이에요...</p>}
            {photoError && <p className="mission-modal-error">{photoError}</p>}
            {photoDataUrl && !isProcessingPhoto && (
              <img
                src={photoDataUrl}
                alt="첨부한 인증 사진 미리보기"
                className="mission-modal-photo-preview"
              />
            )}
          </div>

          <div className="mission-modal-section">
            <label htmlFor="mission-comment" className="mission-modal-label">
              소감
            </label>
            <textarea
              id="mission-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="미션을 수행하며 느낀 점을 적어주세요"
              className="mission-modal-textarea"
              rows={3}
              maxLength={300}
            />
          </div>

          <Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
            {isProcessingPhoto ? '사진 처리 중...' : '미션 완료'}
          </Button>
        </div>
      )}
    </Modal>
  );
}
