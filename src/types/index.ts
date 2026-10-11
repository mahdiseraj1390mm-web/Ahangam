export interface SongQualityItem {
  id: string;
  quality: string;
  fileUrl: string;
  fileSize?: number | null;
  isDefault: boolean;
}

export interface SongItem {
  id: string;
  title: string;
  slug: string;
  artistId: string;
  artist: {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
  };
  albumId?: string | null;
  album?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  duration: number;
  coverImage?: string | null;
  lyrics?: string | null;
  syncedLyrics?: string | null;
  lyricist?: string | null;
  composer?: string | null;
  arranger?: string | null;
  publisher?: string | null;
  description?: string | null;
  playCount: number;
  downloadCount: number;
  isFeatured: boolean;
  isEditorPick: boolean;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  qualities: SongQualityItem[];
  genres?: { genre: { id: string; name: string; slug: string; isMood: boolean } }[];
  isFavorite?: boolean;
  ratingAverage?: number;
  ratingsCount?: number;
  createdAt: string | Date;
}

export interface ArtistItem {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  image?: string | null;
  isFeatured: boolean;
  followersCount: number;
  songsCount?: number;
  albumsCount?: number;
  isFollowing?: boolean;
}

export interface AlbumItem {
  id: string;
  title: string;
  slug: string;
  artistId: string;
  artist: {
    id: string;
    name: string;
    slug: string;
  };
  coverImage?: string | null;
  releaseYear?: number | null;
  description?: string | null;
  isFeatured: boolean;
  songs?: SongItem[];
  _count?: {
    songs: number;
  };
}

export interface PlaylistItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  isSystem: boolean;
  isPublic: boolean;
  isFeatured: boolean;
  userId?: string | null;
  songsCount?: number;
  songs?: { song: SongItem; orderIndex: number }[];
}

export interface StoryItem {
  id: string;
  title: string;
  caption?: string | null;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  targetUrl?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  isActive: boolean;
  sortOrder: number;
  viewsCount: number;
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface CommentItem {
  id: string;
  text: string;
  createdAt: string | Date;
  status: "PENDING" | "APPROVED" | "REJECTED";
  likesCount: number;
  user: {
    id: string;
    displayName: string;
    avatar?: string | null;
    role: string;
  };
  replies?: CommentItem[];
}
