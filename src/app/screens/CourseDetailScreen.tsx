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
    <div className="h-screen bg-[#0D0B1A] max-w-[393px] mx-auto pb-24 overflow-y-auto">
      {/* Hero section */}
      <div className="h-[180px] bg-[rgba(168,85,247,0.03)] relative flex items-center justify-center">
        <Shield size={64} stroke="rgba(168,85,247,0.37)" />

        {/* Back button */}
        <button
          onClick={() => navigate("/courses")}
          className="absolute top-12 left-6 w-10 h-10 rounded-full bg-[rgba(13,11,26,0.5)] flex items-center justify-center"
        >
          <ArrowLeft size={24} stroke="#F0ECF9" />
        </button>
      </div>

      {/* Title section */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-medium bg-[rgba(168,85,247,0.1)] text-[#A855F7]">
            Foundations
          </span>
          {isPro && !isMax && (
            <span className="px-2 py-0.5 rounded bg-[#A855F7] text-[10px] font-bold uppercase tracking-wider text-[#0D0B1A]">
              PRO
            </span>
          )}
          {isMax && (
            <span className="px-2 py-0.5 rounded bg-[#E8A838] text-[10px] font-bold uppercase tracking-wider text-[#0D0B1A]">
              MAX
            </span>
          )}
        </div>

        <h1 className="text-[#F0ECF9] mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Cybersecurity Foundations
        </h1>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-full bg-[#1C1633] flex items-center justify-center">
            <User size={14} stroke="#655C80" />
          </div>
          <span className="text-[15px] text-[#9B8FBB]">Dr. Lisa Park</span>
        </div>

        {/* Stats */}
        <div className="border-t border-[rgba(80,60,140,0.3)] pt-5 grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star size={14} fill="#E8A838" stroke="#E8A838" />
              <span className="text-[15px] text-[#F0ECF9]">4.8</span>
            </div>
            <span className="text-[11px] text-[#655C80]">342 reviews</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={14} stroke="#655C80" />
              <span className="text-[15px] text-[#F0ECF9]">12h</span>
            </div>
            <span className="text-[11px] text-[#655C80]">duration</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Layers size={14} stroke="#655C80" />
              <span className="text-[15px] text-[#F0ECF9]">6</span>
            </div>
            <span className="text-[11px] text-[#655C80]">modules</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users size={14} stroke="#655C80" />
              <span className="text-[15px] text-[#F0ECF9]">5.4k</span>
            </div>
            <span className="text-[11px] text-[#655C80]">students</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-[rgba(80,60,140,0.3)] px-6">
        {(["overview", "syllabus", "reviews"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 pb-3 text-[15px] capitalize ${
              activeTab === tab
                ? "text-[#A855F7] border-b-2 border-[#A855F7]"
                : "text-[#655C80]"
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
            <p className="text-[15px] text-[#9B8FBB] leading-relaxed mb-6">
              Start your cybersecurity journey. Learn networking basics, operating systems, and core security concepts.
            </p>

            <h3 className="text-[#F0ECF9] mb-4">What you'll learn</h3>
            <div className="space-y-3 mb-6">
              {[
                "Understand core vulnerability classes",
                "Perform real-world penetration tests",
                "Build defense strategies",
                "Analyze and respond to incidents",
                "Earn completion certificate",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle size={18} stroke="#4ADE80" className="flex-shrink-0 mt-0.5" />
                  <span className="text-[15px] text-[#F0ECF9]">{item}</span>
                </div>
              ))}
            </div>

            <h3 className="text-[#F0ECF9] mb-3">Tags</h3>
            <div className="flex gap-2 flex-wrap">
              {["networking", "fundamentals", "CIA triad"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] text-[11px] text-[#9B8FBB] uppercase tracking-wider font-medium"
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
              <h4 className="text-[#F0ECF9] mb-3">Module 1: What is Cybersecurity?</h4>
              <div className="space-y-0 border border-[rgba(80,60,140,0.3)] rounded-xl overflow-hidden">
                {[
                  { icon: PlayCircle, color: "#4ADE80", title: "The Cybersecurity Landscape", duration: "14 min · video", completed: true },
                  { icon: PlayCircle, color: "#4ADE80", title: "CIA Triad Explained", duration: "12 min · video", completed: true },
                  { icon: FileText, color: "#655C80", title: "Types of Cyber Threats", duration: "10 min · reading", completed: false },
                  { icon: HelpCircle, color: "#655C80", title: "Module Quiz", duration: "5 min · quiz", completed: false },
                ].map((lecture, i, arr) => {
                  const Icon = lecture.icon;
                  return (
                    <div
                      key={i}
                      className={`px-3 py-3 flex items-center gap-3 ${i < arr.length - 1 ? "border-b border-[rgba(80,60,140,0.3)]" : ""}`}
                    >
                      <Icon size={18} stroke={lecture.color} />
                      <div className="flex-1">
                        <div className="text-[15px] text-[#F0ECF9] mb-0.5">{lecture.title}</div>
                        <div className="text-[11px] text-[#655C80]">{lecture.duration}</div>
                      </div>
                      {lecture.completed && <CheckCircle size={18} stroke="#4ADE80" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Module 2 */}
            <div>
              <h4 className="text-[#F0ECF9] mb-3">Module 2: Networking Fundamentals</h4>
              <div className="space-y-0 border border-[rgba(80,60,140,0.3)] rounded-xl overflow-hidden">
                {[
                  { icon: PlayCircle, color: "#655C80", title: "OSI Model Deep Dive", duration: "20 min · video" },
                  { icon: PlayCircle, color: "#655C80", title: "TCP/IP Essentials", duration: "16 min · video" },
                  { icon: Code, color: "#655C80", title: "Hands-on: Packet Analysis", duration: "30 min · lab" },
                ].map((lecture, i, arr) => {
                  const Icon = lecture.icon;
                  return (
                    <div
                      key={i}
                      className={`px-3 py-3 flex items-center gap-3 ${i < arr.length - 1 ? "border-b border-[rgba(80,60,140,0.3)]" : ""}`}
                    >
                      <Icon size={18} stroke={lecture.color} />
                      <div className="flex-1">
                        <div className="text-[15px] text-[#F0ECF9] mb-0.5">{lecture.title}</div>
                        <div className="text-[11px] text-[#655C80]">{lecture.duration}</div>
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
            <div className="w-12 h-12 rounded-full bg-[rgba(101,92,128,0.12)] flex items-center justify-center mb-4">
              <Star size={24} stroke="#655C80" />
            </div>
            <p className="text-[15px] text-[#655C80] mb-1">342 reviews · 4.8 average</p>
            <p className="text-[13px] text-[#655C80]">Reviews will load from backend API</p>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#141025] border-t border-[rgba(80,60,140,0.3)] px-6 py-6 max-w-[393px] mx-auto">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[13px] text-[#655C80]">{isPro ? (isMax ? "$49/mo Max" : "$19/mo Pro") : "Free"}</p>
            <h4 className="text-[#F0ECF9]">12 hours</h4>
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
                  ? "bg-[#E8A838] text-[#0D0B1A]"
                  : "bg-[#A855F7] text-[#F0ECF9]"
                : "bg-[#A855F7] text-[#0D0B1A]"
            }`}
          >
            {isPro ? (isMax ? "Upgrade to Max" : "Upgrade to Pro") : "Enroll Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
