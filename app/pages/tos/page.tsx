"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

// export default function Page() {
//   return <div>test</div>;
// }

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  //   const { setFile } = useFileStore();

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen(); // Safari
    } else if ((elem as any).msRequestFullscreen) {
      (elem as any).msRequestFullscreen(); // IE11
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      console.log("Camera stream stopped.");
    }
  };

  const startCamera = async () => {
    stopCamera();
    console.log("Attempting to start camera...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: { exact: "environment" },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current
          .play()
          .catch((err) => console.error("Video play failed:", err));
        console.log("Camera stream started.");
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  useEffect(() => {
    enterFullscreen();
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    video
      .play()
      .then(() => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "photo.png", { type: "image/png" });
            const imageUrl = URL.createObjectURL(file);
            setPhoto(imageUrl);
            // setFile(file);
            stopCamera();
          }
        }, "image/png");
      })
      .catch((err) =>
        console.error("Error playing video before capture:", err)
      );
  };

  const handleCancel = () => {
    if (photo) {
      URL.revokeObjectURL(photo);
    }
    setPhoto(null);
    // setFile(undefined);
    startCamera();
  };

  const handleSave = () => {
    if (photo) {
      URL.revokeObjectURL(photo);
    }
    setPhoto(null);
    startCamera();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${
          photo ? "invisible" : "visible"
        }`}
      />
      <canvas
        ref={canvasRef}
        className="absolute -z-10 opacity-0 pointer-events-none"
      />
      {!photo && (
        <Button
          onClick={capturePhoto}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow z-30"
          variant={"outline"}
        >
          Take Photo
        </Button>
      )}
      {photo && (
        <div className="absolute inset-0 z-10">
          <div className="absolute flex gap-4 bottom-6 left-1/2 transform -translate-x-1/2 z-30">
            <Button size={"lg"} variant={"secondary"} onClick={handleSave}>
              {"Save"}
            </Button>
            <Button size={"lg"} variant={"destructive"} onClick={handleCancel}>
              {"Cancel"}
            </Button>
          </div>
          <img
            src={photo}
            alt="Captured"
            className="absolute inset-0 w-full h-full object-contain bg-black z-20"
          />
        </div>
      )}
    </div>
  );
}
