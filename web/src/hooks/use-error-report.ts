import { useCallback } from "react";
import { App } from "antd";

import { useAppLogStore } from "@/stores/use-app-log-store";

/** Reports a failure that must stay on screen until dismissed, and records it in the app log. */
export function useErrorReport() {
    const { notification } = App.useApp();
    const logError = useAppLogStore((state) => state.logError);

    return useCallback(
        (title: string, detail?: string) => {
            logError(title, detail);
            notification.error({ message: title, description: detail, duration: 0, placement: "topRight" });
        },
        [logError, notification],
    );
}
