import type { AiConfig } from "@/stores/use-config-store";
import { CanvasNodeType, type CanvasGenerationMode, type CanvasNodeMetadata, type CanvasNodeTypeId } from "@/types/canvas";

// The generation mode a node type generates in; plugin nodes fall back to image.
export function generationModeForNodeType(type: CanvasNodeTypeId): CanvasGenerationMode {
    return type === CanvasNodeType.Text ? "text" : type === CanvasNodeType.Video ? "video" : type === CanvasNodeType.Audio ? "audio" : "image";
}

// Generation parameters remembered per canvas (and per mode), so a new generation menu starts from the last used values.
// Inputs (prompt, composer content, references) are deliberately excluded.
export const GENERATION_PARAM_KEYS = ["model", "reasoningEffort", "size", "quality", "background", "count", "textCount", "seconds", "vquality", "generateAudio", "watermark", "videoMode", "audioVoice", "audioFormat", "audioSpeed", "audioInstructions"] as const;

export type CanvasGenerationDefaults = Partial<Record<CanvasGenerationMode, CanvasNodeMetadata>>;

// The preference values a fresh generation menu starts from, before any remembered parameters are layered on.
export function preferenceMetadataForMode(config: AiConfig, mode: CanvasGenerationMode): CanvasNodeMetadata {
    switch (mode) {
        case "video":
            return { model: config.videoModel || config.model, seconds: config.videoSeconds, vquality: config.vquality, generateAudio: config.videoGenerateAudio, watermark: config.videoWatermark, videoMode: config.videoMode };
        case "audio":
            return { model: config.audioModel || config.model, audioVoice: config.audioVoice, audioFormat: config.audioFormat, audioSpeed: config.audioSpeed, audioInstructions: config.audioInstructions };
        case "text":
            return { model: config.textModel || config.model, reasoningEffort: config.reasoningEffort, textCount: 1 };
        default:
            return { model: config.imageModel || config.model, size: config.size, quality: config.quality, background: config.background, count: Math.max(1, Math.min(15, Math.floor(Math.abs(Number(config.canvasImageCount || config.count)) || 1))) };
    }
}

// Overlay remembered parameters onto a config, mapping the metadata field names back to AiConfig keys.
export function applyGenerationDefaults(config: AiConfig, mode: CanvasGenerationMode, defaults?: CanvasNodeMetadata): AiConfig {
    if (!defaults) return config;
    const next = { ...config };
    // resolveModelForCapability reads the per-capability field, not `model`.
    if (defaults.model) {
        if (mode === "image") next.imageModel = defaults.model;
        else if (mode === "video") next.videoModel = defaults.model;
        else if (mode === "audio") next.audioModel = defaults.model;
        else next.textModel = defaults.model;
    }
    if (defaults.reasoningEffort) next.reasoningEffort = defaults.reasoningEffort;
    if (defaults.quality) next.quality = defaults.quality;
    if (defaults.size) next.size = defaults.size;
    if (defaults.background !== undefined) next.background = defaults.background;
    if (defaults.seconds) next.videoSeconds = defaults.seconds;
    if (defaults.vquality) next.vquality = defaults.vquality;
    if (defaults.generateAudio) next.videoGenerateAudio = defaults.generateAudio;
    if (defaults.watermark) next.videoWatermark = defaults.watermark;
    if (defaults.videoMode) next.videoMode = defaults.videoMode;
    if (defaults.audioVoice) next.audioVoice = defaults.audioVoice;
    if (defaults.audioFormat) next.audioFormat = defaults.audioFormat;
    if (defaults.audioSpeed) next.audioSpeed = defaults.audioSpeed;
    if (defaults.audioInstructions) next.audioInstructions = defaults.audioInstructions;
    // Image count resolves through canvasImageCount first, so route the remembered count there to win over the preference.
    if (defaults.count) {
        if (mode === "image") next.canvasImageCount = String(defaults.count);
        else next.count = String(defaults.count);
    }
    return next;
}

export function pickGenerationParams(metadata: CanvasNodeMetadata): CanvasNodeMetadata {
    const picked: CanvasNodeMetadata = {};
    for (const key of GENERATION_PARAM_KEYS) {
        const value = metadata[key];
        if (value !== undefined) (picked as Record<string, unknown>)[key] = value;
    }
    return picked;
}

export function updateGenerationDefaults(defaults: CanvasGenerationDefaults, mode: CanvasGenerationMode, metadata: CanvasNodeMetadata): CanvasGenerationDefaults {
    const picked = pickGenerationParams(metadata);
    if (!Object.keys(picked).length) return defaults;
    return { ...defaults, [mode]: { ...defaults[mode], ...picked } };
}
