import { useState } from "react";
import { Button } from "antd";
import { ThemedTooltip } from "@/components/ui/themed-tooltip";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PromptSelectDialog } from "@/components/prompts/prompt-select-dialog";
import { canvasThemes } from "@/lib/canvas-theme";
import { useThemeStore } from "@/stores/use-theme-store";

export function CanvasPromptLibrary({ onSelect, disabled = false }: { onSelect: (prompt: string) => void; disabled?: boolean }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const theme = canvasThemes[useThemeStore((state) => state.theme)];

    return (
        <>
            <ThemedTooltip title={t("navigation.prompts")}>
                <Button
                    type="text"
                    disabled={disabled}
                    className="!h-8 !w-8 !min-w-8 shrink-0 !rounded-full !bg-transparent !p-0"
                    style={{ color: disabled ? theme.node.faint : theme.node.text, opacity: disabled ? 0.35 : 1 }}
                    icon={<BookOpen className="size-3.5" />}
                    onClick={() => setOpen(true)}
                    aria-label={t("navigation.prompts")}
                />
            </ThemedTooltip>
            <PromptSelectDialog open={open} onOpenChange={setOpen} onSelect={onSelect} />
        </>
    );
}
