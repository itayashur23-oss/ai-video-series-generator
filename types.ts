
export enum VisualStyle {
  Cinematic = 'Cinematic',
  Anime = 'Anime',
  Realistic = 'Realistic',
  Cyberpunk = 'Cyberpunk',
  Watercolor = 'Watercolor',
  Claymation = 'Claymation',
  Vintage = 'Vintage Film (1980s)',
  Pixar = '3D Animation (Pixar style)',
  Roblox = '3D Game Render (Roblox style)',
  Minecraft = 'Minecraft (Voxel Style)',
  Noir = 'Film Noir (Black & White)',
  PixelArt = 'Pixel Art (16-bit)',
  LowPoly = 'Low Poly 3D',
  OilPainting = 'Oil Painting',
  Sketch = 'Pencil Sketch',
  ComicBook = 'Comic Book Style',
  StopMotion = 'Stop Motion',
  Surrealism = 'Surrealism',
  Cocomelon = 'Cocomelon Style',
  Disney2D = 'Disney 2D Classic',
  KawaiiChibi = 'Kawaii Chibi',
  PaperIllustration = 'Paper Illustration',
  SoftPlushie = 'Soft Plushie',
  DoodleArt = 'Doodle Art',
  PaperQuilling = 'Intricate Paper Quilling',
  StudioGhibli = 'Studio Ghibli',
  Manga = 'Manga (Black & White)',
  Synthwave = 'Synthwave / Vaporwave',
  LegoBrickfilm = 'Lego Brickfilm',
  Webtoon = 'Webtoon / LINE Style',
  RetroCartoon = 'Retro Cartoon (90s)',
  FlatMotionGraphics = 'Flat Motion Graphics',
  DarkGothic = 'Dark Gothic Fantasy',
  StainedGlass = 'Stained Glass Art',
  SouthParkCutout = 'South Park Cutout'
}

export enum Genre {
  SciFi = 'Science Fiction',
  Fantasy = 'Fantasy',
  Drama = 'Drama',
  Comedy = 'Comedy',
  Thriller = 'Thriller',
  Horror = 'Horror',
  Action = 'Action & Adventure',
  Documentary = 'Documentary',
  Romance = 'Romance',
  Mystery = 'Mystery',
  Historical = 'Historical',
  Musical = 'Musical',
  Western = 'Western',
  Noir = 'Film Noir',
  Educational = 'Educational',
  MusicVideo = 'Music Video',
  Tutorial = 'Tutorial',
  Commercial = 'Commercial',
  SliceOfLife = 'Slice of Life',
  TrueCrime = 'True Crime',
  Mockumentary = 'Mockumentary',
  Sports = 'Sports & Athletics',
  KidsAndFamily = 'Kids & Family'
}

export enum CameraAngle {
  Wide = 'Wide Shot',
  Medium = 'Medium Shot',
  CloseUp = 'Close Up',
  FullBody = 'Full Body Shot',
  BirdsEye = 'Bird\'s Eye View',
  EyeLevel = 'Eye Level Shot',
  LowAngle = 'Low Angle',
  HighAngle = 'High Angle',
  OverTheShoulder = 'Over The Shoulder',
  Drone = 'Drone Shot',
  POV = 'Point of view',
  DutchAngle = 'Dutch Angle (Tilted)',
  ExtremeCloseUp = 'Extreme Close Up',
  TwoShot = 'Two Shot',
  TrackingShot = 'Tracking Shot'
}

export enum TargetEngine {
  Veo = 'Veo (Google)',
  Midjourney = 'Midjourney',
  Kling = 'Kling AI',
  Sora = 'Sora (OpenAI)',
  Runway = 'Runway Gen-3',
  Luma = 'Luma Dream Machine',
  Grok = 'Grok (xAI)'
}

export type Language = 'he' | 'en';

export type PlanTier = 'free' | 'pro' | 'studio';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanTier;
  tokens: number;
}

export interface Scene {
  id: number;
  description: string;
  visualPrompt: string;
  hebrewVisualPrompt?: string; 
  dialogue?: string;
  videoUrl?: string;
  audioUrl?: string; 
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'generating_image' | 'generating_audio';
  error?: string;
  startImage?: string;
  startImageMimeType?: string;
  lastFrame?: string;
  lastFrameMimeType?: string;
}

export interface Episode {
  id: number;
  title: string;
  description: string;
  dialogue?: string;
  scenes: Scene[];
}

export interface Character {
  id: string;
  name: string;
  description: string;
  image?: string;
  imageMimeType?: string;
  voiceName?: string;
}

export interface SeriesConfig {
  topic: string;
  conceptImage?: string;
  conceptImageMimeType?: string;
  genre: Genre;
  targetEngine: TargetEngine;
  contentLanguage: Language;
  episodeCount: number;
  scenesPerEpisode: number;
  style: VisualStyle;
  camera: CameraAngle;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  videoDuration: number;
  includeDialogue: boolean; 
  embedDialogueInPrompt?: boolean;
  showSubtitles?: boolean;
  characters: Character[];
  characterInstructions?: string;
  startImage?: string;
  startImageMimeType?: string;
  negativePrompt?: string;
  colorPalette?: string[];
  sceneMood?: string;
}

// Added SeriesTemplate interface to fix import errors in SetupForm.tsx and templates.ts
export interface SeriesTemplate {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  thumbnailIcon: string;
  config: Partial<SeriesConfig>;
}

export interface SavedSeries {
  id: string;
  createdAt: number;
  config: SeriesConfig;
  episodes: Episode[];
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
