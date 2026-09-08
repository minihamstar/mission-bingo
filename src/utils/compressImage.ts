// ─────────────────────────────────────────────────────────
// 휴대폰 카메라로 찍은 사진은 용량이 수 MB에 달할 수 있어서, 그대로 저장하면
// localStorage의 저장 공간 제한(브라우저마다 다르지만 보통 5~10MB)을
// 미션 몇 개만 완료해도 넘길 수 있습니다.
// 그래서 저장하기 전에 가로 크기를 줄이고 JPEG로 압축해서 용량을 크게 낮춥니다.
// ─────────────────────────────────────────────────────────

const MAX_WIDTH = 640;
const JPEG_QUALITY = 0.6;

/** 이미지 파일을 받아, 축소·압축된 base64 JPEG 문자열(data URL)로 변환합니다 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(reader.error ?? new Error('파일을 읽지 못했습니다.'));

    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'));

      image.onload = () => {
        const scale = Math.min(1, MAX_WIDTH / image.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('이미지를 처리할 수 없습니다.'));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };

      image.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
