"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { StoryItem } from "@/types";

interface StoryModalProps {
  stories: StoryItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function StoryModal({ stories, initialIndex, isOpen, onClose }: StoryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen || isPaused || stories.length === 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((c) => c + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2; // 50 ticks = ~2.5 seconds total duration
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, currentIndex, stories.length, onClose]);

  if (!isOpen || stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((c) => c + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((c) => c - 1);
      setProgress(0);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4"
    >
      <div
        className="relative w-full max-w-sm h-[85vh] max-h-[700px] rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10 flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Story background media */}
        <div className="absolute inset-0 z-0">
          {currentStory.mediaType === "VIDEO" ? (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              playsInline
              muted={false}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt={currentStory.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback image if remote url fails
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80";
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 pointer-events-none" />
        </div>

        {/* Top Progress Bars */}
        <div className="p-4 space-y-3 z-10">
          <div className="flex gap-1.5 w-full">
            {stories.map((s, idx) => (
              <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{
                    width:
                      idx === currentIndex
                        ? `${progress}%`
                        : idx < currentIndex
                        ? "100%"
                        : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between text-white">
            <h4 className="text-sm font-bold truncate">{currentStory.title}</h4>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation tap targets */}
        <div className="absolute inset-y-16 inset-x-0 flex justify-between z-10 pointer-events-none">
          <button
            onClick={handlePrev}
            className="w-1/3 h-full pointer-events-auto"
            aria-label="استوری قبلی"
          />
          <button
            onClick={handleNext}
            className="w-2/3 h-full pointer-events-auto"
            aria-label="استوری بعدی"
          />
        </div>

        {/* Bottom CTA / Caption */}
        <div className="p-5 space-y-3 z-10 text-white">
          {currentStory.caption && (
            <p className="text-sm font-medium leading-relaxed drop-shadow-md">
              {currentStory.caption}
            </p>
          )}

          {currentStory.targetUrl && (
            <Link
              href={currentStory.targetUrl}
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-brand text-white font-bold text-sm shadow-lg hover:opacity-95 transition-opacity"
            >
              <span>مشاهده و شنیدن</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
