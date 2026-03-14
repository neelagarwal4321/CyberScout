import { useNavigate } from "react-router";
import { ArrowLeft, Search } from "lucide-react";

export function ChatHistoryScreen() {
  const navigate = useNavigate();

  const history = [
    {
      section: "This Week",
      chats: [
        { title: "Understanding SQL Injection", tag: "web-security", date: "Mar 11", messages: "14" },
        { title: "OSI Model Layers", tag: "networking", date: "Mar 10", messages: "8" },
      ],
    },
    {
      section: "Last Week",
      chats: [
        { title: "Password Hashing Best Practices", tag: "cryptography", date: "Mar 9", messages: "22" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E1A] max-w-[393px] mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-[#2A3362]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/chat")}>
            <ArrowLeft size={24} stroke="#EAEEFF" />
          </button>
          <h2 className="text-[#EAEEFF]" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
            Chat History
          </h2>
        </div>
        <button>
          <Search size={22} stroke="#8B95C9" />
        </button>
      </div>

      {/* History list */}
      <div>
        {history.map((group, i) => (
          <div key={i}>
            <div className="px-6 py-3">
              <span className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium">
                {group.section}
              </span>
            </div>
            {group.chats.map((chat, j) => (
              <button
                key={j}
                onClick={() => navigate("/chat")}
                className="w-full px-6 py-4 border-b border-[#2A3362] text-left active:bg-[#1E2545] transition-colors"
              >
                <h4 className="text-[#EAEEFF] mb-2">{chat.title}</h4>
                <div className="flex items-center gap-3 text-[11px] text-[#5A6599]">
                  <span className="px-2 py-0.5 rounded-full bg-[#1E2545] border border-[#2A3362]">
                    {chat.tag}
                  </span>
                  <span>{chat.date}</span>
                  <span>{chat.messages} messages</span>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
