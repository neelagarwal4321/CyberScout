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
    { id: "all", icon: Grid, label: "All", color: "#A855F7" },
    { id: "foundations", icon: Shield, label: "Foundations", color: "#A855F7" },
    { id: "blueteam", icon: Eye, label: "Blue Team", color: "#60A5FA" },
    { id: "redteam", icon: Bug, label: "Red Team", color: "#F87171" },
    { id: "advancedops", icon: Terminal, label: "Advanced Ops", color: "#C084FC" },
    { id: "grc", icon: FileText, label: "GRC", color: "#FBBF24" },
  ];

  const courses = [
    {
      id: "foundations",
      icon: Shield,
      iconColor: "#A855F7",
      bgColor: "rgba(168,85,247,0.06)",
      track: "Foundations",
      trackColor: "#A855F7",
      difficulty: "Beginner",
      difficultyColor: "#4ADE80",
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
      iconColor: "#F87171",
      bgColor: "rgba(248,113,113,0.06)",
      track: "Red Team",
      trackColor: "#F87171",
      difficulty: "Intermediate",
      difficultyColor: "#FBBF24",
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
      iconColor: "#60A5FA",
      bgColor: "rgba(96,165,250,0.06)",
      track: "Blue Team",
      trackColor: "#60A5FA",
      difficulty: "Intermediate",
      difficultyColor: "#FBBF24",
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
      iconColor: "#C084FC",
      bgColor: "rgba(192,132,252,0.06)",
      track: "Advanced Ops",
      trackColor: "#C084FC",
      difficulty: "Advanced",
      difficultyColor: "#F87171",
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
    <div className="h-screen bg-[#0D0B1A] pb-[100px] max-w-[393px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <h1 className="text-[#F0ECF9]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Courses
        </h1>
      </div>

      {/* Search bar */}
      <div className="px-6 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-[#655C80]" size={18} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] text-[#F0ECF9] placeholder:text-[#655C80] focus:outline-none focus:border-[#A855F7] transition-colors"
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
              className={`px-4 py-2 rounded-full border text-[13px] flex items-center gap-2 whitespace-nowrap transition-colors`}
              style={{
                borderColor: isActive ? filter.color : "rgba(80,60,140,0.3)",
                backgroundColor: isActive ? `${filter.color}14` : "transparent",
                color: isActive ? filter.color : "#9B8FBB",
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
            <p className="text-[15px] text-[#655C80]">No courses found</p>
            <button onClick={() => { setSearchQuery(""); setActiveFilter("all"); }} className="text-[13px] text-[#A855F7] mt-2">
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
              className="w-full rounded-2xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] overflow-hidden active:bg-[rgba(40,30,72,0.7)] transition-colors text-left relative"
            >
              {/* Thumbnail */}
              <div
                className="h-[120px] flex items-center justify-center relative"
                style={{ backgroundColor: course.bgColor }}
              >
                <Icon size={32} stroke={locked ? "#655C80" : course.iconColor} />
                {locked && (
                  <div className="absolute inset-0 bg-[rgba(13,11,26,0.6)] flex items-center justify-center">
                    <Lock size={24} stroke="#655C80" />
                  </div>
                )}
                {course.tier && (
                  <div
                    className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: course.tier === "MAX" ? "#E8A838" : "#A855F7",
                      color: "#0D0B1A",
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
                <h4 className="text-[#F0ECF9] mb-2">{course.title}</h4>

                {/* Description */}
                <p className="text-[13px] text-[#9B8FBB] mb-3 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 mb-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star size={12} fill="#E8A838" stroke="#E8A838" />
                    <span className="text-[11px] text-[#F0ECF9]">{course.rating}</span>
                    <span className="text-[11px] text-[#655C80]">({course.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} stroke="#655C80" />
                    <span className="text-[11px] text-[#655C80]">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={12} stroke="#655C80" />
                    <span className="text-[11px] text-[#655C80]">{course.students}</span>
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-2">
                  <div className="w-[22px] h-[22px] rounded-full bg-[#1C1633] flex items-center justify-center">
                    <User size={12} stroke="#655C80" />
                  </div>
                  <span className="text-[13px] text-[#9B8FBB]">{course.instructor}</span>
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
