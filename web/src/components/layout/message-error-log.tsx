import { useEffect } from "react";
import { App } from "antd";

import { useAppLogStore } from "@/stores/use-app-log-store";

function describeLogValue(value: unknown): string {
    if (typeof value === "string") return value;
    if (value instanceof Error) return value.message;
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}

/** Records every error surfaced through antd's shared message instance, plus uncaught ones, so they stay readable in the canvas log. */
export function MessageErrorLog() {
    const { message } = App.useApp();
    const logError = useAppLogStore((state) => state.logError);

    useEffect(() => {
        const original = message.error;
        message.error = ((content: unknown, ...rest: unknown[]) => {
            logError(describeLogValue(content));
            return (original as (...args: unknown[]) => unknown)(content, ...rest);
        }) as typeof message.error;
        return () => {
            message.error = original;
        };
    }, [logError, message]);

    useEffect(() => {
        const onError = (event: ErrorEvent) => logError(event.message || "Uncaught error", event.error instanceof Error ? event.error.stack : undefined);
        const onRejection = (event: PromiseRejectionEvent) => logError(describeLogValue(event.reason), event.reason instanceof Error ? event.reason.stack : undefined);
        window.addEventListener("error", onError);
        window.addEventListener("unhandledrejection", onRejection);
        return () => {
            window.removeEventListener("error", onError);
            window.removeEventListener("unhandledrejection", onRejection);
        };
    }, [logError]);

    return null;
}
