import { cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactElement } from "react";
import { Tooltip, type GetRef, type TooltipProps } from "antd";

import { canvasThemes } from "@/lib/canvas-theme";
import { useThemeStore } from "@/stores/use-theme-store";

type ThemedTooltipProps = Omit<TooltipProps, "arrow" | "styles" | "color" | "mouseEnterDelay"> & { followCursor?: boolean };

type CursorChildProps = { onMouseMove?: (event: ReactMouseEvent<HTMLElement>) => void };

const CURSOR_POINTS: [string, string] = ["tl", "tl"];
const CURSOR_GAP = 12;
const CURSOR_STEP = 2;

export function ThemedTooltip({ followCursor = false, children, ...props }: ThemedTooltipProps) {
    const theme = canvasThemes[useThemeStore((state) => state.theme)];
    const tooltipRef = useRef<GetRef<typeof Tooltip>>(null);
    const cursorRef = useRef<[number, number]>(undefined);
    const frameRef = useRef(0);
    const [cursor, setCursor] = useState<[number, number]>();

    useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

    const flushCursor = () => {
        frameRef.current = 0;
        if (cursorRef.current) setCursor(cursorRef.current);
    };

    let content = children;
    if (followCursor && isValidElement(children)) {
        const child = children as ReactElement<CursorChildProps>;
        content = cloneElement(child, {
            onMouseMove: (event: ReactMouseEvent<HTMLElement>) => {
                child.props.onMouseMove?.(event);
                const box = event.currentTarget.getBoundingClientRect();
                const next: [number, number] = [box.left - event.clientX - CURSOR_GAP, box.top - event.clientY - CURSOR_GAP];
                const prev = cursorRef.current;
                if (prev && Math.abs(prev[0] - next[0]) < CURSOR_STEP && Math.abs(prev[1] - next[1]) < CURSOR_STEP) return;
                cursorRef.current = next;
                if (!frameRef.current) frameRef.current = requestAnimationFrame(flushCursor);
            },
        });
    }

    useLayoutEffect(() => {
        if (cursor) tooltipRef.current?.forceAlign();
    }, [cursor]);

    return (
        <Tooltip
            {...props}
            ref={tooltipRef}
            align={cursor ? { ...props.align, points: CURSOR_POINTS, targetOffset: cursor } : props.align}
            mouseEnterDelay={0.2}
            arrow={false}
            styles={{ container: { background: theme.toolbar.panel, color: theme.toolbar.activeText, border: `1px solid ${theme.toolbar.border}`, boxShadow: "0 8px 24px rgba(15,23,42,.16)", fontSize: 13, fontWeight: 500 } }}
        >
            {content}
        </Tooltip>
    );
}
