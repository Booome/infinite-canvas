import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { canvasThemes } from "@/lib/canvas-theme";
import type { CanvasResourceKind } from "@/lib/canvas/canvas-resource-references";
import { useThemeStore } from "@/stores/use-theme-store";

const PREVIEW_MAX_HEIGHT = 416;

type CanvasResourcePreviewProps = {
    kind?: CanvasResourceKind | string | null;
    url?: string;
    title?: string;
    text?: string;
};

export function CanvasResourcePreview({ kind, url, title, text }: CanvasResourcePreviewProps) {
    const { t } = useTranslation();
    const theme = canvasThemes[useThemeStore((state) => state.theme)];
    return (
        <div className="overflow-hidden rounded-lg border p-0.5 shadow-2xl" style={{ background: theme.toolbar.panel, borderColor: theme.toolbar.border }}>
            {kind === "image" && url ? (
                <img src={url} alt={title || ""} decoding="async" className="block max-h-[26rem] max-w-[36rem] rounded-md object-contain" />
            ) : kind === "video" && url ? (
                <video src={url} className="block max-h-[26rem] max-w-[36rem] rounded-md object-contain" muted controls preload="metadata" />
            ) : kind === "audio" && url ? (
                <audio src={url} className="block w-[36rem] max-w-full p-2" controls />
            ) : (
                <div className="max-h-[26rem] w-[36rem] max-w-full overflow-auto whitespace-pre-wrap p-3 text-sm" style={{ color: theme.node.text }}>
                    {text || title || t("canvas.references.empty")}
                </div>
            )}
        </div>
    );
}

export function CanvasHoverPreview({ anchorRect, ...preview }: CanvasResourcePreviewProps & { anchorRect: DOMRect }) {
    const spaceAbove = anchorRect.top - 12;
    const spaceBelow = window.innerHeight - anchorRect.bottom - 12;
    const placeBelow = spaceAbove < Math.min(PREVIEW_MAX_HEIGHT, spaceBelow);
    return createPortal(
        <div className="pointer-events-none fixed z-[1200]" style={{ left: anchorRect.left + anchorRect.width / 2, top: placeBelow ? anchorRect.bottom + 6 : anchorRect.top - 6, transform: placeBelow ? "translateX(-50%)" : "translate(-50%,-100%)" }}>
            <CanvasResourcePreview {...preview} />
        </div>,
        document.body,
    );
}
