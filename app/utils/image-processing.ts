export const applyThresholdToFile = (
  file: File,
  threshold: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      ctx?.drawImage(img, 0, 0);
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData?.data;

      if (data && imageData && ctx) {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const gray = 0.3 * r + 0.59 * g + 0.11 * b;
          const binary = gray >= threshold ? 255 : 0;

          data[i] = data[i + 1] = data[i + 2] = binary;
        }
        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject("Failed to create blob from canvas");
        }, "image/png");
      } else {
        reject("Canvas or image data not available");
      }
    };

    img.onerror = () => reject("Failed to load image");
  });
};
