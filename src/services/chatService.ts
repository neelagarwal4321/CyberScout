import { getAccessToken } from './api';

const BASE_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3000/api';

export type SSEEventType =
  | 'agent_status'
  | 'guardrail_blocked'
  | 'token'
  | 'citation'
  | 'quiz'
  | 'done'
  | 'error';

export interface SSEEvent {
  type: SSEEventType;
  [key: string]: unknown;
}

export interface StreamChatOptions {
  conversationId?: string;
  message: string;
  context?: { currentTopic?: string; courseId?: string };
  onEvent: (event: SSEEvent) => void;
  onDone?: () => void;
  signal?: AbortSignal;
}

/**
 * Streams a chat message using SSE (fetch + ReadableStream reader).
 * Calls onEvent for every parsed SSE event.
 */
export async function streamChat(opts: StreamChatOptions): Promise<void> {
  const token = getAccessToken();

  const response = await fetch(`${BASE_URL}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({
      conversationId: opts.conversationId,
      message: opts.message,
      context: opts.context,
    }),
    signal: opts.signal,
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => `HTTP ${response.status}`);
    throw new Error(errorText);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') {
          opts.onDone?.();
          return;
        }
        try {
          const event = JSON.parse(data) as SSEEvent;
          opts.onEvent(event);
        } catch {
          // malformed event — skip
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  opts.onDone?.();
}
