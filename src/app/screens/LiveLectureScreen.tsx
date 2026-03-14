import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Users, Hand, Send } from "lucide-react";

interface LiveMessage {
  user: string;
  text: string;
  avatar: string;
  isSystem?: boolean;
}

const INITIAL_MESSAGES: LiveMessage[] = [
  { user: "Sarah K", text: "Welcome everyone! Let's dive into incident response.", avatar: "S" },
  { user: "User123", text: "Excited for this one!", avatar: "U" },
  { user: "DevSec_Mike", text: "Can you cover SOAR platforms?", avatar: "D" },
];

export function LiveLectureScreen() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<LiveMessage[]>(INITIAL_MESSAGES);
  const [handRaised, setHandRaised] = useState(false);
  const [viewerCount] = useState(156);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { user: "You", text: message.trim(), avatar: "Y" }]);
    setMessage("");
  };

  const handleRaiseHand = () => {
    setHandRaised((prev) => !prev);
    if (!handRaised) {
      setMessages((prev) => [
        ...prev,
        { user: "System", text: "You raised your hand ✋", avatar: "!", isSystem: true },
      ]);
    }
  };

  return (
    <div className="h-screen bg-[#0A0E1A] max-w-[393px] mx-auto flex flex-col">
      {/* Live video area */}
      <div className="h-[340px] bg-gradient-to-b from-[#1A2038] to-[#0A0E1A] relative flex items-center justify-center flex-shrink-0">
        {/* LIVE badge */}
        <div className="absolute top-12 left-6 px-2 py-1 rounded-full bg-[rgba(255,59,92,0.12)] flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-[#FF3B5C] rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-[#FF3B5C] uppercase tracking-wider">LIVE</span>
        </div>

        {/* Participant count */}
        <div className="absolute top-12 right-6 flex items-center gap-1.5">
          <Users size={14} stroke="#EAEEFF" />
          <span className="text-[11px] text-[#EAEEFF]">{viewerCount} watching</span>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="absolute top-12 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[rgba(10,14,26,0.7)] flex items-center justify-center"
        >
          <ArrowLeft size={24} stroke="#EAEEFF" />
        </button>

        <div className="text-[#5A6599] text-center">
          <div className="w-16 h-16 rounded-full bg-[rgba(0,229,255,0.12)] flex items-center justify-center mx-auto mb-2">
            <Users size={32} stroke="#00E5FF" />
          </div>
          <p className="text-[13px]">Live video stream</p>
          <p className="text-[11px] text-[#5A6599] mt-1">Incident Response Masterclass</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-[#0A0E1A] overflow-hidden">
        <div className="px-6 py-3 border-b border-[#2A3362]">
          <h4 className="text-[#EAEEFF]">Live Chat</h4>
        </div>

        {/* Messages */}
        <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: msg.isSystem ? "rgba(0,229,255,0.08)" : "#1E2545",
                  border: msg.isSystem ? "1px solid rgba(0,229,255,0.25)" : "1px solid #2A3362",
                }}
              >
                <span className="text-[10px] font-bold" style={{ color: msg.user === "You" ? "#39FF14" : "#00E5FF" }}>
                  {msg.avatar}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                {msg.isSystem ? (
                  <p className="text-[12px] text-[#5A6599] italic">{msg.text}</p>
                ) : (
                  <p className="text-[13px]">
                    <span className={`font-semibold ${msg.user === "You" ? "text-[#39FF14]" : "text-[#EAEEFF]"}`}>
                      {msg.user}:{" "}
                    </span>
                    <span className="text-[#8B95C9]">{msg.text}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="px-6 py-4 border-t border-[#2A3362] flex items-center gap-2 flex-shrink-0">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 px-4 py-2 rounded-full bg-[#1E2545] border border-[#2A3362] text-[#EAEEFF] placeholder:text-[#5A6599] focus:outline-none focus:border-[#00E5FF] transition-colors text-[13px]"
          />
          <button
            onClick={handleRaiseHand}
            className="px-3 py-2 rounded-full border text-[13px] flex items-center gap-1 transition-colors"
            style={{
              borderColor: handRaised ? "#FF9F1C" : "#2A3362",
              color: handRaised ? "#FF9F1C" : "#5A6599",
              backgroundColor: handRaised ? "rgba(255,159,28,0.08)" : "transparent",
            }}
          >
            <Hand size={14} />
            <span className="hidden sm:inline">{handRaised ? "Lower" : "Raise"}</span>
          </button>
          <button
            onClick={handleSend}
            className="w-9 h-9 rounded-full bg-[#00E5FF] flex items-center justify-center active:scale-90 transition-transform"
          >
            <Send size={16} stroke="#0A0E1A" />
          </button>
        </div>
      </div>
    </div>
  );
}
