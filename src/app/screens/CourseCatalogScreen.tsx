import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Search, Shield, Eye, Bug, Terminal, FileText, Grid, Star, Clock, Users, User, Lock } from "lucide-react";
import { TabBar } from "../components/TabBar";
import { useAuth } from "../context/AuthContext";

export function CourseCatalogScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filters = [
    { id: "all", icon: Grid, label: "All", color: "#00E5FF" },
    { id: "foundations", icon: Shield, label: "Foundations", color: "#00E5FF" },
    { id: "blueteam", icon: Eye, label: "Blue Team", color: "#3B82F6" },
    { id: "redteam", icon: Bug, label: "Red Team", color: "#FF3B5C" },
    { id: "advancedops", icon: Terminal, label: "Advanced Ops", color: "#A855F7" },
    { id: "grc", icon: FileText, label: "GRC", color: "#FF9F1C" },
  ];

  const courses = [
    {
      id: "foundations",
      icon: Shield,
      iconColor: "#00E5FF",
      bgColor: "rgba(0,229,255,0.06)",
      track: "Foundations",
      trackColor: "#00E5FF",
      difficulty: "Beginner",
      difficultyColor: "#39FF14",
      title: "Cybersecurity Foundations",
      description: "Start your cybersecurity journey. Learn networking basics, operating systems, and core security concepts.",
      rating: "4.8",
      reviews: "342",
      duration: "12h",
      students: "5,420",
      instructor: "Dr. Lisa Park",
      tier: null,
    },
    {
      id: "web-security",
      icon: Bug,
      iconColor: "#FF3B5C",
      bgColor: "rgba(255,59,92,0.06)",
      track: "Red Team",
      trackColor: "#FF3B5C",
      difficulty: "Intermediate",
      difficultyColor: "#FF9F1C",
      title: "Web Application Security",
      description: "Master web vulnerabilities from OWASP Top 10 to advanced exploitation techniques.",
      rating: "4.9",
      reviews: "218",
      duration: "18h",
      students: "3,150",
      instructor: "Marcus Rivera",
      tier: "PRO",
    },
    {
      id: "incident-response",
      icon: Eye,
      iconColor: "#3B82F6",
      bgColor: "rgba(59,130,246,0.06)",
      track: "Blue Team",
      trackColor: "#3B82F6",
      difficulty: "Intermediate",
      difficultyColor: "#FF9F1C",
      title: "Incident Response & Forensics",
      description: "Learn to detect, respond to, and investigate security incidents like a professional.",
      rating: "4.7",
      reviews: "176",
      duration: "15h",
      students: "2,280",
      instructor: "Sarah Kim",
      tier: "PRO",
    },
    {
      id: "malware-analysis",
      icon: Terminal,
      iconColor: "#A855F7",
      bgColor: "rgba(168,85,247,0.06)",
      track: "Advanced Ops",
      trackColor: "#A855F7",
      difficulty: "Advanced",
      difficultyColor: "#FF3B5C",
      title: "Advanced Malware Analysis",
      description: "Deep dive into reverse engineering, static and dynamic analysis of sophisticated malware.",
      rating: "4.9",
      reviews: "92",
      duration: "24h",
      students: "890",
      instructor: "Dr. James Okonkwo",
      tier: "MAX",
    },
  ];

  const trackMap: Record<string, string> = {
    foundations: "Foundations",
    blueteam: "Blue Team",
    redteam: "Red Team",
    advancedops: "Advanced Ops",
    grc: "GRC",
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesFilter = activeFilter === "all" || c.track.toLowerCase().replace(" ", "") === activeFilter;
      const matchesSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const isLocked = (tier: string | null) => {
    if (!tier) return false;
    if (tier === "PRO") return !user || user.tier === "free";
    if (tier === "MAX") return !user || user.tier === "free" || user.tier === "pro";
    return false;
  };

  return (
    <div className="h-screen bg-[#0A0E1A] pb-[100px] max-w-[393px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <h1 className="text-[#EAEEFF]" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
          Courses
        </h1>
      </div>

      {/* Search bar */}
      <div className="px-6 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-[#5A6599]" size={18} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#1E2545] border border-[#2A3362] text-[#EAEEFF] placeholder:text-[#5A6599] focus:outline-none focus:border-[#00E5FF] transition-colors"
          />
        </div>
      </div>

      {/* Track filters */}
      <div className="flex gap-2 px-6 pb-4 overflow-x-auto scrollbar-hide">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full border text-[13px] flex items-center gap-2 whitespace-nowrap transition-colors ${
                isActive
                  ? `border-[${filter.color}] bg-[rgba(0,229,255,0.08)]`
                  : "border-[#2A3362]"
              }`}
              style={{
                borderColor: isActive ? filter.color : "#2A3362",
                backgroundColor: isActive ? `${filter.color}14` : "transparent",
                color: isActive ? filter.color : "#8B95C9",
              }}
            >
              <Icon size={14} />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Course cards */}
      <div className="px-6 space-y-4">
        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[15px] text-[#5A6599]">No courses found</p>
            <button onClick={() => { setSearchQuery(""); setActiveFilter("all"); }} className="text-[13px] text-[#00E5FF] mt-2">
              Clear filters
            </button>
          </div>
        )}
        {filteredCourses.map((course) => {
          const Icon = course.icon;
          const locked = isLocked(course.tier);
          return (
            <button
              key={course.id}
              onClick={() => navigate(`/course/${course.id}`)}
              className="w-full rounded-2xl bg-[#1E2545] border border-[#2A3362] overflow-hidden active:bg-[#252D55] transition-colors text-left relative"
            >
              {/* Thumbnail */}
              <div
                className="h-[120px] flex items-center justify-center relative"
                style={{ backgroundColor: course.bgColor }}
              >
                <Icon size={32} stroke={locked ? "#5A6599" : course.iconColor} />
                {locked && (
                  <div className="absolute inset-0 bg-[rgba(10,14,26,0.6)] flex items-center justify-center">
                    <Lock size={24} stroke="#5A6599" />
                  </div>
                )}
                {course.tier && (
                  <div
                    className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: course.tier === "MAX" ? "#FFD700" : "#00E5FF",
                      color: "#0A0E1A",
                    }}
                  >
                    {course.tier}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                {/* Pills */}
                <div className="flex gap-2 mb-2">
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-medium"
                    style={{
                      backgroundColor: `${course.trackColor}14`,
                      color: course.trackColor,
                    }}
                  >
                    {course.track}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-medium"
                    style={{
                      backgroundColor: `${course.difficultyColor}14`,
                      color: course.difficultyColor,
                    }}
                  >
                    {course.difficulty}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-[#EAEEFF] mb-2">{course.title}</h4>

                {/* Description */}
                <p className="text-[13px] text-[#8B95C9] mb-3 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 mb-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star size={12} fill="#FF9F1C" stroke="#FF9F1C" />
                    <span className="text-[11px] text-[#EAEEFF]">{course.rating}</span>
                    <span className="text-[11px] text-[#5A6599]">({course.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} stroke="#5A6599" />
                    <span className="text-[11px] text-[#5A6599]">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={12} stroke="#5A6599" />
                    <span className="text-[11px] text-[#5A6599]">{course.students}</span>
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-2">
                  <div className="w-[22px] h-[22px] rounded-full bg-[#1A2038] flex items-center justify-center">
                    <User size={12} stroke="#5A6599" />
                  </div>
                  <span className="text-[13px] text-[#8B95C9]">{course.instructor}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <TabBar />
    </div>
  );
}
