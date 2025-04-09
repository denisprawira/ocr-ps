"use client";
import CameraCapture from "@/app/components/camera-capture/camera-capture";
import OcrPage from "@/app/pages/main/page";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/sw.js").then(
        function (registration) {
          console.log(
            "Service Worker registration successful with scope: ",
            registration.scope
          );
        },
        function (err) {
          console.log("Service Worker registration failed: ", err);
        }
      );
    }
  }, []);

  return (
    <div className="bg-gray-950 py-5 min-h-full flex justify-center items-start ">
      <OcrPage />
    </div>
  );
}
