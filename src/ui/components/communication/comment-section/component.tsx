'use client';

import { useMemo, useCallback } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useSubscribe } from "../../../context/hooks";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import {
  formatRelativeTime,
  getInitials,
  getNestedField,
} from "../../_base/utils";
import { ButtonControl } from "../../forms/button";
import { RichInput } from "../../content/rich-input/component";
import type { RichInputConfig } from "../../content/rich-input/types";
import { sanitizeMessageHtml } from "../message-thread/message-renderer";
import type { CommentSectionConfig } from "./types";

type CommentRecord = Record<string, unknown>;

function CommentSkeleton({
  rootId,
  index,
  slots,
}: {
  rootId: string;
  index: number;
  slots: CommentSectionConfig["slots"];
}) {
  const itemId = `${rootId}-loading-${index}`;
  const itemSurface = resolveSurfacePresentation({
    surfaceId: itemId,
    implementationBase: {
      display: "flex",
      gap: "sm",
      paddingY: "sm",
    },
    componentSurface: slots?.loadingItem,
  });
  const avatarSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-avatar`,
    implementationBase: {
      bg: "var(--sn-color-muted, #e5e7eb)",
      opacity: 0.5,
      style: {
        width: 28,
        height: 28,
        borderRadius: "var(--sn-radius-full, 9999px)",
        flexShrink: 0,
      },
    },
    componentSurface: slots?.loadingAvatar,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-title`,
    implementationBase: {
      bg: "var(--sn-color-muted, #e5e7eb)",
      opacity: 0.5,
      borderRadius: "xs",
      style: {
        height: "0.75rem",
        width: "25%",
        marginBottom: "var(--sn-spacing-xs, 0.25rem)",
      },
    },
    componentSurface: slots?.loadingTitle,
  });
  const bodySurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-body`,
    implementationBase: {
      bg: "var(--sn-color-muted, #e5e7eb)",
      opacity: 0.3,
      borderRadius: "xs",
      style: {
        height: "0.75rem",
        width: "60%",
      },
    },
    componentSurface: slots?.loadingBody,
  });

  return (
    <>
      <div
        data-snapshot-id={itemId}
        className={itemSurface.className}
        style={itemSurface.style}
      >
        <div
          data-snapshot-id={`${itemId}-avatar`}
          className={avatarSurface.className}
          style={avatarSurface.style}
        />
        <div style={{ flex: 1 }}>
          <div
            data-snapshot-id={`${itemId}-title`}
            className={titleSurface.className}
            style={titleSurface.style}
          />
          <div
            data-snapshot-id={`${itemId}-body`}
            className={bodySurface.className}
            style={bodySurface.style}
          />
        </div>
      </div>
      <SurfaceStyles css={itemSurface.scopedCss} />
      <SurfaceStyles css={avatarSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={bodySurface.scopedCss} />
    </>
  );
}

function CommentItem({
  rootId,
  index,
  comment,
  config,
  execute,
}: {
  rootId: string;
  index: number;
  comment: CommentRecord;
  config: CommentSectionConfig;
  execute: ReturnType<typeof useActionExecutor>;
}) {
  const authorNameField = config.authorNameField ?? "author.name";
  const authorAvatarField = config.authorAvatarField ?? "author.avatar";
  const contentField = config.contentField ?? "content";
  const timestampField = config.timestampField ?? "timestamp";
  const itemId = `${rootId}-comment-${index}`;

  const authorName = String(getNestedField(comment, authorNameField) ?? "Unknown");
  const authorAvatar = getNestedField(comment, authorAvatarField) as
    | string
    | null;
  const content = String(getNestedField(comment, contentField) ?? "");
  const rawTimestamp = getNestedField(comment, timestampField);
  const timestamp = rawTimestamp ? new Date(String(rawTimestamp)) : null;
  const sanitizedHtml = sanitizeMessageHtml(content);

  const handleDelete = useCallback(() => {
    if (config.deleteAction) {
      void execute(config.deleteAction, { ...comment });
    }
  }, [comment, config.deleteAction, execute]);

  const itemSurface = resolveSurfacePresentation({
    surfaceId: itemId,
    implementationBase: {
      display: "flex",
      gap: "sm",
      paddingY: "sm",
    },
    componentSurface: config.slots?.commentItem,
  });
  const avatarImageSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-avatarImage`,
    implementationBase: {
      style: {
        width: 32,
        height: 32,
        borderRadius: "var(--sn-radius-full, 9999px)",
        objectFit: "cover",
        flexShrink: 0,
      },
    },
    componentSurface: config.slots?.avatarImage,
  });
  const avatarFallbackSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-avatarFallback`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "xs",
      fontWeight: "semibold",
      color: "var(--sn-color-primary-foreground, #ffffff)",
      bg: "var(--sn-color-primary, #2563eb)",
      style: {
        width: 32,
        height: 32,
        borderRadius: "var(--sn-radius-full, 9999px)",
        flexShrink: 0,
      },
    },
    componentSurface: config.slots?.avatarFallback,
  });
  const contentColumnSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-contentColumn`,
    implementationBase: {
      flex: "1",
      style: {
        minWidth: 0,
      },
    },
    componentSurface: config.slots?.contentColumn,
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-header`,
    implementationBase: {
      display: "flex",
      alignItems: "baseline",
      gap: "sm",
      style: {
        marginBottom: "var(--sn-spacing-2xs, 2px)",
      },
    },
    componentSurface: config.slots?.commentHeader,
  });
  const authorSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-author`,
    implementationBase: {
      fontSize: "sm",
      fontWeight: "semibold",
      color: "var(--sn-color-foreground, #111827)",
    },
    componentSurface: config.slots?.authorName,
  });
  const timestampSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-timestamp`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.timestamp,
  });
  const deleteButtonSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-deleteButton`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      color: "var(--sn-color-muted-foreground, #9ca3af)",
      borderRadius: "sm",
      cursor: "pointer",
      hover: {
        bg: "color-mix(in oklch, var(--sn-color-destructive, #ef4444) 10%, transparent)",
        color: "var(--sn-color-destructive, #ef4444)",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-destructive, #ef4444))",
      },
      style: {
        marginLeft: "auto",
        background: "none",
        border: "none",
        padding: "var(--sn-spacing-xs, 0.25rem)",
        transition:
          "all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      },
    },
    componentSurface: config.slots?.deleteButton,
  });
  const bodySurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-body`,
    implementationBase: {
      fontSize: "sm",
      color: "var(--sn-color-foreground, #111827)",
      lineHeight: "normal",
      style: {
        wordBreak: "break-word",
      },
    },
    componentSurface: config.slots?.body,
  });

  return (
    <>
      <div
        data-testid="comment-item"
        data-snapshot-id={itemId}
        className={itemSurface.className}
        style={itemSurface.style}
      >
        {authorAvatar ? (
          <img
            src={authorAvatar}
            alt={authorName}
            data-snapshot-id={`${itemId}-avatarImage`}
            className={avatarImageSurface.className}
            style={avatarImageSurface.style}
          />
        ) : (
          <div
            data-snapshot-id={`${itemId}-avatarFallback`}
            className={avatarFallbackSurface.className}
            style={avatarFallbackSurface.style}
          >
            {getInitials(authorName) || "?"}
          </div>
        )}

        <div
          data-snapshot-id={`${itemId}-contentColumn`}
          className={contentColumnSurface.className}
          style={contentColumnSurface.style}
        >
          <div
            data-snapshot-id={`${itemId}-header`}
            className={headerSurface.className}
            style={headerSurface.style}
          >
            <span
              data-snapshot-id={`${itemId}-author`}
              className={authorSurface.className}
              style={authorSurface.style}
            >
              {authorName}
            </span>
            {timestamp ? (
              <span
                data-snapshot-id={`${itemId}-timestamp`}
                className={timestampSurface.className}
                style={timestampSurface.style}
                title={timestamp.toLocaleString()}
              >
                {formatRelativeTime(timestamp, { short: true })}
              </span>
            ) : null}
            {config.deleteAction ? (
              <ButtonControl
                type="button"
                onClick={handleDelete}
                surfaceId={`${itemId}-deleteButton`}
                surfaceConfig={deleteButtonSurface.resolvedConfigForWrapper}
                title="Delete comment"
                ariaLabel="Delete comment"
                variant="ghost"
                size="icon"
              >
                <Icon name="trash-2" size={12} />
              </ButtonControl>
            ) : null}
          </div>

          <div
            data-snapshot-id={`${itemId}-body`}
            className={bodySurface.className}
            style={bodySurface.style}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        </div>
      </div>
      <SurfaceStyles css={itemSurface.scopedCss} />
      <SurfaceStyles css={avatarImageSurface.scopedCss} />
      <SurfaceStyles css={avatarFallbackSurface.scopedCss} />
      <SurfaceStyles css={contentColumnSurface.scopedCss} />
      <SurfaceStyles css={headerSurface.scopedCss} />
      <SurfaceStyles css={authorSurface.scopedCss} />
      <SurfaceStyles css={timestampSurface.scopedCss} />
      <SurfaceStyles css={deleteButtonSurface.scopedCss} />
      <SurfaceStyles css={bodySurface.scopedCss} />
    </>
  );
}

export function CommentSection({ config }: { config: CommentSectionConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const { data, isLoading, error } = useComponentData(config.data, undefined);
  const execute = useActionExecutor();
  const rootId = config.id ?? "comment-section";

  const sortOrder = config.sortOrder ?? "newest";
  const comments: CommentRecord[] = useMemo(() => {
    if (!data) {
      return [];
    }

    let items: CommentRecord[] = [];
    if (Array.isArray(data)) {
      items = data as CommentRecord[];
    } else {
      for (const key of ["data", "items", "results", "comments"]) {
        if (Array.isArray(data[key])) {
          items = data[key] as CommentRecord[];
          break;
        }
      }
    }

    const timestampField = config.timestampField ?? "timestamp";
    return [...items].sort((left, right) => {
      const leftTimestamp = getNestedField(left, timestampField);
      const rightTimestamp = getNestedField(right, timestampField);
      const leftTime = leftTimestamp ? new Date(String(leftTimestamp)).getTime() : 0;
      const rightTime = rightTimestamp ? new Date(String(rightTimestamp)).getTime() : 0;
      return sortOrder === "newest" ? rightTime - leftTime : leftTime - rightTime;
    });
  }, [config.timestampField, data, sortOrder]);

  if (visible === false) {
    return null;
  }

  const inputConfig: RichInputConfig = {
    type: "rich-input",
    placeholder: config.inputPlaceholder ?? "Write a comment...",
    sendOnEnter: false,
    sendAction: config.submitAction,
    minHeight: "2.5rem",
    maxHeight: "8rem",
    features: (config.inputFeatures as RichInputConfig["features"]) ?? [
      "bold",
      "italic",
      "code",
      "link",
    ],
  };

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      overflow: "hidden",
      borderRadius: "md",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      bg: "var(--sn-color-card, #ffffff)",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "sm",
      paddingY: "sm",
      paddingX: "md",
      style: {
        borderBottom:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      },
    },
    componentSurface: config.slots?.header,
  });
  const headerIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-headerIcon`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.headerIcon,
  });
  const headerTitleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-headerTitle`,
    implementationBase: {
      fontSize: "sm",
      fontWeight: "semibold",
      color: "var(--sn-color-foreground, #111827)",
    },
    componentSurface: config.slots?.headerTitle,
  });
  const headerCountSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-headerCount`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.headerCount,
  });
  const listSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-list`,
    implementationBase: {
      paddingX: "md",
      overflow: "auto",
      style: {
        maxHeight: "clamp(200px, 50vh, 400px)",
      },
    },
    componentSurface: config.slots?.list,
  });
  const errorStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-errorState`,
    implementationBase: {
      paddingY: "md",
      textAlign: "center",
      fontSize: "sm",
      color: "var(--sn-color-destructive, #ef4444)",
    },
    componentSurface: config.slots?.errorState,
  });
  const emptyStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-emptyState`,
    implementationBase: {
      paddingY: "lg",
      textAlign: "center",
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.emptyState,
  });
  const inputAreaSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-inputArea`,
    implementationBase: {
      padding: "sm",
      style: {
        borderTop:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      },
    },
    componentSurface: config.slots?.inputArea,
  });

  return (
    <>
      <div
        data-snapshot-component="comment-section"
        data-testid="comment-section"
        aria-label="Comments"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-header`}
          className={headerSurface.className}
          style={headerSurface.style}
        >
          <span
            aria-hidden="true"
            data-snapshot-id={`${rootId}-headerIcon`}
            className={headerIconSurface.className}
            style={headerIconSurface.style}
          >
            <Icon name="message-square" size={16} />
          </span>
          <span
            data-snapshot-id={`${rootId}-headerTitle`}
            className={headerTitleSurface.className}
            style={headerTitleSurface.style}
          >
            Comments
          </span>
          {!isLoading && comments.length > 0 ? (
            <span
              data-snapshot-id={`${rootId}-headerCount`}
              className={headerCountSurface.className}
              style={headerCountSurface.style}
            >
              ({comments.length})
            </span>
          ) : null}
        </div>

        <div
          data-snapshot-id={`${rootId}-list`}
          className={listSurface.className}
          style={listSurface.style}
        >
          {isLoading ? (
            <>
              <CommentSkeleton rootId={rootId} index={0} slots={config.slots} />
              <CommentSkeleton rootId={rootId} index={1} slots={config.slots} />
            </>
          ) : null}

          {error ? (
            <div
              data-snapshot-id={`${rootId}-errorState`}
              className={errorStateSurface.className}
              style={errorStateSurface.style}
            >
              Error: {error.message}
            </div>
          ) : null}

          {!isLoading && !error && comments.length === 0 ? (
            <div
              data-snapshot-id={`${rootId}-emptyState`}
              className={emptyStateSurface.className}
              style={emptyStateSurface.style}
            >
              {config.emptyMessage ?? "No comments yet"}
            </div>
          ) : null}

          {!isLoading && !error
            ? comments.map((comment, index) => {
                const wrapperSurface = resolveSurfacePresentation({
                  surfaceId: `${rootId}-commentWrapper-${index}`,
                  implementationBase: {
                    style: {
                      borderBottom:
                        index < comments.length - 1
                          ? "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)"
                          : undefined,
                    },
                  },
                  componentSurface: config.slots?.commentWrapper,
                });

                return (
                  <div
                    key={
                      typeof comment.id === "string" || typeof comment.id === "number"
                        ? String(comment.id)
                        : index
                    }
                    data-snapshot-id={`${rootId}-commentWrapper-${index}`}
                    className={wrapperSurface.className}
                    style={wrapperSurface.style}
                  >
                    <CommentItem
                      rootId={rootId}
                      index={index}
                      comment={comment}
                      config={config}
                      execute={execute}
                    />
                    <SurfaceStyles css={wrapperSurface.scopedCss} />
                  </div>
                );
              })
            : null}
        </div>

        {config.submitAction ? (
          <div
            data-snapshot-id={`${rootId}-inputArea`}
            className={inputAreaSurface.className}
            style={inputAreaSurface.style}
          >
            <RichInput config={inputConfig} />
          </div>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={headerSurface.scopedCss} />
      <SurfaceStyles css={headerIconSurface.scopedCss} />
      <SurfaceStyles css={headerTitleSurface.scopedCss} />
      <SurfaceStyles css={headerCountSurface.scopedCss} />
      <SurfaceStyles css={listSurface.scopedCss} />
      <SurfaceStyles css={errorStateSurface.scopedCss} />
      <SurfaceStyles css={emptyStateSurface.scopedCss} />
      <SurfaceStyles css={inputAreaSurface.scopedCss} />
    </>
  );
}
