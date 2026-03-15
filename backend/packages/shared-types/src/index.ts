// ─── User & Auth ────────────────────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'pro' | 'max';
export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tier: SubscriptionTier;
  level: UserLevel;
  xp: number;
  streak: number;
  interests: string[];
  joinedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type CourseTrack = 'Foundations' | 'Blue Team' | 'Red Team' | 'Advanced Ops' | 'GRC';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  track: CourseTrack;
  difficulty: CourseDifficulty;
  tier: SubscriptionTier;
  durationHours: number;
  enrolledCount: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  prerequisites: string[];
  createdAt: string;
  modules: CourseModule[];
}

export interface CourseModule {
  id: string;
  title: string;
  lectures: Lecture[];
}

export interface Lecture {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'lab' | 'quiz' | 'reading';
  free?: boolean;
}

export interface Enrollment {
  courseId: string;
  enrolledAt: string;
  progress: number; // 0-100
  completedAt?: string;
}

export interface LectureProgress {
  lectureId: string;
  secondsWatched: number;
  completed: boolean;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardSummary {
  user: User;
  enrolledCount: number;
  completedCount: number;
  totalHoursLearned: number;
  overallProgress: number; // 0-100
  currentCourse?: {
    id: string;
    title: string;
    progress: number;
    lastLecture: string;
    track: CourseTrack;
  };
  recommendations: Recommendation[];
  weekActivity: { day: string; minutes: number }[];
  upcomingSessions: LiveSession[];
}

export interface Recommendation {
  courseId: string;
  title: string;
  track: CourseTrack;
  reason: string;
  score: number;
}

export interface LiveSession {
  id: string;
  title: string;
  instructor: string;
  enrolledCount: number;
  startTime: string;
}

// ─── Chat & Agents ───────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
  suggestedTopics?: string[];
  quiz?: QuizPayload;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  messageCount: number;
}

export interface Citation {
  source: string;
  documentTitle: string;
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
  difficulty: 'recall' | 'understanding' | 'application' | 'analysis';
}

// ─── SSE Events ──────────────────────────────────────────────────────────────

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
  content?: string;         // type: 'token'
  agent?: string;           // type: 'agent_status'
  status?: string;          // type: 'agent_status'
  data?: Citation | QuizPayload | Record<string, unknown>; // type: 'citation' | 'quiz'
  reason?: string;          // type: 'guardrail_blocked'
  suggestedTopics?: string[]; // type: 'done'
  timings?: Record<string, number>; // type: 'done'
  code?: string;            // type: 'error'
  message?: string;         // type: 'error'
}

// ─── Mastery ─────────────────────────────────────────────────────────────────

export interface TopicMastery {
  topic: string;
  masteryScore: number; // 0-100
  quizzesTaken: number;
  quizzesPassed: number;
  lastAssessed?: string;
}

// ─── Subscription ────────────────────────────────────────────────────────────

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

// ─── Internal ────────────────────────────────────────────────────────────────

export interface AgentInput {
  message: string;
  conversationHistory: ChatMessage[];
  userLevel: UserLevel;
  currentTopic?: string;
  courseId?: string;
  userId: string;
}

export interface AgentContext {
  intent?: string;
  confidence?: number;
  guardrailPassed?: boolean;
  guardrailReason?: string;
  retrievedChunks?: RetrievedChunk[];
  citations?: Citation[];
  responseContent?: string;
  quiz?: QuizPayload;
  suggestedTopics?: string[];
  agentTimings?: Record<string, number>;
}

export interface RetrievedChunk {
  id: string;
  score: number;
  metadata: {
    text: string;
    source: string;
    documentTitle: string;
    section: string;
    topic: string;
    difficulty: string;
    url?: string;
  };
}
