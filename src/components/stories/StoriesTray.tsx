"use client";

import React, { useState } from "react";
import { StoryItem } from "@/types";
import { StoryModal } from "./StoryModal";
import { Sparkles } from "lucide-react";

export function StoriesTray({ stories }: { stories: StoryItem[] }) {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  if (!stories || stories.length === 0) return null;

  return (
    <div className="py-2 mb-6">
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none px-1">
        {stories.map((story, index) => (
          <button
            key={story.id}
            onClick={() => setSelectedStoryIndex(index)}
            className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
          >
            {/* Gradient Ring */}
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-brand to-pink-500 group-hover:scale-105 transition-transform duration-300 shadow-md">
              <div className="p-0.5 rounded-full bg-surface-card">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden bg-surface-100">
                  <img
                    src={story.mediaUrl}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
            <span className="text-[11px] font-medium text-content-primary max-w-[70px] truncate text-center">
              {story.title}
            </span>
          </button>
        ))}
      </div>

      {selectedStoryIndex !== null && (
        <StoryModal
          stories={stories}
          initialIndex={selectedStoryIndex}
          isOpen={selectedStoryIndex !== null}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}
    </div>
  );
}
