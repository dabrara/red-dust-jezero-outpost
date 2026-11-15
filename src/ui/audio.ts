import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tiny WebAudio blips. Audio starts muted (the setting defaults to off), and
 * every failure is silent so the game never depends on sound.
 */
export function useSound(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null);

  const play = useCallback(
    (kind: "tap" | "good" | "warn" | "finish") => {
      if (!enabled || typeof window === "undefined") return;
      const AudioCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtor) return;
      try {
        if (!contextRef.current) contextRef.current = new AudioCtor();
        const ctx = contextRef.current;
        if (ctx.state === "suspended") void ctx.resume();
        const notes: Record<typeof kind, number[]> = {
          tap: [520],
          good: [523, 659],
          warn: [392, 330],
          finish: [523, 659, 784, 1046],
        };
        notes[kind].forEach((frequency, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = frequency;
          const start = ctx.currentTime + index * 0.09;
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(0.09, start + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
          osc.connect(gain).connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.26);
        });
      } catch {
        // Sound is optional; ignore any audio failure.
      }
    },
    [enabled],
  );

  return play;
}

/** Browser read-aloud with a graceful fallback when it is unavailable. */
export function useSpeech(enabled: boolean) {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        typeof window.speechSynthesis !== "undefined" &&
        typeof window.SpeechSynthesisUtterance !== "undefined",
    );
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!enabled || !supported) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.94;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
      } catch {
        // ignore
      }
    },
    [enabled, supported],
  );

  const stop = useCallback(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }, [supported]);

  return { speak, stop, supported };
}
