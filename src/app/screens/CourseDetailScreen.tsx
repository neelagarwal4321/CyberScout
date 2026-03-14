import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Shield, Star, Clock, Layers, Users, CheckCircle, PlayCircle, FileText, HelpCircle, Code, User } from "lucide-react";

export function CourseDetailScreen() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState<"overview" | "syllabus" | "reviews">("overview");

  const isPro = courseId !== "foundations";
  const isMax = courseId === "malware-analysis";

  return (
    <div className="min-h-screen bg-[#0A0E1A] max-w-[393px] mx-auto pb-24">
      {/* Hero section */}
      <div className="h-[180px] bg-[rgba(0,229,255,0.03)] relative flex items-center justify-center">
        <Shield size={64} stroke="rgba(0,229,255,0.37)" />
        
        {/* Back button */}
        <button
          onClick={() => navigate("/courses")}
          className="absolute top-12 left-6 w-10 h-10 rounded-full bg-[rgba(10,14,26,0.5)] flex items-center justify-center"
        >
          <ArrowLeft size={24} stroke="#EAEEFF" />
        </button>
      </div>

      {/* Title section */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-medium bg-[rgba(0,229,255,0.08)] text-[#00E5FF]">
            Foundations
          </span>
          {isPro && !isMax && (
            <span className="px-2 py-0.5 rounded bg-[#00E5FF] text-[10px] font-bold uppercase tracking-wider text-[#0A0E1A]">
              PRO
            </span>
          )}
          {isMax && (
            <span className="px-2 py-0.5 rounded bg-[#FFD700] text-[10px] font-bold uppercase tracking-wider text-[#0A0E1A]">
              MAX
            </span>
          )}
        </div>
        
        <h1 className="text-[#EAEEFF] mb-4" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
          Cybersecurity Foundations
        </h1>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-full bg-[#1A2038] flex items-center justify-center">
            <User size={14} stroke="#5A6599" />
          </div>
          <span className="text-[15px] text-[#8B95C9]">Dr. Lisa Park</span>
        </div>

        {/* Stats */}
        <div className="border-t border-[#2A3362] pt-5 grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star size={14} fill="#FF9F1C" stroke="#FF9F1C" />
              <span className="text-[15px] text-[#EAEEFF]">4.8</span>
            </div>
            <span className="text-[11px] text-[#5A6599]">342 reviews</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={14} stroke="#5A6599" />
              <span className="text-[15px] text-[#EAEEFF]">12h</span>
            </div>
            <span className="text-[11px] text-[#5A6599]">duration</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Layers size={14} stroke="#5A6599" />
              <span className="text-[15px] text-[#EAEEFF]">6</span>
            </div>
            <span className="text-[11px] text-[#5A6599]">modules</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users size={14} stroke="#5A6599" />
              <span className="text-[15px] text-[#EAEEFF]">5.4k</span>
            </div>
            <span className="text-[11px] text-[#5A6599]">students</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-[#2A3362] px-6">
        {(["overview", "syllabus", "reviews"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 pb-3 text-[15px] capitalize ${
              activeTab === tab
                ? "text-[#00E5FF] border-b-2 border-[#00E5FF]"
                : "text-[#5A6599]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-6 py-6">
        {activeTab === "overview" && (
          <div>
            <p className="text-[15px] text-[#8B95C9] leading-relaxed mb-6">
              Start your cybersecurity journey. Learn networking basics, operating systems, and core security concepts.
            </p>

            <h3 className="text-[#EAEEFF] mb-4">What you'll learn</h3>
            <div className="space-y-3 mb-6">
              {[
                "Understand core vulnerability classes",
                "Perform real-world penetration tests",
                "Build defense strategies",
                "Analyze and respond to incidents",
                "Earn completion certificate",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle size={18} stroke="#39FF14" className="flex-shrink-0 mt-0.5" />
                  <span className="text-[15px] text-[#EAEEFF]">{item}</span>
                </div>
              ))}
            </div>

            <h3 className="text-[#EAEEFF] mb-3">Tags</h3>
            <div className="flex gap-2 flex-wrap">
              {["networking", "fundamentals", "CIA triad"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-[#1E2545] border border-[#2A3362] text-[11px] text-[#8B95C9] uppercase tracking-wider font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === "syllabus" && (
          <div className="space-y-6">
            {/* Module 1 */}
            <div>
              <h4 className="text-[#EAEEFF] mb-3">Module 1: What is Cybersecurity?</h4>
              <div className="space-y-0 border border-[#2A3362] rounded-xl overflow-hidden">
                {[
                  { icon: PlayCircle, color: "#39FF14", title: "The Cybersecurity Landscape", duration: "14 min · video", completed: true },
                  { icon: PlayCircle, color: "#39FF14", title: "CIA Triad Explained", duration: "12 min · video", completed: true },
                  { icon: FileText, color: "#5A6599", title: "Types of Cyber Threats", duration: "10 min · reading", completed: false },
                  { icon: HelpCircle, color: "#5A6599", title: "Module Quiz", duration: "5 min · quiz", completed: false },
                ].map((lecture, i, arr) => {
                  const Icon = lecture.icon;
                  return (
                    <div
                      key={i}
                      className={`px-3 py-3 flex items-center gap-3 ${i < arr.length - 1 ? "border-b border-[#2A3362]" : ""}`}
                    >
                      <Icon size={18} stroke={lecture.color} />
                      <div className="flex-1">
                        <div className="text-[15px] text-[#EAEEFF] mb-0.5">{lecture.title}</div>
                        <div className="text-[11px] text-[#5A6599]">{lecture.duration}</div>
                      </div>
                      {lecture.completed && <CheckCircle size={18} stroke="#39FF14" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Module 2 */}
            <div>
              <h4 className="text-[#EAEEFF] mb-3">Module 2: Networking Fundamentals</h4>
              <div className="space-y-0 border border-[#2A3362] rounded-xl overflow-hidden">
                {[
                  { icon: PlayCircle, color: "#5A6599", title: "OSI Model Deep Dive", duration: "20 min · video" },
                  { icon: PlayCircle, color: "#5A6599", title: "TCP/IP Essentials", duration: "16 min · video" },
                  { icon: Code, color: "#5A6599", title: "Hands-on: Packet Analysis", duration: "30 min · lab" },
                ].map((lecture, i, arr) => {
                  const Icon = lecture.icon;
                  return (
                    <div
                      key={i}
                      className={`px-3 py-3 flex items-center gap-3 ${i < arr.length - 1 ? "border-b border-[#2A3362]" : ""}`}
                    >
                      <Icon size={18} stroke={lecture.color} />
                      <div className="flex-1">
                        <div className="text-[15px] text-[#EAEEFF] mb-0.5">{lecture.title}</div>
                        <div className="text-[11px] text-[#5A6599]">{lecture.duration}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full bg-[rgba(90,101,153,0.12)] flex items-center justify-center mb-4">
              <Star size={24} stroke="#5A6599" />
            </div>
            <p className="text-[15px] text-[#5A6599] mb-1">342 reviews · 4.8 average</p>
            <p className="text-[13px] text-[#5A6599]">Reviews will load from backend API</p>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#111629] border-t border-[#2A3362] px-6 py-6 max-w-[393px] mx-auto">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[13px] text-[#5A6599]">{isPro ? (isMax ? "$49/mo Max" : "$19/mo Pro") : "Free"}</p>
            <h4 className="text-[#EAEEFF]">12 hours</h4>
          </div>
          <button
            onClick={() => {
              if (isPro) {
                navigate("/subscription");
              } else {
                navigate("/lecture/1");
              }
            }}
            className={`px-8 py-3 rounded-xl font-semibold active:scale-[0.97] transition-transform ${
              isPro
                ? isMax
                  ? "bg-[#FFD700] text-[#0A0E1A]"
                  : "bg-[#A855F7] text-[#EAEEFF]"
                : "bg-[#00E5FF] text-[#0A0E1A]"
            }`}
          >
            {isPro ? (isMax ? "Upgrade to Max" : "Upgrade to Pro") : "Enroll Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
