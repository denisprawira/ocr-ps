"use client";

import { useEffect, useRef, useState } from "react";

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { min: 1024, ideal: 1280, max: 1920 },
            height: { min: 576, ideal: 720, max: 1080 },
            facingMode: { exact: "environment" },
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }

    startCamera();
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "photo.png", { type: "image/png" });
        const imageUrl = URL.createObjectURL(file);
        setPhoto(imageUrl);
      }
    }, "image/png");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded-xl shadow-md w-full max-w-md"
      />
      <button
        onClick={capturePhoto}
        className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
      >
        Take Photo
      </button>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {photo && (
        <img
          src={photo}
          alt="Captured"
          className="rounded-xl shadow-md mt-4 w-full max-w-md"
        />
      )}
    </div>
  );
}
