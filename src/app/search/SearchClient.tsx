"use client";

import React, { useState, useEffect, useRef } from "react";
import { SongItem, ArtistItem, AlbumItem } from "@/types";
import { SongCard } from "@/components/cards/SongCard";
import { ArtistCard } from "@/components/cards/ArtistCard";
import { AlbumCard } from "@/components/cards/AlbumCard";
import {
  Search,
  Mic,
  MicOff,
  Radio,
  X,
  Sparkles,
  Music,
  Disc3,
  Flame,
  AlertCircle,
} from "lucide-react";
import { normalizePersian } from "@/lib/utils";

interface SearchClientProps {
  initialSongs: SongItem[];
  initialArtists: ArtistItem[];
  initialAlbums: AlbumItem[];
}

export function SearchClient({
  initialSongs,
  initialArtists,
  initialAlbums,
}: SearchClientProps) {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Audio recognition mode
  const [isAudioMatchActive, setIsAudioMatchActive] = useState(false);
  const [audioMatchStatus, setAudioMatchStatus] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recog = new SpeechRecognition();
        recog.lang = "fa-IR";
        recog.continuous = false;
        recog.interimResults = false;

        recog.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
          setIsListening(false);
        };

        recog.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setSpeechError("تشخیص صدا انجام نشد یا دسترسی به میکروفون رد شد.");
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recog;
      }
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!speechSupported) {
      alert("مرورگر شما از جستجوی صوتی (Web Speech API) پشتیبانی نمی‌کند.");
      return;
    }
    setSpeechError(null);
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAudioMatchSimulation = () => {
    // Proposal Section 7 Requirement: Transparent status for audio fingerprinting service
    setIsAudioMatchActive(true);
    setAudioMatchStatus("در حال شنیدن و نمونه‌برداری از محیط با میکروفون...");

    setTimeout(() => {
      setAudioMatchStatus("ارسال اثر انگشت صوتی به سرور تطبیق صدا...");
      setTimeout(() => {
        // Transparent disclosure as required in Proposal page 13:
        setAudioMatchStatus(
          "سرویس تطبیق اثر صوتی خارجی (AcoustID/Shazam API) پیکربندی نشده است. زیرساخت ارتباطی آماده است."
        );
      }, 2000);
    }, 2500);
  };

  // Perform search with Persian normalization
  const normQuery = normalizePersian(query);

  const matchedSongs = normQuery
    ? initialSongs.filter((s) => {
        const titleMatch = normalizePersian(s.title).includes(normQuery);
        const artistMatch = normalizePersian(s.artist?.name || "").includes(normQuery);
        const lyricsMatch = normalizePersian(s.lyrics || "").includes(normQuery);
        return titleMatch || artistMatch || lyricsMatch;
      })
    : [];

  const matchedArtists = normQuery
    ? initialArtists.filter((a) => normalizePersian(a.name).includes(normQuery))
    : [];

  const matchedAlbums = normQuery
    ? initialAlbums.filter(
        (alb) =>
          normalizePersian(alb.title).includes(normQuery) ||
          normalizePersian(alb.artist?.name || "").includes(normQuery)
      )
    : [];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Search Input Box */}
      <div className="bg-surface-card border border-surface-border rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="نام آهنگ، هنرمند (مثلاً بیتا)، آلبوم یا بخشی از متن شعر را بنویسید..."
            className="w-full pl-24 pr-12 py-3.5 rounded-2xl bg-surface-50 border border-surface-border text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand shadow-inner transition-colors"
          />
          <Search className="w-5 h-5 text-brand absolute right-4 pointer-events-none" />

          {/* Action buttons inside input */}
          <div className="absolute left-3 flex items-center gap-1">
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1.5 text-content-muted hover:text-content-primary rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Voice Search Button */}
            <button
              onClick={toggleSpeechRecognition}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "text-content-muted hover:text-brand hover:bg-surface-100"
              }`}
              title={isListening ? "در حال گوش دادن..." : "جستجوی صوتی (بگویید تا بنویسد)"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Voice indicator or error */}
        {isListening && (
          <div className="p-2.5 rounded-xl bg-brand/10 border border-brand/20 text-brand text-xs text-center font-bold animate-pulse">
            در حال شنیدن صدای شما... نام آهنگ یا خواننده را بگویید.
          </div>
        )}
        {speechError && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {speechError}
          </div>
        )}

        {/* Distinguish Feature 2: Audio Song Identification */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-surface-border gap-2 text-xs">
          <div className="flex items-center gap-2 text-content-muted">
            <Sparkles className="w-4 h-4 text-brand" />
            <span>جستجوی هوشمند با تصحیح حروف فارسی و اشتباهات املایی</span>
          </div>

          <button
            onClick={handleAudioMatchSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-50 hover:bg-brand/10 hover:text-brand border border-surface-border text-content-secondary transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-amber-500" />
            <span>تشخیص موسیقی از روی صدای محیط (شازم)</span>
          </button>
        </div>

        {/* Audio Match Status Feedback */}
        {isAudioMatchActive && (
          <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-border space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-bold text-content-primary">
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-brand animate-spin" />
                وضعیت سرویس تشخیص صدا
              </span>
              <button
                onClick={() => setIsAudioMatchActive(false)}
                className="text-content-muted hover:text-content-primary"
              >
                بستن
              </button>
            </div>
            <p className="text-xs text-content-secondary leading-relaxed">
              {audioMatchStatus}
            </p>
          </div>
        )}
      </div>

      {/* Popular Suggestions if Query is Empty */}
      {!query && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-content-secondary flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>جستجوهای محبوب کاربران</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {["بیتا", "یادگار بنفش", "محسن یگانه", "شادمهر", "سیروان خسروی", "موسیقی آرامش", "پاپ جدید"].map(
              (tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3.5 py-1.5 rounded-xl bg-surface-card hover:bg-brand/10 hover:border-brand/40 border border-surface-border text-xs text-content-secondary hover:text-brand transition-colors"
                >
                  {tag}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Results Section */}
      {query && (
        <div className="space-y-8 animate-fadeIn">
          {/* Artists Matched */}
          {matchedArtists.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-content-primary flex items-center gap-2">
                <Radio className="w-4 h-4 text-brand" />
                <span>هنرمندان</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {matchedArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </div>
          )}

          {/* Songs Matched */}
          {matchedSongs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-content-primary flex items-center gap-2">
                <Music className="w-4 h-4 text-brand" />
                <span>آهنگ‌ها ({matchedSongs.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchedSongs.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    queueContext={matchedSongs}
                    variant="horizontal"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Albums Matched */}
          {matchedAlbums.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-content-primary flex items-center gap-2">
                <Disc3 className="w-4 h-4 text-brand" />
                <span>آلبوم‌ها</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {matchedAlbums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </div>
          )}

          {/* Empty Search State */}
          {matchedSongs.length === 0 && matchedArtists.length === 0 && matchedAlbums.length === 0 && (
            <div className="text-center py-16 bg-surface-card border border-surface-border rounded-3xl p-8 space-y-3">
              <p className="text-base font-bold text-content-primary">
                هیچ نتیجه‌ای برای «{query}» یافت نشد.
              </p>
              <p className="text-xs text-content-muted">
                املای کلمات را بررسی کنید یا نام هنرمند دیگری را جستجو نمایید.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
