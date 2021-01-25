
import { createUseClassNames } from "app/theme/useClassNames";
import { memo } from "react";
import { Button } from "app/components/designSystem/Button";
import { useTranslation } from "app/i18n/useTranslations";
import type { Props as IconProps } from "app/components/designSystem/Icon";
import { useCallbackFactory } from "app/utils/hooks/useCallbackFactory";


export type Action = "rename" | "create file" | "create directory" | "delete" | "copy path";

export type Props = {
    /** [HIGHER ORDER] */
    wordForFile: "file" | "secret";


    selectedItemKind: "file" | "directory" | "none";
    isSelectedItemInEditingState: boolean;
    isViewingFile: boolean;

    callback(params: { action: Action; }): void;

    paddingLeftSpacing: number;

};

const { useClassNames } = createUseClassNames<Props>()(
    ({ theme }, { paddingLeftSpacing }) => ({
        "root": {
            "backgroundColor": theme.custom.colors.useCases.surfaces.surfaces,
            "boxShadow": theme.custom.shadows[1],
            "paddingLeft": theme.spacing(paddingLeftSpacing)
        }
    })
);

export const ExplorerButtonBar = memo((props: Props) => {

    const {
        wordForFile,
        callback,
        selectedItemKind,
        isSelectedItemInEditingState,
        isViewingFile
    } = props;

    const { classNames } = useClassNames(props);

    const { t } = useTranslation("ExplorerButtonBar");

    const onClickFactory = useCallbackFactory<[Action], []>(
        ([action]) => callback({ action }),
        [callback]
    );

    return (
        <div className={classNames.root}>
            { ([
                "rename",
                "create file",
                "create directory",
                "delete",
                "copy path"
            ] as const).map(action =>
                <CustomButton
                    startIcon={(() => {
                        switch (action) {
                            case "copy path": return "filterNone" as const;
                            case "create directory": return "add";
                            case "create file": return "add";
                            case "delete": return "delete";
                            case "rename": return "edit";
                        }
                    })()}
                    disabled={(() => {
                        switch (action) {
                            case "rename": return (
                                isSelectedItemInEditingState || 
                                selectedItemKind === "none" || 
                                isViewingFile
                            );
                            case "create file":
                            case "create directory": return isViewingFile;
                            case "delete": return selectedItemKind === "none" && isViewingFile;
                            case "copy path": return selectedItemKind !== "file" && !isViewingFile;
                        }
                    })()
                    }
                    key={action}
                    onClick={onClickFactory(action)}

                >
                    {
                        action === "create file" ?
                            t("create what", { "what": t(wordForFile) }) :
                            t(action)
                    }
                </CustomButton>
            )}
        </div>
    );

});
export declare namespace ExplorerButtonBar {
    export type I18nScheme = Record<Exclude<Action, "create file">, undefined> & {
        "create what": { what: string; };
        secret: undefined;
        file: undefined;
    };
}

const { CustomButton } = (() => {

    type CustomButtonProps = {
        startIcon: IconProps["type"];
        disabled: boolean;
        onClick(): void;
        children: React.ReactNode;
    };

    const { useClassNames } = createUseClassNames<CustomButtonProps>()(
        ({ theme: { custom: { colors: { useCases } } } }) => ({
            "root": {
                "backgroundColor": "transparent",
                "borderRadius": "unset",
                "borderColor": "transparent",
                "&.Mui-disabled .MuiButton-label": {
                    "color": useCases.typography.textDisabled
                },
                "& .MuiButton-label": {
                    "color": useCases.typography.textPrimary
                },
                "&:active .MuiButton-label": {
                    "color": useCases.typography.textFocus,
                    "& .MuiSvgIcon-root": {
                        "color": useCases.typography.textFocus
                    }
                },
                "& .MuiTouchRipple-root": {
                    "display": "none"
                },
                "transition": "none",
                "& > *": {
                    "transition": "none"
                },
                "&:hover": {
                    "borderBottomColor": useCases.buttons.actionActive,
                    "boxSizing": "border-box",
                    "backgroundColor": "unset",
                    "& .MuiSvgIcon-root": {
                        "color": useCases.typography.textPrimary
                    }
                }
            }
        })
    );

    function CustomButton(props: CustomButtonProps) {

        const { startIcon, disabled, onClick, children } = props;

        const { classNames } = useClassNames(props);

        return (
            <Button
                className={classNames.root}
                color="secondary"
                startIcon={startIcon}
                {...{ disabled, onClick }}
            >
                {children}
            </Button>
        );

    }

    return { CustomButton };


})();
