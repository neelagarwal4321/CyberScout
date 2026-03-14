import { useNavigate } from "react-router";
import { Bell, Flame, PlayCircle, ChevronRight, Sparkles, Bug, Eye, Shield, Users, MessageCircle, Library, Trophy, User as UserIcon } from "lucide-react";
import { TabBar } from "../components/TabBar";

export function DashboardScreen() {
  const navigate = useNavigate();

  const weekActivity = [
    { day: "M", value: 3, max: 6 },
    { day: "T", value: 5, max: 6 },
    { day: "W", value: 2, max: 6 },
    { day: "T", value: 4, max: 6 },
    { day: "F", value: 6, max: 6 },
    { day: "S", value: 1, max: 6 },
    { day: "S", value: 3, max: 6 },
  ];

  return (
    <div className="h-screen bg-[#0D0B1A] pb-[100px] max-w-[393px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-start justify-between">
        <div>
          <p className="text-[13px] text-[#9B8FBB] mb-1">Good evening,</p>
          <h2 className="text-[#F0ECF9]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Alex Chen
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {/* Streak badge */}
          <div className="px-3 py-1 rounded-full bg-[rgba(232,168,56,0.08)] border border-[rgba(232,168,56,0.25)] flex items-center gap-1.5">
            <Flame size={14} fill="#E8A838" stroke="#E8A838" />
            <span className="text-[10px] font-bold text-[#E8A838] uppercase tracking-wider">12</span>
          </div>
          {/* Notification bell */}
          <button onClick={() => navigate("/notifications")} className="relative">
            <Bell size={24} stroke="#9B8FBB" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-[#F87171] rounded-full"></div>
          </button>
        </div>
      </div>

      {/* Progress Overview Card */}
      <div className="mx-6 mb-8 p-5 rounded-2xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] flex items-center gap-5">
        {/* Circular progress */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="transform -rotate-90" width="80" height="80">
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="rgba(168,85,247,0.12)"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="#A855F7"
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 34 * 0.38} ${2 * Math.PI * 34}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[18px] font-semibold text-[#A855F7]">
            38%
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-[18px] font-semibold text-[#F0ECF9]">4</div>
            <div className="text-[11px] text-[#655C80] uppercase tracking-wider font-medium">Enrolled</div>
          </div>
          <div className="text-center">
            <div className="text-[18px] font-semibold text-[#4ADE80]">1</div>
            <div className="text-[11px] text-[#655C80] uppercase tracking-wider font-medium">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-[18px] font-semibold text-[#F0ECF9]">47h</div>
            <div className="text-[11px] text-[#655C80] uppercase tracking-wider font-medium">Learned</div>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="mb-8">
        <h3 className="px-6 mb-4 text-[#F0ECF9]">Continue Learning</h3>
        <button
          onClick={() => navigate("/course/web-security")}
          className="mx-6 p-4 rounded-2xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] flex items-center gap-4 w-[calc(100%-48px)] active:bg-[rgba(40,30,72,0.7)] transition-colors"
        >
          <div className="w-14 h-14 rounded-xl bg-[rgba(168,85,247,0.1)] flex items-center justify-center flex-shrink-0">
            <PlayCircle size={32} stroke="#A855F7" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-[11px] text-[#A855F7] uppercase tracking-wider font-medium mb-1">Module 3: Cross-Site Scripting</div>
            <h4 className="text-[#F0ECF9] mb-1 truncate">Stored XSS Deep Dive</h4>
            <p className="text-[13px] text-[#9B8FBB] mb-2">Web Application Security</p>
            <div className="w-full h-1 bg-[rgba(168,85,247,0.12)] rounded-full overflow-hidden">
              <div className="h-full bg-[#A855F7] rounded-full" style={{ width: "62%" }}></div>
            </div>
          </div>
          <ChevronRight size={20} stroke="#655C80" className="flex-shrink-0" />
        </button>
      </div>

      {/* Recommended For You */}
      <div className="mb-8">
        <div className="px-6 mb-4 flex items-center gap-2">
          <Sparkles size={16} stroke="#A855F7" />
          <h3 className="text-[#F0ECF9]">Recommended For You</h3>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { icon: Bug, color: "#F87171", title: "SQL Injection Masterclass", reason: "Builds on your web security progress" },
            { icon: Eye, color: "#60A5FA", title: "Network Traffic Analysis", reason: "Strengthen your networking fundamentals" },
            { icon: Shield, color: "#A855F7", title: "Intro to Cryptography", reason: "Your weakest area — great time to start" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => navigate("/courses")}
                className="mx-6 p-4 rounded-2xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] flex items-center gap-3 active:bg-[rgba(40,30,72,0.7)] transition-colors"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}14` }}>
                  <Icon size={20} stroke={item.color} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h4 className="text-[#F0ECF9] mb-0.5">{item.title}</h4>
                  <p className="text-[13px] text-[#9B8FBB]">{item.reason}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-[rgba(168,85,247,0.12)] flex items-center justify-center flex-shrink-0">
                  <ChevronRight size={16} stroke="#A855F7" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Live Sessions */}
      <div className="mb-8">
        <h3 className="px-6 mb-4 text-[#F0ECF9]">Upcoming Live Sessions</h3>
        <div className="flex gap-3 px-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { title: "Incident Response Workshop", instructor: "Sarah Kim", enrolled: "156" },
            { title: "Red Team Operations Q&A", instructor: "Marcus Rivera", enrolled: "89" },
          ].map((session, i) => (
            <div key={i} className="w-[200px] p-4 rounded-2xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] flex-shrink-0">
              <div className="px-2 py-0.5 rounded-full bg-[rgba(248,113,113,0.12)] inline-flex items-center gap-1 mb-3">
                <div className="w-1.5 h-1.5 bg-[#F87171] rounded-full"></div>
                <span className="text-[10px] font-bold text-[#F87171] uppercase tracking-wider">LIVE</span>
              </div>
              <h4 className="text-[#F0ECF9] mb-1 line-clamp-2 min-h-[48px]">{session.title}</h4>
              <p className="text-[13px] text-[#9B8FBB] mb-3">{session.instructor}</p>
              <div className="flex items-center gap-1.5">
                <Users size={14} stroke="#655C80" />
                <span className="text-[11px] text-[#655C80]">{session.enrolled} enrolled</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* This Week Activity */}
      <div className="mb-8">
        <h3 className="px-6 mb-4 text-[#F0ECF9]">This Week</h3>
        <div className="mx-6 p-5 rounded-2xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)]">
          <div className="flex items-end justify-between h-20">
            {weekActivity.map((day, i) => {
              const height = (day.value / day.max) * 60;
              const isToday = i === 4; // Friday
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className="w-4 rounded"
                    style={{
                      height: `${height}px`,
                      backgroundColor: isToday ? "#A855F7" : "rgba(168,85,247,0.25)",
                    }}
                  ></div>
                  <span className="text-[11px] text-[#655C80] uppercase font-medium">{day.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: MessageCircle, label: "Ask AI", color: "#A855F7", path: "/chat" },
            { icon: Library, label: "Courses", color: "#A855F7", path: "/courses" },
            { icon: Trophy, label: "Certs", color: "#E8A838", path: "/certificates" },
            { icon: UserIcon, label: "Profile", color: "#4ADE80", path: "/profile" },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] active:bg-[rgba(40,30,72,0.7)] transition-colors"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: `${action.color}14` }}>
                  <Icon size={22} stroke={action.color} />
                </div>
                <span className="text-[11px] text-[#9B8FBB] uppercase font-medium tracking-wide mt-1">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <TabBar />
    </div>
  );
}
