"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaVolumeHigh, FaVolumeXmark } from "react-icons/fa6";

type Props = {
  videoId: string;
  title: string;
  muteLabel: string;
  unmuteLabel: string;
  volumeLabel: string;
};

export function MeasurementVideoHero({
  videoId,
  title,
  muteLabel,
  unmuteLabel,
  volumeLabel,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const muteButtonRef = useRef<HTMLButtonElement>(null);
  const hideControlTimeoutRef = useRef<number | null>(null);
  const revealVideoTimeoutRef = useRef<number | null>(null);
  const [muted, setMuted] = useState(true);
  const [volumeLevel, setVolumeLevel] = useState(70);
  const [isVideoRevealed, setIsVideoRevealed] = useState(false);
  const [isControlDismissed, setIsControlDismissed] = useState(false);

  const src = useMemo(
    () =>
      `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&disablekb=1&loop=1&playlist=${videoId}&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&cc_load_policy=0&enablejsapi=1`,
    [videoId],
  );

  const sendCommand = (func: "mute" | "unMute" | "setVolume", args: number[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func,
        args,
      }),
      "*",
    );
  };

  const scheduleControlDismiss = () => {
    setIsControlDismissed(false);

    if (hideControlTimeoutRef.current !== null) {
      window.clearTimeout(hideControlTimeoutRef.current);
    }

    hideControlTimeoutRef.current = window.setTimeout(() => {
      muteButtonRef.current?.blur();
      setIsControlDismissed(true);
      hideControlTimeoutRef.current = null;
    }, 1000);
  };

  const resetControlDismiss = () => {
    if (hideControlTimeoutRef.current !== null) {
      window.clearTimeout(hideControlTimeoutRef.current);
      hideControlTimeoutRef.current = null;
    }
    setIsControlDismissed(false);
  };

  const revealControlOnVideoClick = () => {
    resetControlDismiss();
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    const nextVolume = volumeLevel > 0 ? volumeLevel : 60;

    if (nextMuted) {
      sendCommand("mute");
    } else {
      if (volumeLevel === 0) {
        setVolumeLevel(nextVolume);
      }
      sendCommand("unMute");
      sendCommand("setVolume", [nextVolume]);
    }

    setMuted(nextMuted);

    scheduleControlDismiss();
  };

  const handleVolumeChange = (nextVolume: number) => {
    setVolumeLevel(nextVolume);
    sendCommand("setVolume", [nextVolume]);
    scheduleControlDismiss();

    if (nextVolume === 0) {
      sendCommand("mute");
      setMuted(true);
      return;
    }

    sendCommand("unMute");
    setMuted(false);
  };

  const handleIframeLoad = () => {
    if (revealVideoTimeoutRef.current !== null) {
      window.clearTimeout(revealVideoTimeoutRef.current);
    }

    // Keep a short mask while the player paints first frame to avoid startup UI flash.
    revealVideoTimeoutRef.current = window.setTimeout(() => {
      setIsVideoRevealed(true);
      revealVideoTimeoutRef.current = null;
    }, 350);
  };

  useEffect(() => {
    return () => {
      if (hideControlTimeoutRef.current !== null) {
        window.clearTimeout(hideControlTimeoutRef.current);
      }
      if (revealVideoTimeoutRef.current !== null) {
        window.clearTimeout(revealVideoTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section className="w-full bg-white px-5 pt-10 pb-8 md:px-8 md:pt-14 md:pb-10">
      <div className="mx-auto w-full max-w-[1200px]">
        <div
          className="group relative aspect-video w-full overflow-hidden rounded-lg"
          onMouseLeave={resetControlDismiss}
          onClick={revealControlOnVideoClick}
        >
          <iframe
            ref={iframeRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
            src={src}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={handleIframeLoad}
          />
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 z-10 bg-black transition-opacity duration-300 ${
              isVideoRevealed ? "opacity-0" : "opacity-100"
            }`}
          />
          <div className="absolute inset-y-0 right-4 z-20 flex items-center md:right-6">
            <div className="flex items-center gap-2">
              <div
                className={`pointer-events-none w-0 overflow-hidden opacity-0 transition-all duration-300 ${
                  isControlDismissed
                    ? ""
                    : "group-hover:pointer-events-auto group-hover:w-32 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:w-32 group-focus-within:opacity-100"
                }`}
              >
                <div className="rounded-full border border-white/30 bg-black/25 px-3 py-2 backdrop-blur-sm">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={volumeLevel}
                    onChange={(event) => handleVolumeChange(Number(event.target.value))}
                    onFocus={() => setIsControlDismissed(false)}
                    className="h-1.5 w-full cursor-pointer accent-white"
                    aria-label={volumeLabel}
                  />
                </div>
              </div>
              <button
                ref={muteButtonRef}
                type="button"
                onClick={toggleMute}
                onFocus={() => setIsControlDismissed(false)}
                className={`pointer-events-none grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-black/25 text-white/80 opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-black/35 hover:text-white focus-visible:pointer-events-auto focus-visible:opacity-100 md:h-14 md:w-14 ${
                  isControlDismissed
                    ? ""
                    : "group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
                }`}
                aria-label={muted ? unmuteLabel : muteLabel}
              >
                {muted ? (
                  <FaVolumeXmark className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
                ) : (
                  <FaVolumeHigh className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
