import React, { useState, useEffect } from "react";
import ChatHistory from "./ChatHistory";
import PromptInput from "./PromptInput";
import handleChat from "@/utils/chat";
import ChatService from "@/models/chatService";
export const SEND_TEXT_EVENT = "anythingllm-embed-send-prompt";

const cleanHtml = (html) => {
  let tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Remove all <style> tags
  const styleTags = tempDiv.querySelectorAll('style');
  styleTags.forEach(style => style.remove());

  // Remove all inline styles
  const elementsWithStyles = tempDiv.querySelectorAll('[style]');
  elementsWithStyles.forEach(el => el.removeAttribute('style'));

  // Remove specific <script> tags with the attribute `data-embed-id`
  const scriptTagsWithEmbedId = tempDiv.querySelectorAll('script[data-embed-id]');
  scriptTagsWithEmbedId.forEach(script => script.remove());

  return tempDiv.innerHTML;
};

function extractText(html) {
  const text = document.createElement('div');
  text.innerHTML = html;

  let result = '';
  for (const node of text.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent.trim() + ' ';
    }
  }

  return result.trim();
}

export default function ChatContainer({
  sessionId,
  settings,
  pageSourceCode,
  knownHistory = [],
}) {
  // const textHtml = extractText(pageSourceCode);
  // console.log('textHtml: ', textHtml);
  const [message, setMessage] = useState("");
  const [currentURL, setCurrentURL] = useState("");
  // const [pageCodeBlobUrl, setPageCodeBlobUrl] = useState("");
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [chatHistory, setChatHistory] = useState(knownHistory);
  

  // Resync history if the ref to known history changes
  // eg: cleared.
  useEffect(() => {
    if (knownHistory.length !== chatHistory.length)
      setChatHistory([...knownHistory]);
  }, [knownHistory]);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!message || message === "") return false;

    const prevChatHistory = [
      ...chatHistory,
      { content: message, role: "user" },
      {
        content: "",
        role: "assistant",
        pending: true,
        userMessage: message,
        animate: true,
      },
    ];
    setChatHistory(prevChatHistory);
    setMessage("");
    setLoadingResponse(true);
  };

  const sendCommand = (command, history = [], attachments = []) => {
    if (!command || command === "") return false;

    let prevChatHistory;
    if (history.length > 0) {
      // use pre-determined history chain.
      prevChatHistory = [
        ...history,
        {
          content: "",
          role: "assistant",
          pending: true,
          userMessage: command,
          attachments,
          animate: true,
        },
      ];
    } else {
      prevChatHistory = [
        ...chatHistory,
        {
          content: command,
          role: "user",
          attachments,
        },
        {
          content: "",
          role: "assistant",
          pending: true,
          userMessage: command,
          animate: true,
        },
      ];
    }

    setChatHistory(prevChatHistory);
    setLoadingResponse(true);
  };

  useEffect(() => {
    async function fetchReply() {
      const promptMessage =
        chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
      const remHistory = chatHistory.length > 0 ? chatHistory.slice(0, -1) : [];
      var _chatHistory = [...remHistory];

      if (!promptMessage || !promptMessage?.userMessage) {
        setLoadingResponse(false);
        return false;
      }
      const cleanedHTML = cleanHtml(pageSourceCode);
      console.log('cleanedHTML: ', cleanedHTML);

      const sourceCodeBlob = new Blob([cleanedHTML], { type: 'text/plain' });
      console.log('sourceCodeBlob: ', sourceCodeBlob);
      const sourceCodeBlobUrl = URL.createObjectURL(sourceCodeBlob);
      console.log('sourceCodeBlobUrl: ', sourceCodeBlobUrl);
      setPageCodeBlobUrl(sourceCodeBlobUrl)
    
        await ChatService.streamChat(
          sessionId,
          settings,
          currentURL,
          pageSourceCode,
          promptMessage.userMessage,
          (chatResult) =>
            handleChat(
              chatResult,
              setLoadingResponse,
              setChatHistory,
              remHistory,
              _chatHistory
            )
        );
      ;
         
      return;
    }

    loadingResponse === true && fetchReply();
  }, [loadingResponse, chatHistory]);

  const handleAutofillEvent = (event) => {
    if (!event.detail.command) return;
    sendCommand(event.detail.command, [], []);
  };

  useEffect(() => {
    console.log("currentURL: ",currentURL);
  
    window.addEventListener(SEND_TEXT_EVENT, handleAutofillEvent);
    setCurrentURL(window.location.href)
    // setPageSourceCode(document.documentElement.outerHTML,() => {
      // console.log("pageSourceCode: ",pageSourceCode)
    // })
    return () => {
      window.removeEventListener(SEND_TEXT_EVENT, handleAutofillEvent);
    };
  }, []);

  return (
    <div className="allm-h-full allm-w-full allm-flex allm-flex-col">
      <div className="allm-flex-grow allm-overflow-y-auto">
        <ChatHistory settings={settings} history={chatHistory} />
      </div>
      <PromptInput
        message={message}
        submit={handleSubmit}
        onChange={handleMessageChange}
        inputDisabled={loadingResponse}
        buttonDisabled={loadingResponse}
      />
    </div>
  );
}
