"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { SongItem, SongQualityItem } from "@/types";

export type RepeatMode = "off" | "all" | "one";

interface PlayerContextType {
  currentSong: SongItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: SongItem[];
  queueIndex: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  selectedQuality: string;
  isFullPlayerOpen: boolean;
  isLyricsOpen: boolean;
  sleepTimerMinutes: number | null;
  sleepEndOfTrack: boolean;
  isRadioMode: boolean;
  isDataSaver: boolean;
  audioError: string | null;

  // Actions
  playSong: (song: SongItem, newQueue?: SongItem[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  setVolumeLevel: (level: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  changeQuality: (quality: string) => void;
  addToQueueNext: (song: SongItem) => void;
  addToQueueEnd: (song: SongItem) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setIsFullPlayerOpen: (open: boolean) => void;
  setIsLyricsOpen: (open: boolean) => void;
  setSleepTimer: (minutes: number | null) => void;
  toggleSleepEndOfTrack: () => void;
  toggleRadioMode: () => void;
  toggleDataSaver: () => void;
  retryPlayback: () => void;
  closePlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<SongItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [queue, setQueue] = useState<SongItem[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [selectedQuality, setSelectedQuality] = useState<string>("320");
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepEndOfTrack, setSleepEndOfTrack] = useState<boolean>(false);
  const [isRadioMode, setIsRadioMode] = useState<boolean>(true);
  const [isDataSaver, setIsDataSaver] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sleepTimerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sleepEndOfTrackRef = useRef<boolean>(false);
  const isRadioModeRef = useRef<boolean>(true);
  const isClosedRef = useRef<boolean>(false);
  const currentSongRef = useRef<SongItem | null>(null);

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  useEffect(() => {
    sleepEndOfTrackRef.current = sleepEndOfTrack;
  }, [sleepEndOfTrack]);

  useEffect(() => {
    isRadioModeRef.current = isRadioMode;
  }, [isRadioMode]);

  // Initialize audio element
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setAudioError(null);
    };
    const handlePlay = () => {
      setIsPlaying(true);
      setAudioError(null);
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      if (isClosedRef.current || !currentSongRef.current) {
        setIsPlaying(false);
        return;
      }
      // If the current audio src failed (e.g. broken external link or expired blob),
      // gracefully fall back to local sample audio so playback never interrupts!
      const currentSrc = audio.src;
      if (currentSrc && !currentSrc.includes("/audio/sample.mp3")) {
        console.warn("Audio source failed, switching to local sample fallback:", currentSrc);
        audio.src = "/audio/sample.mp3";
        audio.load();
        audio.play().catch(() => {});
        return;
      }
      setAudioError("خطا در بارگذاری یا پخش فایل صوتی.");
      setIsPlaying(false);
    };
    const handleEnded = () => {
      if (isClosedRef.current || !currentSongRef.current) {
        setIsPlaying(false);
        return;
      }
      if (sleepEndOfTrackRef.current) {
        sleepEndOfTrackRef.current = false;
        setSleepEndOfTrack(false);
        setIsPlaying(false);
        return;
      }
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        playNext();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, [repeatMode]);

  // Set audio source based on song & quality
  const getAudioUrl = (song: SongItem, qualityPref: string): string => {
    if (!song.qualities || song.qualities.length === 0) return "/audio/sample.mp3";
    
    const validQualities = song.qualities.filter(
      (q) => q.fileUrl && !q.fileUrl.startsWith("blob:")
    );
    if (validQualities.length === 0) return "/audio/sample.mp3";

    if (isDataSaver) {
      // Pick 128 if available
      const low = validQualities.find((q) => q.quality === "128");
      if (low) return low.fileUrl;
    }
    const match = validQualities.find((q) => q.quality === qualityPref);
    if (match) return match.fileUrl;
    const defaultQuality = validQualities.find((q) => q.isDefault);
    return defaultQuality ? defaultQuality.fileUrl : validQualities[0].fileUrl;
  };

  const playSong = (song: SongItem, newQueue?: SongItem[]) => {
    isClosedRef.current = false;
    currentSongRef.current = song;
    setCurrentSong(song);
    setAudioError(null);

    let updatedQueue = queue;
    let newIndex = 0;

    if (newQueue && newQueue.length > 0) {
      updatedQueue = newQueue;
      newIndex = newQueue.findIndex((s) => s.id === song.id);
      if (newIndex === -1) newIndex = 0;
      setQueue(updatedQueue);
      setQueueIndex(newIndex);
    } else {
      const existingIdx = queue.findIndex((s) => s.id === song.id);
      if (existingIdx !== -1) {
        newIndex = existingIdx;
        setQueueIndex(existingIdx);
      } else {
        updatedQueue = [...queue, song];
        newIndex = updatedQueue.length - 1;
        setQueue(updatedQueue);
        setQueueIndex(newIndex);
      }
    }

    if (audioRef.current) {
      const src = getAudioUrl(song, selectedQuality);
      if (src) {
        audioRef.current.src = src;
        audioRef.current.load();
        audioRef.current.play().catch((err) => {
          console.warn("Autoplay was prevented or audio failed:", err);
        });
        // Register play count API in background
        fetch(`/api/songs/${song.id}/play`, { method: "POST" }).catch(() => {});
      } else {
        setAudioError("فایل صوتی برای این کیفیت یافت نشد.");
      }
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  };

  const pause = () => {
    if (audioRef.current) audioRef.current.pause();
  };

  const resume = () => {
    if (audioRef.current && currentSong) audioRef.current.play().catch(() => {});
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolumeLevel = (lvl: number) => {
    const val = Math.max(0, Math.min(1, lvl));
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val > 0 && isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  const playNext = () => {
    if (queue.length === 0) return;
    let nextIdx = queueIndex + 1;
    if (isShuffled) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeatMode === "all") {
        nextIdx = 0;
      } else if (isRadioModeRef.current && currentSong) {
        // Infinite Smart Radio: Fetch similar songs
        const excludeIds = queue.map((s) => s.id).join(",");
        const artistId = currentSong.artistId || "";
        fetch(
          `/api/songs/recommendations?currentSongId=${currentSong.id}&artistId=${artistId}&exclude=${excludeIds}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.songs) && data.songs.length > 0) {
              const newQueue = [...queue, ...data.songs];
              setQueue(newQueue);
              setQueueIndex(queue.length);
              playSong(data.songs[0], newQueue);
            } else {
              setIsPlaying(false);
            }
          })
          .catch(() => {
            setIsPlaying(false);
          });
        return;
      } else {
        setIsPlaying(false);
        return;
      }
    }
    setQueueIndex(nextIdx);
    playSong(queue[nextIdx]);
  };

  const playPrevious = () => {
    if (!audioRef.current || queue.length === 0) return;
    if (currentTime > 3) {
      seek(0);
      return;
    }
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }
    setQueueIndex(prevIdx);
    playSong(queue[prevIdx]);
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  };

  const toggleShuffle = () => {
    setIsShuffled((prev) => !prev);
  };

  const changeQuality = (q: string) => {
    setSelectedQuality(q);
    if (currentSong && audioRef.current) {
      const prevTime = audioRef.current.currentTime;
      const wasPlaying = isPlaying;
      const newUrl = getAudioUrl(currentSong, q);
      if (newUrl) {
        audioRef.current.src = newUrl;
        audioRef.current.currentTime = prevTime;
        if (wasPlaying) {
          audioRef.current.play().catch(() => {});
        }
      }
    }
  };

  const addToQueueNext = (song: SongItem) => {
    const updated = [...queue];
    updated.splice(queueIndex + 1, 0, song);
    setQueue(updated);
  };

  const addToQueueEnd = (song: SongItem) => {
    setQueue([...queue, song]);
  };

  const removeFromQueue = (index: number) => {
    const updated = queue.filter((_, i) => i !== index);
    setQueue(updated);
    if (index < queueIndex) {
      setQueueIndex((prev) => prev - 1);
    } else if (index === queueIndex) {
      if (updated.length > 0) {
        const nextIdx = Math.min(index, updated.length - 1);
        setQueueIndex(nextIdx);
        playSong(updated[nextIdx]);
      } else {
        setCurrentSong(null);
        setIsPlaying(false);
      }
    }
  };

  const clearQueue = () => {
    setQueue(currentSong ? [currentSong] : []);
    setQueueIndex(currentSong ? 0 : -1);
  };

  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    if (sleepTimerTimeoutRef.current) {
      clearTimeout(sleepTimerTimeoutRef.current);
      sleepTimerTimeoutRef.current = null;
    }
    if (minutes && minutes > 0) {
      sleepTimerTimeoutRef.current = setTimeout(() => {
        pause();
        setSleepTimerMinutes(null);
      }, minutes * 60 * 1000);
    }
  };

  const toggleDataSaver = () => {
    setIsDataSaver((prev) => !prev);
  };

  const toggleRadioMode = () => {
    setIsRadioMode((prev) => !prev);
  };

  const toggleSleepEndOfTrack = () => {
    setSleepEndOfTrack((prev) => !prev);
  };

  const retryPlayback = () => {
    setAudioError(null);
    if (currentSong && audioRef.current) {
      const src = getAudioUrl(currentSong, selectedQuality);
      audioRef.current.src = src;
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
  };

  const closePlayer = () => {
    isClosedRef.current = true;
    currentSongRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    setIsPlaying(false);
    setCurrentSong(null);
    setCurrentTime(0);
    setDuration(0);
    setQueue([]);
    setQueueIndex(-1);
    setIsFullPlayerOpen(false);
    setAudioError(null);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        queue,
        queueIndex,
        repeatMode,
        isShuffled,
        selectedQuality,
        isFullPlayerOpen,
        isLyricsOpen,
        sleepTimerMinutes,
        sleepEndOfTrack,
        isRadioMode,
        isDataSaver,
        audioError,
        playSong,
        togglePlay,
        pause,
        resume,
        seek,
        setVolumeLevel,
        toggleMute,
        playNext,
        playPrevious,
        toggleRepeat,
        toggleShuffle,
        changeQuality,
        addToQueueNext,
        addToQueueEnd,
        removeFromQueue,
        clearQueue,
        setIsFullPlayerOpen,
        setIsLyricsOpen,
        setSleepTimer,
        toggleSleepEndOfTrack,
        toggleRadioMode,
        toggleDataSaver,
        retryPlayback,
        closePlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
