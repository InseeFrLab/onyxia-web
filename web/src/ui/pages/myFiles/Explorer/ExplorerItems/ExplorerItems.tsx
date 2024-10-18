import { useState, memo } from "react";
import { ExplorerItem } from "./ExplorerItem";
import { useEffectOnValueChange } from "powerhooks/useEffectOnValueChange";
import { useTranslation } from "ui/i18n";
import { useCallbackFactory } from "powerhooks/useCallbackFactory";
import { tss } from "tss";
import { Text } from "onyxia-ui/Text";
import { assert } from "tsafe/assert";
import { declareComponentKeys } from "i18nifty";
import type { Item } from "../../shared/types";
import type { NonPostableEvt } from "evt";
import { useEvt } from "evt/hooks";

export type ExplorerItemsProps = {
    className?: string;

    isNavigating: boolean;

    items: Item[];

    onNavigate: (params: { basename: string }) => void;
    onOpenFile: (params: { basename: string }) => void;
    /** Assert initial value is none */
    onSelectedItemKindValueChange: (params: {
        selectedItemKind: "file" | "directory" | "none";
    }) => void;

    onDeleteItem: (params: { item: Item }) => void;
    onCopyPath: (params: { basename: string }) => void;
    evtAction: NonPostableEvt<
        "DELETE SELECTED ITEM" | "COPY SELECTED ITEM PATH" //TODO: Delete, legacy from secret explorer
    >;
};

export const ExplorerItems = memo((props: ExplorerItemsProps) => {
    const {
        className,
        items,
        isNavigating,
        onNavigate,
        onOpenFile,
        onSelectedItemKindValueChange,
        evtAction,
        onCopyPath,
        onDeleteItem
    } = props;
    const isEmpty = items.length === 0;

    const [selectedItem, setSelectedItem] = useState<
        Item | { basename: undefined; kind: "none" }
    >({ basename: undefined, kind: "none" });

    const { classes, cx } = useStyles({
        "isEmpty": isEmpty
    });

    const { t } = useTranslation({ ExplorerItems });

    const handleItemClick = useCallbackFactory(([item]: [Item]) => {
        if (!selectedItem || selectedItem.kind !== item.kind) {
            onSelectedItemKindValueChange({ selectedItemKind: item.kind });
        }
        setSelectedItem(item);
    });

    const handleItemDoubleClick = useCallbackFactory(([item]: [Item]) => {
        switch (item.kind) {
            case "directory":
                onNavigate({ "basename": item.basename });
                break;
            case "file":
                onOpenFile({ "basename": item.basename });
                break;
        }
    });

    useEvt(
        ctx =>
            evtAction.attach(ctx, action => {
                switch (action) {
                    case "DELETE SELECTED ITEM":
                        assert(selectedItem.kind !== "none");
                        onDeleteItem({ "item": selectedItem });
                        break;
                    case "COPY SELECTED ITEM PATH":
                        assert(selectedItem.kind !== "none");
                        onCopyPath({
                            "basename": selectedItem.basename
                        });
                        break;
                }
            }),
        [evtAction, onDeleteItem, onCopyPath, selectedItem]
    );

    useEffectOnValueChange(() => {
        setSelectedItem({ basename: undefined, kind: "none" });
    }, [isNavigating]);

    return (
        <div className={cx(classes.root, className)}>
            {isEmpty ? (
                <Text typo="body 1">{t("empty directory")}</Text>
            ) : (
                <>
                    {items.map(item => {
                        const { basename, kind, policy } = item;
                        const size = "size" in item ? item.size : undefined;
                        return (
                            <ExplorerItem
                                className={classes.item}
                                key={`${basename}-${kind}`}
                                kind={kind}
                                basename={basename}
                                isSelected={selectedItem.basename === basename}
                                size={size}
                                policy={policy}
                                onClick={handleItemClick(item)}
                                onDoubleClick={handleItemDoubleClick(item)}
                            />
                        );
                    })}
                </>
            )}
        </div>
    );
});

const { i18n } = declareComponentKeys<"empty directory">()({ ExplorerItems });
export type I18n = typeof i18n;

const useStyles = tss
    .withName({ ExplorerItems })
    .withParams<{ isEmpty: boolean }>()
    .create(({ theme, isEmpty }) => ({
        "root": {
            ...(isEmpty
                ? {}
                : {
                      "display": "flex",
                      "flexWrap": "wrap",
                      "justifyContent": "flex-start"
                  })
        },
        "item": {
            "width": theme.spacing(9),
            "height": theme.spacing(9),
            "margin": theme.spacing(2)
        }
    }));
