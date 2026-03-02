# Copilot Instructions — AI Video Series Generator

## API Cost Policy

**Always use free-tier Gemini models. Never suggest paid models without explicit user approval.**

### Approved free-tier models (use these by default):
- `gemini-2.0-flash` — text, translation, short generation
- `gemini-2.5-flash` — reasoning, structured output, streaming
- `gemini-2.5-flash-preview-tts` — audio/TTS
- `gemini-2.5-flash-preview-image-generation` — image generation

### Paid models (DO NOT use unless user explicitly requests):
- `gemini-2.5-pro` — no, use `gemini-2.5-flash` instead
- `veo-3.1-generate-preview` — no free alternative exists, only use for video

### thinkingBudget rules:
- Default: 4096 or less
- Complex reasoning: up to 8192
- Never set 32768+ without user approval

## Code Principles

1. **Cache first** — before any API call, check localStorage for cached result (TTL: 6h for trending/translations)
2. **Guard duplicates** — if content already exists (`scene.imageUrl`, `scene.hebrewVisualPrompt`, etc.), skip or confirm before regenerating
3. **Debounce user triggers** — minimum 3s between repeated user-triggered API calls
4. **Minimize tokens** — keep prompts concise; always set `maxOutputTokens` explicitly

## Project Stack

- React + TypeScript + Vite
- Supabase (auth + DB) — `https://qtnqyiomxwwvadqbluoe.supabase.co`
- Google Gemini API (`@google/genai`) — primary AI provider
- Netlify (deployment) — auto-deploy from GitHub `main` branch

## File Structure

- `services/geminiService.ts` — all Gemini API calls
- `components/` — React UI components
- `App.tsx` — main app logic and state
- `types.ts` — TypeScript interfaces
- `translations.ts` — i18n strings
- `templates.ts` — series templates

## Language

- UI supports Hebrew (RTL) and English
- Code comments and variable names in English
- User-facing strings go through `translations.ts`
