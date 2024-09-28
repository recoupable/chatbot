import { ArrowUpRightIcon } from "lucide-react";
import SubmitButton from "./SubmitButton";
import { useCsrfToken } from "@/packages/shared/src/hooks";
import { useChat } from "ai/react";
import { useQueryClient } from "@tanstack/react-query";
import Messages from "./Messages";
import { useEffect, useRef, useState } from "react";

const Chat = () => {
  const [isChatboxFocused, setIsChatboxFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const csrfToken = useCsrfToken();
  const accountId = "3664dcb4-164f-4566-8e7c-20b2c93f9951";
  const queryClient = useQueryClient();
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: `/api/chat`,
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    body: {
      accountId,
    },
    onError: console.error,
    onFinish: () => {
      void queryClient.invalidateQueries({
        queryKey: ["credits", accountId],
      });
    },
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white rounded-md p-1.5 mb-3 transition-all duration-150 ease-in-out relative shadow-lg hover:shadow-xl hover:scale-[1.02] group"
      >
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onFocus={() => setIsChatboxFocused(true)}
            onBlur={() => setIsChatboxFocused(false)}
            placeholder="Ask me anything about the music industry..."
            className="w-full bg-transparent text-black outline-none text-xs py-2 px-2 resize-none min-h-[60px] pr-10 font-normal transition-colors duration-150 ease-in-out focus:bg-gray-50"
            aria-label="Chat input"
          />
          <SubmitButton isChatboxFocused={isChatboxFocused} />
        </div>
      </form>

      {/* Chat messages display */}
      <Messages messages={messages} />

      <div className="flex flex-wrap justify-center gap-2">
        <button
          className="bubble-prompt px-3 py-1 bg-[#00309A] border border-white rounded-full text-[10px] sm:text-xs transition-all duration-150 ease-in-out flex items-center font-normal"
          aria-label="Ask about Billboard #1 song"
        >
          What is the Billboard #1 song?
          <ArrowUpRightIcon className="w-2 h-2 ml-1" aria-hidden="true" />
        </button>
        <button
          className="bubble-prompt px-3 py-1 bg-[#00309A] border border-white rounded-full text-[10px] sm:text-xs transition-all duration-150 ease-in-out flex items-center font-normal"
          aria-label="Ask about TikTok trends"
        >
          What&apos;s trending with fans on TikTok?
          <ArrowUpRightIcon className="w-2 h-2 ml-1" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default Chat;
