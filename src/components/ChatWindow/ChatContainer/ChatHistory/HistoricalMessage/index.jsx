import React, { memo, forwardRef } from "react";
import { Warning } from "@phosphor-icons/react";
import renderMarkdown from "@/utils/chat/markdown";
import { embedderSettings } from "@/main";
import { v4 } from "uuid";
import createDOMPurify from "dompurify";
import AnythingLLMIcon from "@/assets/anything-llm-icon.png";
import UserProfileIcon from "../../../../../assets/user.svg";
import { formatDate } from "@/utils/date";

const DOMPurify = createDOMPurify(window);
const HistoricalMessage = forwardRef(
  (
    {
      uuid = v4(),
      message,
      role,
      sources = [],
      error = false,
      errorMsg = null,
      sentAt,
    },
    ref
  ) => {
    const textSize = !!embedderSettings.settings.textSize
      ? `allm-text-[${embedderSettings.settings.textSize}px]`
      : "allm-text-base";
    if (error) console.error(`OUTAMATION_AI_CHAT_WIDGET_ERROR: ${error}`);

    return (
      <div className="py-[12px] allm-w-[85%]">
        <div
          key={uuid}
          ref={ref}
          className={`allm-flex allm-items-start allm-w-full allm-font-sans allm-font-light allm-h-fit allm-px-28 allm-py-8 ${
            role === "user" ? "allm-bg-[#e4ecf6]" : "allm-bg-[#f8fafe]"
          }`}
          style={{
            maxWidth: "100%",
            overflowX: "hidden",
          }}
        >
          {role === "assistant" ? (
            <img
              src={embedderSettings.settings.assistantIcon || AnythingLLMIcon}
              alt="Outamation AI Icon"
              className="allm-w-9 allm-h-9 allm-flex-shrink-0 allm-mt-2 allm-mr-4"
              id="anything-llm-icon"
            />
          ) : (
            <img
              src={UserProfileIcon}
              alt="User Profile Icon"
              className="allm-w-9 allm-h-9 allm-flex-shrink-0 allm-mt-2 allm-mr-4"
              id="anything-llm-icon"
            />
          )}
          <div
            style={{
              wordBreak: "break-word",
              maxWidth: "100%",
              overflowX: "hidden",
            }}
            className={`allm-py-[11px] allm-flex allm-flex-col allm-font-sans ${
              error
                ? "allm-bg-red-200 allm-rounded-lg"
                : role === "user"
                ? `${embedderSettings.USER_STYLES.base} allm-anything-llm-user-message`
                : `${embedderSettings.ASSISTANT_STYLES.base} allm-anything-llm-assistant-message`
            }`}
          >
            <div className="allm-flex">
              {error ? (
                <div className="allm-p-2 allm-rounded-lg allm-bg-red-50 allm-text-red-500">
                  <span className={`allm-inline-block `}>
                    <Warning className="allm-h-4 allm-w-4 allm-mb-1 allm-inline-block" />{" "}
                    Could not respond to message.
                  </span>
                  <p className="allm-text-xs allm-font-mono allm-mt-2 allm-border-l-2 allm-border-red-500 allm-pl-2 allm-bg-red-300 allm-p-2 allm-rounded-sm">
                    {errorMsg || "Server error"}
                  </p>
                </div>
              ) : (
                <span
                  className={`allm-whitespace-pre-line allm-flex allm-flex-col allm-w-full allm-gap-y-1 ${textSize} allm-leading-[20px]`}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(renderMarkdown(message)),
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default memo(HistoricalMessage);
