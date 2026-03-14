import { createContext, useContext, useState, ReactNode } from "react";

export type Track = "web" | "network" | "malware" | "cloud" | "pentest" | "forensics";

export interface Lecture {
  id: string;
  title: string;
  duration: string;
  type: "video" | "lab" | "quiz";
  free?: boolean;
}

export interface Module {
  id: string;
  title: string;
  lectures: Lecture[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  track: Track;
  difficulty: "beginner" | "intermediate" | "advanced";
  tier: "free" | "pro" | "max";
  duration: string;
  students: number;
  rating: number;
  modules: Module[];
  tags: string[];
}

export interface LectureProgress {
  lectureId: string;
  secondsWatched: number;
  completed: boolean;
}

export interface Enrollment {
  courseId: string;
  enrolledAt: Date;
  progress: Record<string, LectureProgress>;
}

interface CourseContextValue {
  courses: Course[];
  enrollments: Enrollment[];
  isEnrolled: (courseId: string) => boolean;
  enrollInCourse: (courseId: string) => void;
  updateProgress: (courseId: string, lectureId: string, seconds: number) => void;
  getProgress: (courseId: string) => number; // 0-100
  getCourse: (courseId: string) => Course | undefined;
  bookmarks: string[];
  toggleBookmark: (courseId: string) => void;
}

const MOCK_COURSES: Course[] = [
  {
    id: "web-security",
    title: "Web Application Security",
    description: "Master the art of securing web applications. Learn OWASP Top 10, SQL injection, XSS, CSRF, and more.",
    instructor: "Dr. Sarah Kim",
    track: "web",
    difficulty: "beginner",
    tier: "free",
    duration: "12h 30m",
    students: 8420,
    rating: 4.8,
    tags: ["OWASP", "XSS", "SQL Injection"],
    modules: [
      {
        id: "m1",
        title: "Introduction to Web Security",
        lectures: [
          { id: "l1", title: "Course Overview", duration: "5:30", type: "video", free: true },
          { id: "l2", title: "HTTP Protocol Deep Dive", duration: "18:45", type: "video", free: true },
          { id: "l3", title: "OWASP Top 10 Overview", duration: "22:10", type: "video", free: true },
        ],
      },
      {
        id: "m2",
        title: "Injection Attacks",
        lectures: [
          { id: "l4", title: "SQL Injection Fundamentals", duration: "25:30", type: "video" },
          { id: "l5", title: "Blind & Time-Based SQLi", duration: "20:15", type: "video" },
          { id: "l6", title: "SQLi Lab: Vulnerable App", duration: "35:00", type: "lab" },
        ],
      },
      {
        id: "m3",
        title: "Cross-Site Scripting",
        lectures: [
          { id: "l7", title: "Reflected XSS", duration: "18:20", type: "video" },
          { id: "l8", title: "Stored & DOM XSS", duration: "22:45", type: "video" },
          { id: "l9", title: "XSS Defense Strategies", duration: "15:30", type: "video" },
        ],
      },
    ],
  },
  {
    id: "network-pentest",
    title: "Network Penetration Testing",
    description: "Learn professional penetration testing methodologies, tools, and techniques used by real security professionals.",
    instructor: "Marcus Rivera",
    track: "network",
    difficulty: "intermediate",
    tier: "pro",
    duration: "18h 45m",
    students: 5230,
    rating: 4.9,
    tags: ["Nmap", "Metasploit", "Wireshark"],
    modules: [
      {
        id: "m1",
        title: "Recon & Enumeration",
        lectures: [
          { id: "l1", title: "Passive Reconnaissance", duration: "28:00", type: "video", free: true },
          { id: "l2", title: "Active Scanning with Nmap", duration: "35:20", type: "video" },
        ],
      },
    ],
  },
  {
    id: "malware-analysis",
    title: "Malware Analysis & Reverse Engineering",
    description: "Analyze real-world malware samples, understand their behavior, and develop detection signatures.",
    instructor: "Dr. Elena Vasquez",
    track: "malware",
    difficulty: "advanced",
    tier: "pro",
    duration: "24h 15m",
    students: 3180,
    rating: 4.7,
    tags: ["IDA Pro", "Ghidra", "Assembly"],
    modules: [],
  },
  {
    id: "cloud-security",
    title: "Cloud Security Architecture",
    description: "Secure AWS, Azure, and GCP environments. IAM, network policies, monitoring, and incident response.",
    instructor: "James Park",
    track: "cloud",
    difficulty: "intermediate",
    tier: "max",
    duration: "15h 20m",
    students: 4750,
    rating: 4.6,
    tags: ["AWS", "Azure", "IAM"],
    modules: [],
  },
  {
    id: "forensics-101",
    title: "Digital Forensics & Incident Response",
    description: "Investigate security incidents, perform forensic analysis, and build incident response playbooks.",
    instructor: "Agent Taylor",
    track: "forensics",
    difficulty: "intermediate",
    tier: "pro",
    duration: "16h 00m",
    students: 2960,
    rating: 4.8,
    tags: ["Autopsy", "Volatility", "DFIR"],
    modules: [],
  },
];

const CourseContext = createContext<CourseContextValue | null>(null);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([
    {
      courseId: "web-security",
      enrolledAt: new Date("2024-02-01"),
      progress: {
        l1: { lectureId: "l1", secondsWatched: 330, completed: true },
        l2: { lectureId: "l2", secondsWatched: 1125, completed: true },
        l3: { lectureId: "l3", secondsWatched: 600, completed: false },
      },
    },
  ]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const isEnrolled = (courseId: string) => enrollments.some((e) => e.courseId === courseId);

  const enrollInCourse = (courseId: string) => {
    if (isEnrolled(courseId)) return;
    setEnrollments((prev) => [
      ...prev,
      { courseId, enrolledAt: new Date(), progress: {} },
    ]);
  };

  const updateProgress = (courseId: string, lectureId: string, seconds: number) => {
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
              completed: seconds > 0,
            },
          },
        };
      })
    );
  };

  const getProgress = (courseId: string) => {
    const course = MOCK_COURSES.find((c) => c.id === courseId);
    const enrollment = enrollments.find((e) => e.courseId === courseId);
    if (!course || !enrollment) return 0;
    const totalLectures = course.modules.flatMap((m) => m.lectures).length;
    if (totalLectures === 0) return 0;
    const completed = Object.values(enrollment.progress).filter((p) => p.completed).length;
    return Math.round((completed / totalLectures) * 100);
  };

  const getCourse = (courseId: string) => MOCK_COURSES.find((c) => c.id === courseId);

  const toggleBookmark = (courseId: string) => {
    setBookmarks((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  return (
    <CourseContext.Provider
      value={{ courses: MOCK_COURSES, enrollments, isEnrolled, enrollInCourse, updateProgress, getProgress, getCourse, bookmarks, toggleBookmark }}
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
