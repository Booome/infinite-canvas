import { Tooltip, type TooltipProps } from "antd";

import { canvasThemes } from "@/lib/canvas-theme";
import { useThemeStore } from "@/stores/use-theme-store";

type ThemedTooltipProps = Omit<TooltipProps, "arrow" | "styles" | "color" | "mouseEnterDelay">;

export function ThemedTooltip(props: ThemedTooltipProps) {
    const theme = canvasThemes[useThemeStore((state) => state.theme)];
    return (
        <Tooltip
            {...props}
            mouseEnterDelay={0.2}
            arrow={false}
            styles={{ container: { background: theme.toolbar.panel, color: theme.toolbar.activeText, border: `1px solid ${theme.toolbar.border}`, boxShadow: "0 8px 24px rgba(15,23,42,.16)", fontSize: 13, fontWeight: 500 } }}
        />
    );
}
