import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Clock, ShieldCheck, ArrowUp, FileText } from "lucide-react";
import { TabBar } from "../components/TabBar";
import { useChat } from "../context/ChatContext";

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.25)] flex items-center justify-center flex-shrink-0">
        <ShieldCheck size={16} stroke="#A855F7" />
      </div>
      <div className="px-3 py-3 rounded-2xl rounded-bl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)]">
        <div className="flex gap-1 items-center h-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#655C80] animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inCode = false;
  let codeLines: string[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith("```")) {
      if (inCode) {
        elements.push(
          <div key={`code-${i}`} className="bg-[#141025] rounded-lg p-3 mb-2 font-mono text-[13px] overflow-x-auto">
            {codeLines.map((l, j) => (
              <div key={j} className="text-[#4ADE80]">{l || "\u00A0"}</div>
            ))}
          </div>
        );
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      return;
    }
    if (inCode) {
      codeLines.push(line);
      return;
    }
    if (!line.trim()) {
      elements.push(<div key={i} className="h-2" />);
      return;
    }
    // Bold text
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    elements.push(
      <p key={i} className="text-[15px] text-[#F0ECF9] leading-relaxed mb-1">
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j}>{part.slice(2, -2)}</strong>
          ) : (
            part
          )
        )}
      </p>
    );
  });

  return elements;
}

export function ChatScreen() {
  const navigate = useNavigate();
  const { messages, isStreaming, sendMessage, createConversation } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions = ["Quiz me", "Explain simpler", "Show example"];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const value = inputRef.current?.value.trim();
    if (!value || isStreaming) return;
    if (inputRef.current) inputRef.current.value = "";
    sendMessage(value);
  };

  const handleChip = (text: string) => {
    if (isStreaming) return;
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="h-screen bg-[#0D0B1A] flex flex-col max-w-[393px] mx-auto pb-[100px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[rgba(80,60,140,0.3)] flex items-center justify-between flex-shrink-0">
        <button onClick={() => navigate("/chat/history")}>
          <Clock size={22} stroke="#9B8FBB" />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} stroke="#A855F7" />
          <h4 className="text-[#F0ECF9]">CyberScout AI</h4>
        </div>
        <button
          onClick={() => createConversation()}
          className="px-2 py-0.5 rounded-full bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.25)]"
        >
          <span className="text-[10px] font-bold text-[#4ADE80] uppercase tracking-wider">Intermediate</span>
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 px-6 py-5 space-y-3 overflow-y-auto">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.25)] flex items-center justify-center mb-4">
              <ShieldCheck size={32} stroke="#A855F7" />
            </div>
            <h3 className="text-[#F0ECF9] mb-2">CyberScout AI</h3>
            <p className="text-[13px] text-[#655C80] max-w-[240px]">
              Ask me anything about cybersecurity — SQL injection, XSS, network pentest, malware analysis, and more.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === "user" ? (
              <div className="flex justify-end">
                <div className="max-w-[78%] px-3 py-2 rounded-2xl rounded-br bg-[#A855F7]">
                  <p className="text-[15px] text-[#0D0B1A] leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.25)] flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={16} stroke="#A855F7" />
                </div>
                <div className="flex-1 max-w-[78%]">
                  <div className="px-3 py-3 rounded-2xl rounded-bl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)]">
                    {renderMarkdown(msg.content)}

                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-4 bg-[#A855F7] ml-0.5 animate-pulse" />
                    )}

                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {msg.citations.map((c, i) => (
                          <div key={i} className="px-2 py-1 rounded bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.2)] flex items-center gap-1.5">
                            <FileText size={12} stroke="#A855F7" />
                            <span className="text-[11px] text-[#A855F7] uppercase tracking-wider font-medium">
                              {c.source} — {c.section}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.suggestedTopics && msg.suggestedTopics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {msg.suggestedTopics.map((topic, i) => (
                          <button
                            key={i}
                            onClick={() => handleChip(topic)}
                            className="px-2 py-1 rounded-full border border-[rgba(168,85,247,0.3)] text-[11px] text-[#A855F7] active:scale-95 transition-transform"
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role === "user" && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick action buttons */}
      <div className="px-6 py-3 flex gap-2 flex-shrink-0 overflow-x-auto">
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={() => handleChip(action)}
            disabled={isStreaming}
            className="px-3 py-1 rounded-full border border-[rgba(80,60,140,0.3)] text-[11px] text-[#9B8FBB] whitespace-nowrap active:scale-95 transition-transform disabled:opacity-40"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="px-3 pb-6 flex-shrink-0">
        <div className="px-4 py-1 rounded-[20px] border border-[rgba(80,60,140,0.3)] bg-[rgba(30,22,56,0.65)] flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about cybersecurity..."
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            className="flex-1 py-2 bg-transparent text-[15px] text-[#F0ECF9] placeholder:text-[#655C80] focus:outline-none disabled:opacity-60"
          />
          <button
            onClick={handleSend}
            disabled={isStreaming}
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center bg-[#A855F7] disabled:bg-[rgba(168,85,247,0.2)] transition-colors active:scale-90"
          >
            <ArrowUp size={18} stroke={isStreaming ? "#655C80" : "#0D0B1A"} />
          </button>
        </div>
      </div>

      <TabBar />
    </div>
  );
}
