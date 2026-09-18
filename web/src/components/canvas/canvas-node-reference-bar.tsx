import { FileText, Image as ImageIcon, Music2, Plus, Puzzle, Video, X } from "lucide-react";
import { useSyncExternalStore, useState } from "react";
import { useTranslation } from "react-i18next";

import { canvasThemes } from "@/lib/canvas-theme";
import { getNodeDefinition } from "@/lib/canvas/node-registry";
import { getGroupResourceNodes } from "@/lib/canvas/canvas-resource-references";
import { getImagePreviewRevision, previewUrlFor, subscribeImagePreviews } from "@/services/image-storage";
import { useThemeStore } from "@/stores/use-theme-store";
import { CanvasNodeType, type CanvasNodeData } from "@/types/canvas";
import { CanvasHoverPreview } from "./canvas-resource-preview";
import { ThemedTooltip } from "@/components/ui/themed-tooltip";

export function CanvasNodeReferenceBar({ nodeId, nodes, connectedNodes, disabled = false, onDisconnect, onStartSelection, onFocusNode }: { nodeId: string; nodes: CanvasNodeData[]; connectedNodes: CanvasNodeData[]; disabled?: boolean; onDisconnect?: (fromNodeId: string, toNodeId: string) => void; onStartSelection?: (nodeId: string) => void; onFocusNode?: (nodeId: string) => void }) {
    const { t } = useTranslation();
    const theme = canvasThemes[useThemeStore((state) => state.theme)];
    const references = connectedNodes.flatMap((sourceNode) => (sourceNode.type === CanvasNodeType.Group ? getGroupResourceNodes(sourceNode.id, nodes) : [sourceNode]).map((node) => ({ node, sourceNodeId: sourceNode.id })));
    return (
        <div className="mb-2">
            <div className="mb-1.5 text-[11px] font-medium" style={{ color: theme.node.muted }}>{t("canvas.references.title")}</div>
            <div className="thin-scrollbar flex min-h-12 gap-2 overflow-x-auto pb-1">
                {references.map(({ node, sourceNodeId }) => <ReferenceItem key={`${sourceNodeId}:${node.id}`} node={node} disabled={disabled} onRemove={() => onDisconnect?.(sourceNodeId, nodeId)} onFocus={onFocusNode ? () => onFocusNode(node.id) : undefined} />)}
                <ThemedTooltip title={t("canvas.references.select")}>
                    <button type="button" className="grid size-12 shrink-0 place-items-center rounded-xl border bg-transparent transition enabled:hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40" style={{ borderColor: theme.toolbar.border, color: theme.node.muted }} disabled={disabled} onClick={() => onStartSelection?.(nodeId)}>
                        <Plus className="size-4" />
                    </button>
                </ThemedTooltip>
            </div>
        </div>
    );
}

function ReferenceItem({ node, disabled, onRemove, onFocus }: { node: CanvasNodeData; disabled: boolean; onRemove: () => void; onFocus?: () => void }) {
    const { t } = useTranslation();
    const theme = canvasThemes[useThemeStore((state) => state.theme)];
    const [previewRect, setPreviewRect] = useState<DOMRect | null>(null);
    useSyncExternalStore(subscribeImagePreviews, getImagePreviewRevision);
    const resource = getNodeDefinition(node.type)?.resource?.(node);
    const content = node.metadata?.content || resource?.url;
    const thumbnail = previewUrlFor(node.metadata?.storageKey) || content;
    const Icon = resource?.kind === "image" || node.type === CanvasNodeType.Image ? ImageIcon : resource?.kind === "video" || node.type === CanvasNodeType.Video ? Video : resource?.kind === "audio" || node.type === CanvasNodeType.Audio ? Music2 : resource?.kind === "text" || node.type === CanvasNodeType.Text ? FileText : Puzzle;
    return (
        <>
            <div
                className={`group relative grid size-12 shrink-0 place-items-center rounded-xl border ${onFocus ? "cursor-pointer" : ""}`}
                style={{ background: theme.toolbar.activeBg, borderColor: theme.toolbar.border }}
                onMouseEnter={(event) => setPreviewRect(event.currentTarget.getBoundingClientRect())}
                onMouseLeave={() => setPreviewRect(null)}
                onClick={onFocus}
            >
                <span className="grid size-full place-items-center overflow-hidden rounded-[inherit]">
                    {(resource?.kind === "image" || node.type === CanvasNodeType.Image) && thumbnail ? <img src={thumbnail} alt="" decoding="async" className="size-full object-cover" /> : (resource?.kind === "video" || node.type === CanvasNodeType.Video) && content ? <video src={content} className="size-full object-cover" muted /> : <Icon className="size-4 opacity-65" />}
                </span>
                {disabled ? null : (
                    <ThemedTooltip title={t("canvas.references.disconnect")}>
                        <button type="button" className="absolute right-0 top-0 grid size-5 place-items-center rounded-full border opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100" style={{ background: theme.toolbar.panel, borderColor: theme.toolbar.border }} aria-label={t("canvas.references.disconnect")} onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onRemove(); }}>
                            <X className="size-3" />
                        </button>
                    </ThemedTooltip>
                )}
            </div>
            {previewRect ? (
                <CanvasHoverPreview anchorRect={previewRect} kind={resource?.kind || node.type} url={content} title={node.title} text={resource?.text || node.metadata?.content || node.metadata?.prompt || node.title} />
            ) : null}
        </>
    );
}
