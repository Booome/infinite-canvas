import type { AiConfig } from "@/stores/use-config-store";
import { CanvasNodeType, type CanvasGenerationMode, type CanvasGenerationSnapshot, type CanvasNodeData, type CanvasNodeMetadata, type CanvasNodeTypeId } from "@/types/canvas";

export function generationModeForNodeType(type: CanvasNodeTypeId): CanvasGenerationMode {
    return type === CanvasNodeType.Text ? "text" : type === CanvasNodeType.Video ? "video" : type === CanvasNodeType.Audio ? "audio" : "image";
}

export const GENERATION_PARAM_KEYS = ["model", "reasoningEffort", "size", "quality", "background", "count", "textCount", "seconds", "vquality", "generateAudio", "watermark", "videoMode", "audioVoice", "audioFormat", "audioSpeed", "audioInstructions"] as const;

export type CanvasGenerationDefaults = Partial<Record<CanvasGenerationMode, CanvasNodeMetadata>>;

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

export function applyGenerationDefaults(config: AiConfig, mode: CanvasGenerationMode, defaults?: CanvasNodeMetadata): AiConfig {
    if (!defaults) return config;
    const next = { ...config };
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

export function createGenerationSnapshot(mode: CanvasGenerationMode, metadata: CanvasNodeMetadata, prompt: string, referenceNodeIds: string[]): CanvasGenerationSnapshot {
    return { mode, params: pickGenerationParams(metadata), prompt, referenceNodeIds };
}

export function isUploadedMaterial(node: CanvasNodeData) {
    return node.metadata?.userContent === true;
}

export function generationSnapshotDiffers(snapshot: CanvasGenerationSnapshot | undefined, mode: CanvasGenerationMode, metadata: CanvasNodeMetadata, prompt: string, referenceNodeIds: string[]) {
    if (!snapshot) return false;
    if (snapshot.mode !== mode) return true;
    if ((snapshot.prompt || "") !== (prompt || "")) return true;
    if (!sameIdSet(snapshot.referenceNodeIds, referenceNodeIds)) return true;
    const params = pickGenerationParams(metadata);
    const keys = new Set([...Object.keys(snapshot.params), ...Object.keys(params)]);
    for (const key of keys) {
        const before = (snapshot.params as Record<string, unknown>)[key];
        const after = (params as Record<string, unknown>)[key];
        if (JSON.stringify(before) !== JSON.stringify(after)) return true;
    }
    return false;
}

function sameIdSet(before?: string[], after?: string[]) {
    const a = before || [];
    const b = after || [];
    if (a.length !== b.length) return false;
    const set = new Set(a);
    return b.every((id) => set.has(id));
}
