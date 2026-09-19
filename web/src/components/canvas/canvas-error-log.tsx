import { useState } from "react";
import { Button, Modal } from "antd";
import { ScrollText } from "lucide-react";
import { useTranslation } from "react-i18next";

import { canvasThemes } from "@/lib/canvas-theme";
import { useCopyText } from "@/hooks/use-copy-text";
import { useAppLogStore } from "@/stores/use-app-log-store";
import { useThemeStore } from "@/stores/use-theme-store";
import { ThemedTooltip } from "@/components/ui/themed-tooltip";

function formatLogTime(time: number) {
    return new Date(time).toLocaleTimeString([], { hour12: false });
}

export function CanvasErrorLog() {
    const { t } = useTranslation();
    const theme = canvasThemes[useThemeStore((state) => state.theme)];
    const entries = useAppLogStore((state) => state.entries);
    const clear = useAppLogStore((state) => state.clear);
    const copyText = useCopyText();
    const [open, setOpen] = useState(false);

    const copyAll = () => {
        const text = entries.map((entry) => `[${formatLogTime(entry.time)}] ${entry.title}${entry.detail ? `\n${entry.detail}` : ""}`).join("\n\n");
        copyText(text, t("canvas.errorLog.copied"));
    };

    return (
        <>
            <ThemedTooltip title={t("canvas.errorLog.title")} placement="bottom">
                <button type="button" className="relative grid size-8 shrink-0 place-items-center rounded-md opacity-70 transition hover:opacity-100" style={{ color: theme.node.text }} onClick={() => setOpen(true)} aria-label={t("canvas.errorLog.title")}>
                    <ScrollText className="size-4" />
                    {entries.length ? <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full" style={{ background: "#ef4444" }} /> : null}
                </button>
            </ThemedTooltip>
            <Modal title={t("canvas.errorLog.title")} width={640} open={open} centered footer={null} onCancel={() => setOpen(false)}>
                {entries.length ? (
                    <div className="thin-scrollbar max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                        {entries.map((entry) => (
                            <div key={entry.id} className="rounded-lg border px-3 py-2" style={{ borderColor: theme.toolbar.border }}>
                                <span className="block text-[11px] tabular-nums" style={{ color: theme.node.muted }}>
                                    {formatLogTime(entry.time)}
                                </span>
                                <div className="mt-1 select-text text-sm leading-snug" style={{ color: theme.node.text }}>
                                    {entry.title}
                                </div>
                                {entry.detail ? (
                                    <div className="mt-1 select-text whitespace-pre-wrap break-words text-xs leading-snug opacity-70" style={{ color: theme.node.text }}>
                                        {entry.detail}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-10 text-center text-sm" style={{ color: theme.node.muted }}>
                        {t("canvas.errorLog.empty")}
                    </div>
                )}
                <div className="mt-4 flex justify-end gap-2">
                    <Button onClick={clear} disabled={!entries.length}>
                        {t("canvas.errorLog.clear")}
                    </Button>
                    <Button type="primary" onClick={copyAll} disabled={!entries.length}>
                        {t("canvas.errorLog.copyAll")}
                    </Button>
                </div>
            </Modal>
        </>
    );
}
