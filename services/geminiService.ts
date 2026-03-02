
import { GoogleGenAI, Type, VideoGenerationReferenceType, Modality, GenerateContentResponse } from "@google/genai";
import { Episode, Scene, SeriesConfig, Language, Genre, VisualStyle, TargetEngine, Character } from "../types";

// API key is stored exclusively in browser localStorage — never in source code
export const API_KEY_STORAGE = 'storystream_apikey';
export const VIDEO_API_KEY_STORAGE = 'storystream_video_apikey';

// Text/prompt key
const getApiKey = (): string =>
  localStorage.getItem(API_KEY_STORAGE) || (typeof process !== 'undefined' ? (process.env?.API_KEY ?? '') : '');

// Video key — falls back to text key if not set separately
const getVideoApiKey = (): string =>
  localStorage.getItem(VIDEO_API_KEY_STORAGE) || getApiKey();

// AI instance for text/prompt calls
const getAI = () => new GoogleGenAI({ apiKey: getApiKey() });

// AI instance for video generation
const getVideoAI = () => new GoogleGenAI({ apiKey: getVideoApiKey() });

/**
 * Utility to handle API retries with exponential backoff for 429 errors.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorStr = JSON.stringify(error).toLowerCase();
      const isRateLimit = error?.status === 429 || 
                          error?.message?.includes('429') || 
                          error?.message?.includes('RESOURCE_EXHAUSTED') ||
                          errorStr.includes('429') ||
                          errorStr.includes('resource_exhausted') ||
                          errorStr.includes('quota');
      
      if (isRateLimit && i < maxRetries - 1) {
        const delay = Math.pow(2, i + 1) * 2000 + Math.random() * 1000;
        console.warn(`Quota reached. Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

/**
 * Base64 decoding helper for raw bytes
 */
function decodeBase64ToUint8(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts raw PCM 16-bit 24kHz audio to a playable WAV Blob
 */
async function createWavBlobFromPcm(data: Uint8Array, sampleRate: number = 24000): Promise<Blob> {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + data.length, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint16(16, 16, true); 
    view.setUint16(20, 1, true); 
    view.setUint16(22, 1, true); 
    view.setUint32(24, sampleRate, true); 
    view.setUint32(28, sampleRate * 2, true); 
    view.setUint16(32, 2, true); 
    view.setUint16(34, 16, true); 
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, data.length, true);
    return new Blob([header, data], { type: 'audio/wav' });
}

export interface TrendItem {
  title: string;
  description: string;
}

export interface TrendingResult {
  trends: TrendItem[];
  sources: { title: string, uri: string }[];
}

export const translateText = async (text: string, targetLang: Language): Promise<string> => {
    const ai = getAI();
    const prompt = `Translate the following text to ${targetLang === 'he' ? 'Hebrew' : 'English'}. Keep the style and tone identical. Return ONLY the translated text.\n\nText: ${text}`;
    try {
        const response = await withRetry(() => ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt
        })) as GenerateContentResponse;
        return response.text?.trim() || text;
    } catch (error) {
        console.error("Translation error", error);
        return text;
    }
};

export const generateRandomSeriesIdea = async (genre: Genre, lang: Language): Promise<string> => {
  const ai = getAI();
  const languageName = lang === 'he' ? 'Hebrew' : 'English';
  const prompt = `Generate a creative series idea for genre ${genre} in ${languageName}. Concise, 1-2 sentences. No quotes.`;
  try {
    const response = await withRetry(() => ai.models.generateContent({ 
      model: "gemini-2.0-flash", 
      contents: prompt 
    })) as GenerateContentResponse;
    return response.text?.trim() || "";
  } catch (error) { return ""; }
};

export const fetchTrendingInsights = async (lang: Language): Promise<TrendingResult> => {
  const ai = getAI();
  const langName = lang === 'he' ? 'Hebrew' : 'English';
  const prompt = `Perform a Google Search to find current viral TikTok and YouTube trends in Israel and globally. 
  Return a JSON object with a key "trends" containing an array of objects with "title" and "description". 
  The language of the titles and descriptions must be ${langName}. 
  Do not include Nikud in Hebrew. Output ONLY the JSON.`;

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }]
        // Note: responseMimeType cannot be used together with googleSearch tool
      }
    }), 2) as GenerateContentResponse;

    let trends: TrendItem[] = [];
    try {
       const text = response.text || "{}";
       // Extract JSON block even if model wraps it in markdown or adds text around it
       const jsonMatch = text.match(/\{[\s\S]*\}/);
       const data = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, '').trim());
       trends = data.trends || [];
    } catch (e) {
       console.error("JSON parse error in trends", e);
    }

    const sources: { title: string, uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          sources.push({ title: chunk.web.title || chunk.web.uri, uri: chunk.web.uri });
        }
      });
    }
    return { trends, sources: sources.slice(0, 10) };
  } catch (error) {
    console.error("fetchTrendingInsights error", error);
    return { trends: [], sources: [] };
  }
};

const getStyleKeywords = (style: VisualStyle): string => {
  switch (style) {
    case VisualStyle.Cinematic: 
      return "cinematic lighting, ultra-realistic, highly detailed, 8k, masterwork, dramatic atmosphere, anamorphic lens flares, rich textures";
    case VisualStyle.Anime: 
      return "high-quality anime style, studio ghibli influence, clean lines, vibrant cel-shaded, hand-drawn look, detailed background art";
    case VisualStyle.Realistic: 
      return "photorealistic, 8k uhd, sharp focus, natural textures, raw photo, realistic atmosphere, realistic skin shaders";
    case VisualStyle.Cyberpunk: 
      return "neon lights, rainy night, futuristic, synthwave palette, high contrast, wet pavement reflections, glowing tech";
    case VisualStyle.Watercolor: 
      return "soft watercolor painting, bleeding colors, artistic paper texture, dreamy atmosphere, fluid brushstrokes";
    case VisualStyle.Claymation:
      return "clay animation, plasticine textures, fingerprint details, stop-motion feel, handmade look, soft studio lighting";
    case VisualStyle.Vintage:
      return "1980s vintage film, VHS aesthetic, grain, slight color bleeding, retro atmosphere, nostalgic lighting, muted colors";
    case VisualStyle.Pixar:
      return "3D animation, Pixar style, cute character design, soft global illumination, subsurface scattering, vibrant colors, expressive features";
    case VisualStyle.Roblox:
      return "Roblox style, blocky avatars, plastic material textures, simple 3D shapes, bright primary colors, gaming aesthetic";
    case VisualStyle.Minecraft: 
      return "Minecraft voxel style, blocky 3D world, pixelated low-resolution textures, cubic character models, sandbox game aesthetic, low-poly cubes";
    case VisualStyle.Noir:
      return "film noir, black and white, high contrast, dramatic shadows, moody lighting, smoke, rainy city streets, 1940s aesthetic";
    case VisualStyle.PixelArt:
      return "16-bit pixel art, retro gaming, sprite-based, limited color palette, jagged edges, nostalgic charm";
    case VisualStyle.LowPoly:
      return "low poly 3D, geometric shapes, sharp edges, minimalist textures, flat shading, artistic 3D render";
    case VisualStyle.OilPainting:
      return "oil painting, thick brushstrokes, canvas texture, rich oil colors, impasto technique, classical art style";
    case VisualStyle.Sketch:
      return "pencil sketch, hand-drawn, graphite textures, cross-hatching, charcoal lines, artistic shading on paper";
    case VisualStyle.ComicBook:
      return "comic book style, halftone dots, bold black outlines, dynamic action lines, Marvel/DC aesthetic, pop art";
    case VisualStyle.StopMotion:
      return "stop motion animation, tangible materials, slight frame jitter, physical textures, handmade miniature feel";
    case VisualStyle.Surrealism:
      return "surrealism, dreamlike imagery, Salvador Dali style, bizarre juxtapositions, melting objects, impossible physics, metaphysical atmosphere";
    default: 
      return "cinematic, high quality, detailed, professional";
    case VisualStyle.Cocomelon:
      return "Cocomelon inspired style, 3D nursery rhyme aesthetic, big expressive eyes, bright saturated primary colors, smooth rounded shapes, high-quality 3D render";
    case VisualStyle.Disney2D:
      return "classic Disney 2D animation style, hand-drawn elegance, expressive character acting, clean outlines, magical atmosphere";
    case VisualStyle.KawaiiChibi:
      return "Kawaii Chibi style, super cute, oversized heads, big sparkling eyes, pastel color palette, adorable minimalist";
    case VisualStyle.PaperIllustration:
      return "children's book paper cutout illustration, textured hand-painted paper, collage art, vibrant and whimsical, layered depth";
    case VisualStyle.SoftPlushie:
      return "soft plush toy aesthetic, felt and fabric textures, stitched details, stuffed animal look, cozy warm lighting, fuzzy surface";
    case VisualStyle.DoodleArt:
      return "playful doodle art, felt-tip marker drawings, simple whimsical characters, white background, childlike imagination, energetic lines";   
    case VisualStyle.PaperQuilling:
      return "intricate paper quilling, 3D paper craft, rolled paper strips, vibrant filigree art, macro detail, handmade texture";
    case VisualStyle.StudioGhibli:
      return "Studio Ghibli style, hand-drawn animation, lush natural environments, soft diffused lighting, expressive emotional characters, gentle color palette, painterly backgrounds, Hayao Miyazaki aesthetic";
    case VisualStyle.Manga:
      return "black and white manga style, high-contrast ink illustration, screen tone shading, dynamic speed lines, bold panel composition, Japanese comic book aesthetic";
    case VisualStyle.Synthwave:
      return "synthwave vaporwave aesthetic, neon pink and cyan palette, retro-futuristic grid, palm trees silhouette, sunset horizon, chromatic aberration, 80s digital dream";
    case VisualStyle.LegoBrickfilm:
      return "LEGO brickfilm stop motion, plastic minifigure characters, interlocking brick environments, bright flat lighting, toy photography, claymation-like movement, colorful block world";
    case VisualStyle.Webtoon:
      return "Webtoon LINE style, Korean digital comic, clean modern illustration, soft cel shading, expressive character design, long vertical panel format, smooth gradient backgrounds";
    case VisualStyle.RetroCartoon:
      return "90s retro cartoon style, thick black outlines, flat bright colors, Looney Tunes exaggerated physics, rubber hose animation, squash and stretch, classic western animation";
    case VisualStyle.FlatMotionGraphics:
      return "flat motion graphics, 2D vector illustration, bold geometric shapes, clean minimal design, explainer animation style, vivid isolated color blocks, no shadows, corporate modern";
    case VisualStyle.DarkGothic:
      return "dark gothic fantasy, dramatic chiaroscuro lighting, moonlit stone architecture, crimson and shadow palette, ornate Victorian details, haunting atmosphere, baroque horror aesthetic";
    case VisualStyle.StainedGlass:
      return "stained glass artwork, vibrant leaded glass panels, cathedral window aesthetic, jewel-tone colors, strong black leading lines, light transmission glow, medieval illuminated art";
    case VisualStyle.SouthParkCutout:
      return "South Park paper cutout animation style, crude construction paper texture, flat 2D characters, rough cut edges, bright crayon colors, deliberately simple shapes, comedic visual style";
  }
};

const getEnginePromptLogic = (engine: TargetEngine): string => {
  switch (engine) {
    case TargetEngine.Midjourney:
      return "OPTIMIZE FOR MIDJOURNEY: Use descriptive keywords separated by commas. Focus on lighting, textures, and specific artistic styles. Do NOT use full sentences. Avoid causal verbs; use nouns and adjectives.";
    case TargetEngine.Sora:
    case TargetEngine.Veo:
      return "OPTIMIZE FOR NARRATIVE VIDEO: Describe fluid motion, physics, and causal interactions. Use natural language to describe how the scene evolves over time.";
    case TargetEngine.Runway:
    case TargetEngine.Kling:
    case TargetEngine.Luma:
      return "OPTIMIZE FOR MOTION GENERATION: Explicitly define camera movements. Describe the intensity of the action.";
    case TargetEngine.Grok:
      return "OPTIMIZE FOR GROK (xAI): Use direct, punchy, and highly structural language. Focus on technical accuracy and bold visual descriptions. Avoid poetic fluff. Prioritize clarity and high-contrast visuals.";
    default:
      return "OPTIMIZE FOR GENERAL AI: Use high-quality descriptive English, focusing on clear subjects and environment settings.";
  }
};

/**
 * Streams the series structure generation.
 * ALL config settings are injected into every scene prompt for perfect visual continuity.
 */
export async function* generateSeriesStructureStream(config: SeriesConfig, lang: Language, previousEpisodes?: Episode[]) {
  const ai = getAI();
  const styleKeywords    = getStyleKeywords(config.style);
  const engineLogic      = getEnginePromptLogic(config.targetEngine);
  const contentLangLabel = config.contentLanguage === 'he' ? 'Hebrew' : 'English';

  // ── Engine-specific prompt format rules ────────────────────────────────
  const engineFormatRules = (() => {
    switch (config.targetEngine) {
      case TargetEngine.Midjourney:
        return `TARGET ENGINE: Midjourney.
FORMAT: Use comma-separated descriptive keywords — NO full sentences. Use nouns, adjectives, lighting descriptors, style modifiers.
FORBIDDEN: verbs like "walks", "runs", "says". Use state descriptions: "standing", "mid-stride", "mouth open in speech".
APPEND to every prompt: "--ar ${config.aspectRatio === '9:16' ? '9:16' : '16:9'} --style raw --q 2"`;
      case TargetEngine.Sora:
        return `TARGET ENGINE: Sora (OpenAI).
FORMAT: Cinematic prose sentences. Describe causality and physics: "the ball rolls off the edge and falls".
Include temporal progression: what happens in the first 2s, middle, and final seconds of the ${config.videoDuration}s clip.
Use filmic language: "dolly in", "rack focus", "motivated lighting".`;
      case TargetEngine.Veo:
        return `TARGET ENGINE: Veo (Google DeepMind).
FORMAT: Natural cinematic language. Describe motion trajectories, secondary motion (hair, cloth, particles).
Specify temporal flow: opening frame vs. ending frame within ${config.videoDuration}s.
Reference photorealistic render quality. Describe physics accurately.`;
      case TargetEngine.Runway:
        return `TARGET ENGINE: Runway Gen-4.
FORMAT: Short punchy sentences. Lead with subject + action. Follow with camera command.
Explicitly state: camera motion type (push in / pull out / pan left / arc), speed (slow/medium/fast).
Keep each prompt under 150 words for best results.`;
      case TargetEngine.Kling:
        return `TARGET ENGINE: Kling AI.
FORMAT: Natural descriptive language. Focus on human motion and facial expressions — Kling excels here.
Describe micro-expressions. Include clothing physics (fabric wrinkle, hair flow direction).
State scene atmosphere clearly: indoor/outdoor, lighting mood.`;
      case TargetEngine.Luma:
        return `TARGET ENGINE: Luma Dream Machine.
FORMAT: Rich sensory prose. Emphasize material and lighting qualities (subsurface scattering, specular highlights, volumetric light).
Specify motion arc — where does the camera or subject START and END within ${config.videoDuration}s?
Avoid overly complex multi-subject scenes — Luma performs best with 1-2 focal subjects.`;
      case TargetEngine.Grok:
        return `TARGET ENGINE: Grok (xAI Aurora).
FORMAT: Direct, technical, punchy. No poetic language. Prioritize high-contrast visuals and bold compositions.
State technical specs explicitly: lighting type, lens focal length equivalent, color grade.
Use structural blocks: SUBJECT | ACTION | ENVIRONMENT | CAMERA | STYLE.`;
      default:
        return `TARGET ENGINE: General AI Video/Image Engine.
FORMAT: Clear, descriptive English prose. Balance detail with clarity. Cover subject, action, environment, lighting, and camera in order.`;
    }
  })();

  // ── Aspect ratio label ─────────────────────────────────────────────────
  const aspectRatioLabel = config.aspectRatio === '9:16'
    ? '9:16 VERTICAL — portrait / TikTok / Reels / Shorts — compose tall, keep subject centered in upper two-thirds'    : config.aspectRatio === '1:1'
    ? '1:1 SQUARE — compose centrally, Instagram/feed format, subject fills the center'
    : config.aspectRatio === '4:5'
    ? '4:5 INSTAGRAM PORTRAIT — slightly taller than square, dominant in Instagram feed, center-weighted composition'    : '16:9 HORIZONTAL — landscape / YouTube / cinema — wide panoramic framing, rule of thirds';

  // ── Duration label ─────────────────────────────────────────────────────
  const durationLabel = `${config.videoDuration} seconds per scene — pace ALL action, camera moves, and dialogue to fill exactly ${config.videoDuration}s. Describe temporal beats.`;

  // ── Dialogue mode ──────────────────────────────────────────────────────
  const dialogueMode = config.includeDialogue
    ? (config.embedDialogueInPrompt ? 'EMBED_IN_PROMPT' : 'SEPARATE_FIELD')
    : 'NO_DIALOGUE';

  const dialogueRules = dialogueMode === 'EMBED_IN_PROMPT'
    ? `💬 DIALOGUE: EMBEDDED IN PROMPT
   ⚠️  ABSOLUTE LANGUAGE RULE: ALL spoken lines MUST be written in ${contentLangLabel} — NO EXCEPTIONS.
   Even if a character is canonically from Japan, the US, or any other country, they speak ${contentLangLabel} in THIS series.
   Weave spoken lines directly into the visualPrompt narrative, e.g.:
   "...she leans forward and says in ${contentLangLabel}: '[EXACT LINE IN ${contentLangLabel.toUpperCase()}]'..."
   Also copy the raw spoken text (in ${contentLangLabel}) into the 'dialogue' JSON field.
   🚫 FORBIDDEN in dialogue/title/description fields only: Any non-${contentLangLabel} words.
   ⚠️  visualPrompt is ALWAYS written in English — this rule does NOT affect it.`
    : dialogueMode === 'SEPARATE_FIELD'
    ? `💬 DIALOGUE: SEPARATE FIELD
   ⚠️  ABSOLUTE LANGUAGE RULE: ALL spoken lines MUST be written in ${contentLangLabel} — NO EXCEPTIONS.
   Even canonical characters speak ${contentLangLabel} in this series.
   Place all spoken lines only in the 'dialogue' JSON field — written in ${contentLangLabel} ONLY.
   In visualPrompt (which is ALWAYS in English) write: "Character opens mouth to speak — see dialogue field for line."
   🚫 FORBIDDEN: Any non-${contentLangLabel} words in the dialogue field. The visualPrompt field is exempt — it stays in English always.`
    : `💬 DIALOGUE: NONE — this is a silent visual series.
   No spoken lines. Convey all emotion through action, expression, and body language only.
   The 'dialogue' field should be an empty string.`;

  // ── Subtitle instruction ───────────────────────────────────────────────
  const subtitleInstruction = config.showSubtitles
    ? `📝 SUBTITLES: REQUIRED — end every visualPrompt with:
   "Render all spoken text as burned-in subtitles at bottom of frame, clear white font with dark outline, in ${contentLangLabel}."`
    : `📝 SUBTITLES: NONE — do NOT render any on-screen text.`;

  // ── Negative prompt ────────────────────────────────────────────────────
  const negativeInstruction = config.negativePrompt
    ? `\n❌ NEGATIVE PROMPT — NEVER include these elements in any scene:\n   "${config.negativePrompt}"\n   Append this as a hard exclusion to every visualPrompt.`
    : '';

  // ── Color palette ─────────────────────────────────────────────────────
  const colorPaletteInstruction = config.colorPalette && config.colorPalette.length > 0
    ? `\n🎨 LOCKED COLOR PALETTE: ${config.colorPalette.join(', ')}\n   These colors MUST dominate ALL scenes — use them for lighting, costumes, backgrounds and props.`
    : '';

  // ── Scene mood ────────────────────────────────────────────────────────
  const moodInstruction = config.sceneMood
    ? `\n🎭 SERIES EMOTIONAL TONE: "${config.sceneMood}"\n   This mood must permeate every scene — in lighting choices, character expressions, pacing, and atmosphere.`
    : '';

  // ── Sequel context ─────────────────────────────────────────────────────
  const sequelContext = previousEpisodes && previousEpisodes.length > 0
    ? `
══════════════════════════════════════════════════════
🎬 SEQUEL MODE — PREVIOUS SEASON (MANDATORY CONTINUATION)
══════════════════════════════════════════════════════
You MUST: continue all character arcs, reference past events naturally, evolve relationships.
Open this season with a DIRECT story continuation from where Season 1 ended.

PREVIOUS SEASON:
${previousEpisodes.map(ep => `  Ep${ep.id} "${ep.title}": ${ep.description}\n  Scenes: ${ep.scenes.map(s => s.description).join(' → ')}`).join('\n')}
══════════════════════════════════════════════════════
`
    : '';

  // ── System instruction ─────────────────────────────────────────────────
  const systemInstruction = `You are a World-Class Screenwriter AND Visual Continuity Director specializing in AI-generated video series.

╔══════════════════════════════════════════════════════════════════╗
   🔒 ABSOLUTE RULE #1 — FIELD LANGUAGE ASSIGNMENTS (OVERRIDES ALL)
╚══════════════════════════════════════════════════════════════════╝
   • "visualPrompt" JSON field → ENGLISH ONLY. Always. No matter what language is selected.
     NEVER write Hebrew, Arabic, Japanese, or any non-English text in visualPrompt. Ever.
   • "hebrewVisualPrompt" JSON field → Hebrew translation of visualPrompt only. No Nikud.
   • "title", "description", "dialogue" JSON fields → ${contentLangLabel} ONLY.
   This rule is absolute and cannot be overridden by any character backstory or other instruction.

╔══════════════════════════════════════════════════════════════════╗
   GLOBAL SERIES LOCK — EVERY RULE BELOW APPLIES TO EVERY SCENE
╚══════════════════════════════════════════════════════════════════╝

🎨 VISUAL STYLE: "${config.style}"
   MANDATORY style descriptor to inject into EVERY visualPrompt:
   → "${styleKeywords}"
   All scenes MUST share identical color grading, rendering aesthetic, and detail level.
   A viewer must be able to tell all scenes belong to the same series at a glance.

📐 ASPECT RATIO: ${aspectRatioLabel}
   Compose EVERY shot explicitly for this ratio. Describe subject placement accordingly.

⏱  SCENE DURATION: ${durationLabel}

🎥 CAMERA ANGLE LOCK: "${config.camera}"
   This camera angle is MANDATORY for all scenes unless a critical story beat requires an exception.
   EVERY visualPrompt MUST end with a Camera Line:
   → "Camera: ${config.camera} — [specific movement] — [lens behavior]."

🌍 ENVIRONMENT CONTINUITY LOCK:
   Scene 1 of each location ESTABLISHES the environment. Every subsequent scene in the same location
   MUST copy these elements verbatim (mark each with [LOCKED]):
     [LOCKED] Lighting: exact time of day, light sources, color temperature, shadows
     [LOCKED] Architecture/Set: walls, floor, furniture, fixed props
     [LOCKED] Atmosphere: fog, rain, dust, neon glow, particle effects
   Never describe a locked environment differently — word-for-word repetition ensures AI consistency.

🧬 CHARACTER DNA LOCK:
   Every character appearing in a scene MUST have their FULL physical DNA block at the START
   of the visualPrompt. NEVER refer to a character by name alone.
   Required DNA format:
   "[NAME] — face: [exact facial features, skin tone, eye color, expression];
    hair: [color, length, style, any accessories];
    clothing: [every garment — color, material, fit, logos, rips, which side];
    accessories: [every item — which hand, which ear, etc.];"

${dialogueRules}

${subtitleInstruction}
${negativeInstruction}${colorPaletteInstruction}${moodInstruction}

🌐 OUTPUT LANGUAGE RULES — REINFORCEMENT (see Absolute Rule #1 above):
   • visualPrompt field → ENGLISH ONLY — AI video engines cannot process other languages.
   • hebrewVisualPrompt field → complete Hebrew translation of visualPrompt (no Nikud).
   • title, description, dialogue fields → ${contentLangLabel} ONLY.
   • Character names → keep consistent spelling in both languages.
   • 🚫 CRITICAL: ALL dialogue spoken by ALL characters MUST be in ${contentLangLabel}.
     It does NOT matter what language the character speaks in their source material.
     Naruto speaks ${contentLangLabel}. Caesar speaks ${contentLangLabel}. Everyone speaks ${contentLangLabel}.
     ZERO words of Japanese / Latin / French / Spanish / any other language are permitted
     in title, description, or dialogue fields.
     This includes catchphrases, signatures, and sound effects with words.

${engineFormatRules}

📋 STRICT FORMAT: Return ONLY a valid JSON array. Zero text outside the JSON. No markdown code fences. No commentary.`;

  // ── Character DNA registry ─────────────────────────────────────────────
  const charactersDNA = config.characters
    .filter(c => c.name || c.description)
    .map(c => `DNA "${c.name}": ${c.description}`)
    .join('\n\n');

  // ── Main prompt ────────────────────────────────────────────────────────
  const promptText = `TASK: Generate a complete AI video series storyboard. Return a JSON array ONLY.

════════════════════════════ SERIES BRIEF ════════════════════════════
Topic / Plot:       "${config.topic}"
Genre:              ${config.genre}
Total Episodes:     ${config.episodeCount}
Scenes / Episode:   ${config.scenesPerEpisode}
Scene Duration:     ${config.videoDuration} seconds each
Visual Style:       ${config.style}
Style Keywords:     ${styleKeywords}
Camera Angle:       ${config.camera} ← LOCK THIS FOR ALL SCENES
Aspect Ratio:       ${config.aspectRatio}
Target Engine:      ${config.targetEngine}
Content Language:   ${contentLangLabel}
Dialogue Mode:      ${dialogueMode}
Subtitles:          ${config.showSubtitles ? 'YES — burn into frame' : 'NO'}
${config.negativePrompt ? `Negative Prompt:    ${config.negativePrompt}` : ''}
${config.colorPalette && config.colorPalette.length > 0 ? `Color Palette:      ${config.colorPalette.join(', ')}` : ''}
${config.sceneMood ? `Series Mood:        ${config.sceneMood}` : ''}
${config.conceptImage ? '\n📸 CONCEPT IMAGE ATTACHED → Extract protagonist physical DNA from image. This is the PRIMARY visual reference. Every detail of their appearance must be locked from Frame 1.' : ''}

═══════════════════════ CHARACTER DNA REGISTRY ═══════════════════════
${charactersDNA || 'No characters specified — invent visually consistent recurring characters that fit the genre and style.'}
${config.characterInstructions ? `\nSPECIAL CHARACTER INSTRUCTIONS (follow exactly):\n${config.characterInstructions}` : ''}

${sequelContext}

════════════════════ MANDATORY visualPrompt STRUCTURE ════════════════
Each visualPrompt MUST contain ALL of the following sections IN ORDER (minimum 200 words total):

SECTION 1 — CHARACTER DNA
  Repeat the complete DNA block for every character in this scene. No shortcuts, no name-only references.

SECTION 2 — ACTION & EMOTION
  What is each character doing? What micro-expressions and body language convey their emotional state?

SECTION 3 — ENVIRONMENT [LOCKED after scene 1 per location]
  Describe the setting, lighting ([LOCKED] if established), props, atmosphere in full detail.

SECTION 4 — STYLE SIGNATURE LINE (copy exactly, fill in brackets):
  "Visual style: ${config.style}. Style keywords: ${styleKeywords}. Aspect ratio: ${config.aspectRatio}. Scene duration: ${config.videoDuration}s."

SECTION 5 — CAMERA LINE (mandatory final line):
  "Camera: ${config.camera} — [describe movement: push in / arc / static / pan] — [lens behavior: shallow DOF / wide angle / telephoto compression]."
${config.showSubtitles ? `\nSECTION 6 — SUBTITLE LINE (mandatory):\n  "Render all spoken text as burned-in subtitles at the bottom of the frame in ${contentLangLabel}."` : ''}

ENGINE NOTE: ${engineLogic}
`;

  // ── Schema ─────────────────────────────────────────────────────────────
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        scenes: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
                id: { type: Type.INTEGER },
                description: { type: Type.STRING },
                dialogue: { type: Type.STRING },
                visualPrompt: { type: Type.STRING },
                hebrewVisualPrompt: { type: Type.STRING },
             },
             required: ["id", "description", "visualPrompt", "hebrewVisualPrompt"]
          }
        }
      },
      required: ["id", "title", "description", "scenes"],
    },
  };

  // ── Build content parts ────────────────────────────────────────────────
  const contents: any[] = [];
  if (config.conceptImage && config.conceptImageMimeType) {
    contents.push({ inlineData: { data: config.conceptImage, mimeType: config.conceptImageMimeType } });
  }
  contents.push({ text: promptText });

  const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: { parts: contents },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 8192 }
      },
  });

  let fullText = "";
  for await (const chunk of responseStream) {
      fullText += (chunk.text || "");
      yield fullText;
  }
}

export const generateSeriesStructure = async (config: SeriesConfig, lang: Language, previousEpisodes?: Episode[]): Promise<Episode[]> => {
    const gen = generateSeriesStructureStream(config, lang, previousEpisodes);
    let lastText = "";
    for await (const text of gen) {
        lastText = text;
    }
    const cleaned = lastText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
};

export const generateSceneAudio = async (text: string, lang: Language, voiceName?: string): Promise<string> => {
    const ai = getAI();
    const selectedVoice = voiceName || (lang === 'he' ? 'Kore' : 'Charon');
    const prompt = lang === 'he' ? `דבר בקול רגוע וקריא: ${text}` : `Speak clearly and naturally: ${text}`;
    try {
        const response = await withRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } },
            },
        })) as GenerateContentResponse;
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data");
        const rawBytes = decodeBase64ToUint8(base64Audio);
        const wavBlob = await createWavBlobFromPcm(rawBytes, 24000);
        return URL.createObjectURL(wavBlob);
    } catch (error) { throw error; }
};

export const generateSceneImage = async (prompt: string, aspectRatio: string, characters?: Character[]): Promise<{ data: string, mimeType: string }> => {
    const ai = getAI();
    const targetAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';
    
    let consistencyPrompt = prompt;
    if (characters && characters.length > 0) {
        const charContext = characters.map(c => `${c.name}: ${c.description}`).join(". ");
        consistencyPrompt = `STRICT VISUAL CONTINUITY PROTOCOL: [Full Characters DNA: ${charContext}]. [Current Scene: ${prompt}]. Ensure absolute consistency. Use the DNA as the primary reference for drawing the character.`;
    }

    try {
        const response = await withRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: consistencyPrompt }] },
            config: { imageConfig: { aspectRatio: targetAspectRatio } }
        })) as GenerateContentResponse;
        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (!imagePart || !imagePart.inlineData) throw new Error("Image failed");
        return { data: imagePart.inlineData.data, mimeType: imagePart.inlineData.mimeType };
    } catch (error) { throw error; }
};

export const generateEpisodeVideo = async (
  visualPrompt: string, 
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5',
  durationSeconds: number,
  onStatusUpdate: (status: string) => void,
  lang: Language,
  characterImages: { data: string, mimeType: string }[] = [],
  startImage?: { data: string, mimeType: string },
  lastFrame?: { data: string, mimeType: string }
): Promise<string> => {
  if (window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) await window.aistudio.openSelectKey();
  }
  const ai = getVideoAI();
  onStatusUpdate("Synthesizing context...");

  try {
      const characterRefs = characterImages.slice(0, 3);
      const useMultiRef = characterRefs.length > 0 && aspectRatio === '16:9';
      const modelName = 'veo-3.1-generate-preview';
      
      const config: any = { 
          numberOfVideos: 1, 
          resolution: '720p', 
          aspectRatio: aspectRatio,
          durationSeconds: durationSeconds
      };

      if (lastFrame) config.lastFrame = { imageBytes: lastFrame.data, mimeType: lastFrame.mimeType };

      const params: any = {
          model: modelName,
          prompt: `${visualPrompt} (Maintain strict character likeness and physical DNA consistency, 24fps, cinematic fluid motion)`,
          config: config
      };

      if (startImage) params.image = { imageBytes: startImage.data, mimeType: startImage.mimeType };

      if (useMultiRef) {
          config.referenceImages = characterRefs.map(img => ({
              image: { imageBytes: img.data, mimeType: img.mimeType },
              referenceType: VideoGenerationReferenceType.ASSET
          }));
      }

      let operation = await withRetry(() => ai.models.generateVideos(params), 2) as any;

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation }) as any;
      }
      
      if (operation.error) throw new Error(operation.error.message);
      const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!videoUri) throw new Error('No video URI returned from generation');

      // Fetch video as a blob URL so the API key never appears in the DOM or src attributes
      try {
        const videoResponse = await fetch(`${videoUri}&key=${getVideoApiKey()}`);
        if (!videoResponse.ok) throw new Error(`Video fetch failed: ${videoResponse.status}`);
        const videoBlob = await videoResponse.blob();
        return URL.createObjectURL(videoBlob);
      } catch {
        // Fallback: return URI directly (key still goes through network, but not in DOM)
        return `${videoUri}&key=${getVideoApiKey()}`;
      }
  } catch (error) { throw error; }
};
