import useGetScriptAttributes from "@/hooks/useScriptAttributes";
import useSessionId from "@/hooks/useSessionId";
import useOpenChat from "@/hooks/useOpen";
import Head from "@/components/Head";
import OpenButton from "@/components/OpenButton";
import ChatWindow from "./components/ChatWindow";
import { useEffect, useState } from "react";
import ChatService from "./models/chatService";

export default function App() {
  const { isChatOpen, toggleOpenChat } = useOpenChat();
  const [pageSourceCode, setPageSourceCode] = useState("");
  const embedSettings = useGetScriptAttributes();
  const [embedDetails,setEmbedDetails] = useState();
  const sessionId = useSessionId();
  const fetchEmbedId = async () => {
    try {
      const details = await ChatService.embedDetails(embedSettings);
      setEmbedDetails(details);
    } catch (error) {
      console.error('Error fetching embed details:', error);
    }
  };
  
  useEffect(() => {
    if (embedSettings.loaded) {
      if (embedSettings.openOnLoad === "on") {
        toggleOpenChat(true);
      }
      fetchEmbedId();
      setPageSourceCode(document.documentElement.outerHTML);
    }
  }, [embedSettings.loaded]);
  

  if (!embedSettings.loaded) return null;

  const positionClasses = {
    "bottom-left": "allm-bottom-0 allm-left-0 allm-ml-4",
    "bottom-right": "allm-bottom-0 allm-right-0 allm-mr-4",
    "top-left": "allm-top-0 allm-left-0 allm-ml-4 allm-mt-4",
    "top-right": "allm-top-0 allm-right-0 allm-mr-4 allm-mt-4",
  };

  const position = embedSettings.position || "bottom-right";
  const windowWidth = embedSettings.windowWidth ?? "1512px";
  const windowHeight = embedSettings.windowHeight ?? "700px";

  return (
    <>
      <Head />
      <div
        id="anything-llm-embed-chat-container"
        className={`allm-fixed allm-inset-0 allm-z-50 ${isChatOpen ? "allm-block" : "allm-hidden"}`}
      >
        <div
          style={{
            maxWidth: windowWidth,
            maxHeight: windowHeight,
          }}
          className={`allm-h-full allm-w-full allm-bg-[#f8fafe] allm-fixed allm-bottom-0 allm-right-0 allm-mb-4 allm-md:mr-4 allm-rounded-2xl allm-border allm-border-gray-300 allm-shadow-[0_4px_14px_rgba(0,0,0,0.25)] allm-whitespace-normal  ${positionClasses[position]}`}
          id="anything-llm-chat"
        >
      
          {isChatOpen && (
           
            <ChatWindow
              closeChat={() => toggleOpenChat(false)}
              settings={embedSettings}
              sessionId={sessionId}
              pageSourceCode = {pageSourceCode}
              embedDetails = {embedDetails}
            />
          )}
        </div>
      </div>
      {!isChatOpen && (
        <div
          id="anything-llm-embed-chat-button-container"
          className={`allm-fixed allm-bottom-0 ${positionClasses[position]} allm-mb-4 allm-z-50`}
        >
          <OpenButton
            settings={embedSettings}
            isOpen={isChatOpen}
            toggleOpen={() => toggleOpenChat(true)}
          />
        </div>
      )}
    </>
  );
}
