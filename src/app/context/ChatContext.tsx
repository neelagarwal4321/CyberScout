import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { api } from "../../services/api";
import { streamChat } from "../../services/chatService";
import type { SSEEvent } from "../../services/chatService";

export interface Citation {
  source: string;
  documentTitle?: string;
  section: string;
  url?: string;
  relevanceScore?: number;
}

export interface QuizPayload {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  difficulty: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  citations?: Citation[];
  suggestedTopics?: string[];
  quiz?: QuizPayload;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  topic?: string;
  updatedAt: Date;
  _count?: { messages: number };
}

interface ChatContextValue {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  quiz: QuizPayload | null;
  suggestedTopics: string[];
  sendMessage: (text: string, context?: { currentTopic?: string; courseId?: string }) => void;
  createConversation: () => Promise<string>;
  loadConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  submitQuizAnswer: (topic: string, correct: boolean) => Promise<void>;
  dismissQuiz: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Load conversation list on mount
  useEffect(() => {
    api
      .get<{ data: Conversation[] }>("/chat/conversations")
      .then((res) =>
        setConversations(
          res.data.map((c) => ({ ...c, updatedAt: new Date(c.updatedAt) })),
        ),
      )
      .catch(() => {
        // Not logged in yet — silently ignore
      });
  }, []);

  const createConversation = async (): Promise<string> => {
    const res = await api.post<{ data: Conversation }>("/chat/conversations", {});
    const conv = { ...res.data, updatedAt: new Date(res.data.updatedAt) };
    setConversations((prev) => [conv, ...prev]);
    setActiveConversationId(conv.id);
    setMessages([]);
    return conv.id;
  };

  const loadConversation = async (id: string): Promise<void> => {
    const res = await api.get<{
      data: Array<{ id: string; role: string; content: string; createdAt: string; metadata?: { citations?: Citation[]; suggestedTopics?: string[]; quiz?: QuizPayload } }>;
    }>(`/chat/conversations/${id}/messages`);

    const msgs: ChatMessage[] = res.data.map((m) => ({
      id: m.id,
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
      timestamp: new Date(m.createdAt),
      citations: m.metadata?.citations,
      suggestedTopics: m.metadata?.suggestedTopics,
      quiz: m.metadata?.quiz,
    }));

    setActiveConversationId(id);
    setMessages(msgs);
    setQuiz(null);
    setSuggestedTopics([]);
  };

  const deleteConversation = async (id: string): Promise<void> => {
    await api.delete(`/chat/conversations/${id}`);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
  };

  const sendMessage = (
    text: string,
    context?: { currentTopic?: string; courseId?: string },
  ) => {
    if (!text.trim() || isStreaming) return;

    // Abort any existing stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const convId = activeConversationId;

    // Optimistically add user message
    const userMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setQuiz(null);
    setSuggestedTopics([]);

    // Placeholder streaming AI message
    const aiMsgId = `streaming-${Date.now()}`;
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, aiMsg]);

    const pendingCitations: Citation[] = [];
    let finalQuiz: QuizPayload | undefined;
    let finalTopics: string[] = [];

    streamChat({
      conversationId: convId ?? undefined,
      message: text,
      context,
      signal: controller.signal,
      onEvent: (event: SSEEvent) => {
        switch (event.type) {
          case "token":
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId
                  ? { ...m, content: m.content + (event["content"] as string) }
                  : m,
              ),
            );
            break;

          case "citation":
            pendingCitations.push(event["data"] as Citation);
            break;

          case "quiz":
            finalQuiz = event["data"] as QuizPayload;
            break;

          case "done":
            finalTopics = (event["suggestedTopics"] as string[]) ?? [];
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId
                  ? {
                      ...m,
                      isStreaming: false,
                      citations: pendingCitations.length > 0 ? [...pendingCitations] : undefined,
                      suggestedTopics: finalTopics.length > 0 ? finalTopics : undefined,
                      quiz: finalQuiz,
                    }
                  : m,
              ),
            );
            if (finalQuiz) setQuiz(finalQuiz);
            if (finalTopics.length > 0) setSuggestedTopics(finalTopics);
            setIsStreaming(false);

            // Refresh conversation list to pick up new title
            api
              .get<{ data: Conversation[] }>("/chat/conversations")
              .then((res) =>
                setConversations(
                  res.data.map((c) => ({ ...c, updatedAt: new Date(c.updatedAt) })),
                ),
              )
              .catch(() => {});
            break;

          case "error":
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId
                  ? { ...m, isStreaming: false, content: m.content || "Something went wrong. Please try again." }
                  : m,
              ),
            );
            setIsStreaming(false);
            break;
        }
      },
      onDone: () => {
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, isStreaming: false } : m,
          ),
        );
      },
    }).catch((err) => {
      if (err?.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, isStreaming: false, content: m.content || "Connection error. Please try again." }
            : m,
        ),
      );
      setIsStreaming(false);
    });
  };

  const submitQuizAnswer = async (topic: string, correct: boolean): Promise<void> => {
    await api.post("/chat/quiz/answer", { topic, correct });
    setQuiz(null);
  };

  const dismissQuiz = () => setQuiz(null);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        messages,
        isStreaming,
        quiz,
        suggestedTopics,
        sendMessage,
        createConversation,
        loadConversation,
        deleteConversation,
        submitQuizAnswer,
        dismissQuiz,
      }}
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
