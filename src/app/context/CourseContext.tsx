import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "../../services/api";

export type Track = "web" | "network" | "malware" | "cloud" | "pentest" | "forensics" | string;

export interface Lecture {
  id: string;
  title: string;
  durationSeconds?: number;
  duration?: string;
  type: "video" | "lab" | "quiz" | "reading";
  free?: boolean;
  order: number;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lectures: Lecture[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorName?: string;
  instructor?: string;
  track: Track;
  difficulty: "beginner" | "intermediate" | "advanced";
  tier: "free" | "pro" | "max";
  durationHours?: number;
  duration?: string;
  enrolledCount?: number;
  students?: number;
  rating: number;
  modules: Module[];
  tags: string[];
  prerequisites?: string[];
}

export interface LectureProgress {
  lectureId: string;
  secondsWatched: number;
  completed: boolean;
}

export interface Enrollment {
  id?: string;
  courseId: string;
  enrolledAt: Date;
  lastAccessedAt?: Date;
  completedAt?: Date;
  progress: Record<string, LectureProgress>;
}

export interface DashboardSummary {
  user: { name: string; level: string; xp: number; streak: number; tier: string };
  currentCourse: { id: string; title: string; progress: number } | null;
  completedCourses: number;
  weekActivity: number[];
  recommendations: Array<{ courseId: string; title: string; track: string; reason: string; score: number }>;
  topicMastery: Array<{ topic: string; score: number }>;
}

interface CourseContextValue {
  courses: Course[];
  enrollments: Enrollment[];
  dashboard: DashboardSummary | null;
  isLoadingCourses: boolean;
  isEnrolled: (courseId: string) => boolean;
  enrollInCourse: (courseId: string) => Promise<void>;
  updateProgress: (courseId: string, lectureId: string, seconds: number, completed?: boolean) => Promise<void>;
  getProgress: (courseId: string) => number;
  getCourse: (courseId: string) => Course | undefined;
  fetchCourses: (filters?: { track?: string; difficulty?: string; search?: string }) => Promise<void>;
  fetchCourse: (courseId: string) => Promise<Course | undefined>;
  fetchDashboard: () => Promise<void>;
  bookmarks: string[];
  toggleBookmark: (courseId: string) => void;
}

const CourseContext = createContext<CourseContextValue | null>(null);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Normalise API course shape to frontend shape
  const normaliseCourse = (c: any): Course => ({
    ...c,
    instructor: c.instructorName ?? c.instructor,
    students: c.enrolledCount ?? c.students,
    duration: c.durationHours ? `${c.durationHours}h` : c.duration,
    modules: (c.modules ?? []).map((m: any) => ({
      ...m,
      lectures: (m.lectures ?? []).map((l: any) => ({
        ...l,
        duration: l.durationSeconds
          ? `${Math.floor(l.durationSeconds / 60)}:${String(l.durationSeconds % 60).padStart(2, "0")}`
          : l.duration,
      })),
    })),
  });

  const fetchCourses = useCallback(async (filters?: { track?: string; difficulty?: string; search?: string }) => {
    setIsLoadingCourses(true);
    try {
      const params = new URLSearchParams();
      if (filters?.track) params.set("track", filters.track);
      if (filters?.difficulty) params.set("difficulty", filters.difficulty);
      if (filters?.search) params.set("search", filters.search);

      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await api.get<{ data: any[]; meta: object }>(`/courses${query}`);
      setCourses(res.data.map(normaliseCourse));
    } catch {
      // fail silently — keep whatever courses we had
    } finally {
      setIsLoadingCourses(false);
    }
  }, []);

  const fetchCourse = useCallback(async (courseId: string): Promise<Course | undefined> => {
    try {
      const res = await api.get<{ data: any }>(`/courses/${courseId}`);
      const course = normaliseCourse(res.data);
      setCourses((prev) => {
        const idx = prev.findIndex((c) => c.id === courseId);
        if (idx === -1) return [...prev, course];
        const updated = [...prev];
        updated[idx] = course;
        return updated;
      });
      return course;
    } catch {
      return undefined;
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get<{ data: DashboardSummary }>("/dashboard/summary");
      setDashboard(res.data);
    } catch {
      // Not authenticated yet — ignore
    }
  }, []);

  // Load courses on mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const isEnrolled = (courseId: string) => enrollments.some((e) => e.courseId === courseId);

  const enrollInCourse = async (courseId: string): Promise<void> => {
    const res = await api.post<{ data: any }>(`/courses/${courseId}/enroll`, {});
    const enrollment: Enrollment = {
      id: res.data.id,
      courseId,
      enrolledAt: new Date(res.data.enrolledAt ?? Date.now()),
      progress: {},
    };
    setEnrollments((prev) => {
      if (prev.some((e) => e.courseId === courseId)) return prev;
      return [...prev, enrollment];
    });
  };

  const updateProgress = async (
    courseId: string,
    lectureId: string,
    seconds: number,
    completed = false,
  ): Promise<void> => {
    // Optimistic local update
    setEnrollments((prev) =>
      prev.map((e) => {
        if (e.courseId !== courseId) return e;
        const existing = e.progress[lectureId];
        return {
          ...e,
          progress: {
            ...e.progress,
            [lectureId]: {
              lectureId,
              secondsWatched: Math.max(existing?.secondsWatched ?? 0, seconds),
              completed: completed || existing?.completed || false,
            },
          },
        };
      }),
    );

    // Persist to server
    try {
      await api.post(`/courses/${courseId}/lectures/${lectureId}/progress`, {
        completed,
        watchedSeconds: seconds,
      });
    } catch {
      // Revert is not critical — server will reconcile on next load
    }
  };

  const getProgress = (courseId: string): number => {
    const course = courses.find((c) => c.id === courseId);
    const enrollment = enrollments.find((e) => e.courseId === courseId);
    if (!course || !enrollment) return 0;
    const totalLectures = course.modules.flatMap((m) => m.lectures).length;
    if (totalLectures === 0) return 0;
    const completed = Object.values(enrollment.progress).filter((p) => p.completed).length;
    return Math.round((completed / totalLectures) * 100);
  };

  const getCourse = (courseId: string) => courses.find((c) => c.id === courseId);

  const toggleBookmark = (courseId: string) => {
    setBookmarks((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId],
    );
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        enrollments,
        dashboard,
        isLoadingCourses,
        isEnrolled,
        enrollInCourse,
        updateProgress,
        getProgress,
        getCourse,
        fetchCourses,
        fetchCourse,
        fetchDashboard,
        bookmarks,
        toggleBookmark,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourses must be used within CourseProvider");
  return ctx;
}
