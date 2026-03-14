import { createContext, useContext, useState, useRef, ReactNode } from "react";

export interface Citation {
  source: string;
  section: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  citations?: Citation[];
  suggestedTopics?: string[];
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: ChatMessage[];
}

interface ChatContextValue {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (text: string) => void;
  createConversation: () => string;
  loadConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
}

const MOCK_RESPONSES = [
  {
    content:
      "SQL injection is a code injection technique that exploits vulnerabilities in an application's database layer.\n\nAn attacker can insert or **manipulate SQL queries** to:\n- Bypass authentication\n- Access or modify data\n- Execute admin operations on the database\n\n```sql\n-- Vulnerable query\nSELECT * FROM users WHERE email = '" + "' OR '1'='1" + "';\n```\n\nThe best defenses are **parameterized queries** and prepared statements.",
    citations: [{ source: "OWASP", section: "A03:2021 – Injection" }],
    suggestedTopics: ["Blind SQL Injection", "Prepared Statements", "NoSQL Injection"],
  },
  {
    content:
      "Cross-Site Scripting (XSS) allows attackers to inject malicious scripts into web pages viewed by other users.\n\nThere are three main types:\n1. **Reflected XSS** — payload comes from the request\n2. **Stored XSS** — payload is saved in the database\n3. **DOM-based XSS** — payload manipulates the DOM\n\nAlways encode output and use a Content Security Policy (CSP).",
    citations: [{ source: "OWASP", section: "A07:2021 – XSS" }],
    suggestedTopics: ["Content Security Policy", "DOM XSS", "Stored vs Reflected XSS"],
  },
  {
    content:
      "Great question! Let me explain how **network reconnaissance** works in a penetration testing context.\n\nCommon tools:\n- `nmap` — port scanning and service detection\n- `whois` — domain registration info\n- `dig` / `nslookup` — DNS enumeration\n\nAlways ensure you have **written authorization** before conducting any recon.",
    citations: [{ source: "NIST", section: "SP 800-115 Technical Guide" }],
    suggestedTopics: ["Nmap Techniques", "Passive Reconnaissance", "OSINT"],
  },
];

let msgCounter = 100;
let convCounter = 10;
const uid = () => `${++msgCounter}`;
const cid = () => `conv-${++convCounter}`;

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    title: "SQL Injection Basics",
    lastMessage: "What is SQL injection?",
    timestamp: new Date(Date.now() - 3600000),
    messages: [],
  },
  {
    id: "conv-2",
    title: "XSS Attack Vectors",
    lastMessage: "Explain cross-site scripting",
    timestamp: new Date(Date.now() - 86400000),
    messages: [],
  },
];

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const createConversation = () => {
    const id = cid();
    const newConv: Conversation = {
      id,
      title: "New Conversation",
      lastMessage: "",
      timestamp: new Date(),
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(id);
    setMessages([]);
    return id;
  };

  const loadConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setActiveConversationId(id);
      setMessages(conv.messages);
    }
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || isStreaming) return;

    // Ensure there's an active conversation
    let convId = activeConversationId;
    if (!convId) {
      convId = createConversation();
    }

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Pick a mock response
    const mock = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    const fullText = mock.content;

    const aiMsgId = uid();
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: "ai",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsStreaming(true);

    let charIndex = 0;

    streamRef.current = setInterval(() => {
      charIndex += 3; // stream 3 chars per tick for snappiness
      const streamed = fullText.slice(0, charIndex);
      const done = charIndex >= fullText.length;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                content: done ? fullText : streamed,
                isStreaming: !done,
                citations: done ? mock.citations : undefined,
                suggestedTopics: done ? mock.suggestedTopics : undefined,
              }
            : m
        )
      );

      if (done) {
        clearInterval(streamRef.current!);
        setIsStreaming(false);

        // Update conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  title: c.title === "New Conversation" ? text.slice(0, 40) : c.title,
                  lastMessage: text,
                  timestamp: new Date(),
                  messages: [
                    ...c.messages,
                    userMsg,
                    { id: aiMsgId, role: "ai", content: fullText, timestamp: new Date(), citations: mock.citations, suggestedTopics: mock.suggestedTopics },
                  ],
                }
              : c
          )
        );
      }
    }, 30);
  };

  return (
    <ChatContext.Provider
      value={{ conversations, activeConversationId, messages, isStreaming, sendMessage, createConversation, loadConversation, deleteConversation }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
