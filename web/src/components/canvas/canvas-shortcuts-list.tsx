import { useTranslation } from "react-i18next";

import { canvasThemes } from "@/lib/canvas-theme";
import { useThemeStore } from "@/stores/use-theme-store";

type ShortcutRow = {
    keys: string[];
    label: string;
    alt?: string[];
};

export function CanvasShortcutsList() {
    const { t } = useTranslation();
    const theme = canvasThemes[useThemeStore((state) => state.theme)];

    const groups: Array<{ title: string; rows: ShortcutRow[] }> = [
        {
            title: t("canvas.shortcutGroup.view"),
            rows: [
                { keys: ["Ctrl / Space", t("canvas.shortcut.drag")], label: t("canvas.shortcut.toggleTool") },
                { keys: [t("canvas.shortcut.wheel")], label: t("canvas.shortcut.zoom") },
                { keys: [t("canvas.shortcut.zoomSlider")], label: t("canvas.shortcut.preciseZoom") },
                { keys: [t("canvas.shortcut.drag")], label: t("canvas.shortcut.boxSelect") },
            ],
        },
        {
            title: t("canvas.shortcutGroup.edit"),
            rows: [
                { keys: ["Shift / Cmd", t("canvas.shortcut.click")], label: t("canvas.shortcut.addSelection") },
                { keys: ["Ctrl / Cmd", "A"], label: t("canvas.shortcut.selectAll") },
                { keys: ["Ctrl / Cmd", "C / V"], label: t("canvas.shortcut.copyPaste") },
                { keys: ["Ctrl / Cmd", "G"], label: t("canvas.shortcut.group") },
                { keys: ["Ctrl / Cmd", "Shift", "G"], label: t("canvas.shortcut.ungroup") },
                { keys: ["Ctrl / Cmd", "Z"], label: t("canvas.undo") },
                { keys: ["Ctrl / Cmd", "Shift", "Z"], label: t("canvas.redo"), alt: ["Ctrl / Cmd", "Y"] },
                { keys: ["Delete / Backspace"], label: t("canvas.shortcut.delete") },
                { keys: ["Esc"], label: t("canvas.shortcut.escape") },
            ],
        },
        {
            title: t("canvas.shortcutGroup.focus"),
            rows: [
                { keys: ["F"], label: t("canvas.shortcut.focusSelected") },
                { keys: ["["], label: t("canvas.shortcut.focusBack") },
                { keys: ["]"], label: t("canvas.shortcut.focusForward") },
            ],
        },
        {
            title: t("canvas.shortcutGroup.media"),
            rows: [{ keys: [t("canvas.shortcut.dropMedia")], label: t("canvas.shortcut.upload") }],
        },
    ];

    const renderKeys = (keys: string[]) => (
        <span className="flex items-center gap-1">
            {keys.map((key, index) => (
                <span key={`${key}-${index}`} className="flex items-center gap-1">
                    {index ? (
                        <span className="text-[11px]" style={{ color: theme.node.faint }}>
                            +
                        </span>
                    ) : null}
                    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border px-1.5 text-[11px] font-medium leading-none" style={{ background: theme.node.fill, borderColor: theme.node.stroke, color: theme.node.text }}>
                        {key}
                    </kbd>
                </span>
            ))}
        </span>
    );

    return (
        <div className="space-y-5">
            {groups.map((group) => (
                <section key={group.title}>
                    <h3 className="mb-1.5 text-xs font-medium" style={{ color: theme.node.label }}>
                        {group.title}
                    </h3>
                    <dl className="space-y-0.5">
                        {group.rows.map((row) => (
                            <div key={row.label} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-0.5 px-1 py-1.5">
                                <dt className="min-w-0 text-sm" style={{ color: theme.node.text }}>
                                    {row.label}
                                </dt>
                                <dd className="flex flex-wrap items-center justify-end gap-1.5">
                                    {renderKeys(row.keys)}
                                    {row.alt ? (
                                        <>
                                            <span className="text-[11px]" style={{ color: theme.node.faint }}>
                                                {t("canvas.shortcut.or")}
                                            </span>
                                            {renderKeys(row.alt)}
                                        </>
                                    ) : null}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>
            ))}
        </div>
    );
}
