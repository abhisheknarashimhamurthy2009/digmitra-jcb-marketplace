import {
  IconAlertTriangle,
  IconCamera,
  IconCameraRotate,
  IconCheck,
  IconLoader2,
  IconPhoto,
  IconSparkles,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapturePhoto: (dataUrl: string) => void;
  currentPhotosCount: number;
  minPhotos?: number;
  maxPhotos?: number;
  isKn?: boolean;
}

export function LiveCameraModal({
  isOpen,
  onClose,
  onCapturePhoto,
  currentPhotosCount,
  minPhotos = 4,
  maxPhotos = 7,
  isKn = false,
}: LiveCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputFallbackRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [shutterFlash, setShutterFlash] = useState<boolean>(false);
  const [recentCapture, setRecentCapture] = useState<string | null>(null);

  // Start Camera Stream
  const startCamera = async (mode: "environment" | "user") => {
    setIsLoading(true);
    setCameraError(null);

    // Stop existing stream first
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          isKn
            ? "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಲೈವ್ ಕ್ಯಾಮೆರಾ ಪ್ರವೇಶವನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ."
            : "Your browser does not support direct live camera streaming."
        );
      }

      // Request live camera stream - Browser will trigger "wants to use your camera" prompt
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.error("Play error:", e));
          setIsLoading(false);
        };
      }
    } catch (err: any) {
      console.warn("Camera start failed, testing fallback:", err);
      setIsLoading(false);

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError(
          isKn
            ? "ಕ್ಯಾಮೆರಾ ಅನುಮತಿಯನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಕ್ಯಾಮೆರಾ ಅನುಮತಿ ನೀಡಿ."
            : "Camera permission denied. Please allow camera access in your browser prompt or URL bar."
        );
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError(
          isKn
            ? "ಯಾವುದೇ ಕ್ಯಾಮೆರಾ ಸಾಧನ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ."
            : "No camera device found on this system. You can upload photos directly."
        );
      } else {
        setCameraError(
          err.message ||
            (isKn
              ? "ಕ್ಯಾಮೆರಾ ಪ್ರಾರಂಭಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
              : "Could not start camera stream.")
        );
      }
    }
  };

  // Toggle front/back camera
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Snap photo from live video feed
  const handleSnapPhoto = () => {
    if (currentPhotosCount >= maxPhotos) {
      return;
    }

    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = canvasRef.current || document.createElement("canvas");
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // If using user/front camera, horizontally flip so it feels natural
    if (facingMode === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);

    // Visual shutter feedback
    setShutterFlash(true);
    setRecentCapture(dataUrl);
    setTimeout(() => setShutterFlash(false), 200);

    onCapturePhoto(dataUrl);
  };

  // Fallback upload if camera permission denied
  const handleFallbackFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
        const url = URL.createObjectURL(file);
        onCapturePhoto(url);
      });
      e.target.value = "";
    }
  };

  // Initialize camera when modal opens, stop when closes
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      setRecentCapture(null);
      setCameraError(null);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isMaxReached = currentPhotosCount >= maxPhotos;

  return (
    <div
      className="fixed inset-0 z-[999999] flex flex-col bg-black text-white select-none animate-in fade-in"
      style={{ zIndex: 999999 }}
    >
      {/* Hidden canvas for snapshotting */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input for fallback */}
      <input
        ref={fileInputFallbackRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFallbackFile}
        className="hidden"
      />

      {/* 1. TOP HEADER / STATUS BAR */}
      <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/90 via-black/60 to-transparent">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md active:scale-90 transition cursor-pointer"
          title={isKn ? "ಕ್ಯಾಮೆರಾ ಮುಚ್ಚಿ" : "Close Camera"}
        >
          <IconX size={20} stroke={2.5} />
        </button>

        {/* Live Photo Counter Badge */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/20 backdrop-blur-md">
            <IconCamera size={14} className="text-[#ffb400]" />
            <span className="text-xs font-mono font-black text-white">
              {currentPhotosCount} / {maxPhotos}
            </span>
          </div>
          <span className="text-[10px] text-white/70 font-bold mt-0.5">
            {currentPhotosCount < minPhotos
              ? isKn
                ? `ಕನಿಷ್ಠ ${minPhotos} ಚಿತ್ರಗಳು ಬೇಕು (${minPhotos - currentPhotosCount} ಬಾಕಿ)`
                : `Need ${minPhotos - currentPhotosCount} more for min requirement`
              : isKn
              ? "✓ ಕನಿಷ್ಠ ಅಗತ್ಯತೆ ಪೂರ್ಣಗೊಂಡಿದೆ"
              : "✓ Minimum requirement met"}
          </span>
        </div>

        {/* Camera Flip / Rotate Button */}
        <button
          type="button"
          onClick={handleToggleFacingMode}
          className="flex size-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md active:scale-90 transition cursor-pointer"
          title={isKn ? "ಕ್ಯಾಮೆರಾ ಬದಲಾಯಿಸಿ" : "Switch Front/Rear Camera"}
        >
          <IconCameraRotate size={20} stroke={2.5} />
        </button>
      </div>

      {/* 2. CAMERA VIEWFINDER VIEWPORT */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Live Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isLoading || cameraError ? "opacity-0" : "opacity-100"
          } ${facingMode === "user" ? "-scale-x-100" : ""}`}
        />

        {/* Shutter Flash Effect */}
        {shutterFlash && (
          <div className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-200" />
        )}

        {/* Viewfinder Target Framing Overlay */}
        {!isLoading && !cameraError && (
          <div className="pointer-events-none absolute inset-8 border border-white/30 rounded-3xl flex flex-col justify-between p-4">
            <div className="flex justify-between">
              <span className="size-5 border-t-2 border-l-2 border-[#ffb400] rounded-tl-lg" />
              <span className="size-5 border-t-2 border-r-2 border-[#ffb400] rounded-tr-lg" />
            </div>
            <div className="text-center">
              <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold text-white/80 backdrop-blur">
                {isKn
                  ? "ಸೈಟ್, ಗಡಿ ಮತ್ತು ರಸ್ತೆ ಪ್ರವೇಶವನ್ನು ಕೇಂದ್ರದಲ್ಲಿಡಿ"
                  : "Frame site boundaries & road access"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="size-5 border-b-2 border-l-2 border-[#ffb400] rounded-bl-lg" />
              <span className="size-5 border-b-2 border-r-2 border-[#ffb400] rounded-br-lg" />
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-4 text-center">
            <IconLoader2 size={44} className="animate-spin text-[#ffb400] mb-3" />
            <h4 className="text-sm font-black text-white">
              {isKn ? "ಕ್ಯಾಮೆರಾ ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ..." : "Starting Live Camera..."}
            </h4>
            <p className="mt-1 max-w-xs text-xs text-slate-400">
              {isKn
                ? "ಬ್ರೌಸರ್ ಕೇಳಿದಾಗ ದಯವಿಟ್ಟು 'ಅನುಮತಿಸಿ' (Allow) ಕ್ಲಿಕ್ ಮಾಡಿ."
                : "Please tap 'Allow' when your browser prompts for camera access."}
            </p>
          </div>
        )}

        {/* Error / Permission Denied Screen */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-red-950/80 border border-red-500/40 text-red-400 mb-4 shadow-xl">
              <IconAlertTriangle size={32} />
            </div>
            <h3 className="text-base font-black text-white">
              {isKn ? "ಕ್ಯಾಮೆರಾ ಪ್ರವೇಶಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ" : "Camera Access Required"}
            </h3>
            <p className="mt-1.5 max-w-sm text-xs text-slate-300 leading-relaxed font-medium">
              {cameraError}
            </p>

            <div className="mt-6 flex flex-col w-full max-w-xs gap-3">
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#ffb400] hover:bg-[#ffa700] text-slate-950 px-5 py-3 text-xs font-black uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-lg"
              >
                <IconCamera size={18} />
                <span>{isKn ? "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ (Try Again)" : "Retry Camera Request"}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputFallbackRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3 text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                <IconUpload size={18} />
                <span>{isKn ? "ಫೈಲ್‌ಗಳಿಂದ ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ" : "Upload from Gallery Instead"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM CONTROLS & SHUTTER BUTTON */}
      <div className="relative z-20 flex items-center justify-between px-6 py-6 bg-gradient-to-t from-black via-black/90 to-transparent">
        {/* Left: Last Captured Thumbnail preview */}
        <div className="w-14 flex items-center justify-start">
          {recentCapture ? (
            <div className="relative size-12 overflow-hidden rounded-2xl border-2 border-white/80 shadow-md">
              <img
                src={recentCapture}
                alt="Recent Capture"
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-0 right-0 bg-emerald-500 rounded-tl-md p-0.5 text-[8px] text-white font-black">
                ✓
              </span>
            </div>
          ) : (
            <div className="size-12 rounded-2xl border border-white/20 bg-white/5 flex items-center justify-center text-white/40">
              <IconPhoto size={20} />
            </div>
          )}
        </div>

        {/* Center: Big Shutter Click Button */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleSnapPhoto}
            disabled={isLoading || !!cameraError || isMaxReached}
            className={`group relative flex size-20 items-center justify-center rounded-full border-4 border-white transition-all active:scale-90 cursor-pointer ${
              isMaxReached
                ? "opacity-50 cursor-not-allowed border-white/40"
                : "hover:scale-105 shadow-[0_0_25px_rgba(255,255,255,0.4)]"
            }`}
            title={isMaxReached ? "Maximum photos reached" : "Click to Capture Photo"}
          >
            {/* Inner Shutter Circle */}
            <span
              className={`size-16 rounded-full transition-transform ${
                isMaxReached
                  ? "bg-slate-600"
                  : "bg-white group-hover:scale-95 group-active:scale-90 bg-[#ffb400]"
              }`}
            />
          </button>
          <span className="mt-2 text-[11px] font-bold text-white/80">
            {isMaxReached
              ? isKn
                ? "ಗರಿಷ್ಠ ಮಿತಿ ತಲುಪಿದೆ (7/7)"
                : "Max 7 reached"
              : isKn
              ? "ಫೋಟೋ ಕ್ಲಿಕ್ ಮಾಡಿ"
              : "Tap to Capture"}
          </span>
        </div>

        {/* Right: Done Button */}
        <div className="w-14 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 rounded-2xl bg-emerald-500 hover:bg-emerald-600 px-3.5 py-2.5 text-xs font-black text-white shadow-lg active:scale-90 transition cursor-pointer"
          >
            <IconCheck size={16} stroke={3} />
            <span>{isKn ? "ಮುಗಿದಿದೆ" : "Done"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
