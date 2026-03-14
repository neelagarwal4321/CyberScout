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
    <div className="h-screen bg-[#0A0E1A] pb-[100px] max-w-[393px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-start justify-between">
        <div>
          <p className="text-[13px] text-[#8B95C9] mb-1">Good evening,</p>
          <h2 className="text-[#EAEEFF]" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
            Alex Chen
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {/* Streak badge */}
          <div className="px-3 py-1 rounded-full bg-[rgba(255,159,28,0.08)] border border-[rgba(255,159,28,0.25)] flex items-center gap-1.5">
            <Flame size={14} fill="#FF9F1C" stroke="#FF9F1C" />
            <span className="text-[10px] font-bold text-[#FF9F1C] uppercase tracking-wider">12</span>
          </div>
          {/* Notification bell */}
          <button onClick={() => navigate("/notifications")} className="relative">
            <Bell size={24} stroke="#8B95C9" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-[#FF3B5C] rounded-full"></div>
          </button>
        </div>
      </div>

      {/* Progress Overview Card */}
      <div className="mx-6 mb-8 p-5 rounded-2xl bg-[#1E2545] border border-[#2A3362] flex items-center gap-5">
        {/* Circular progress */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="transform -rotate-90" width="80" height="80">
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="rgba(0,229,255,0.12)"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="#00E5FF"
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 34 * 0.38} ${2 * Math.PI * 34}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[18px] font-semibold text-[#00E5FF]">
            38%
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-[18px] font-semibold text-[#EAEEFF]">4</div>
            <div className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium">Enrolled</div>
          </div>
          <div className="text-center">
            <div className="text-[18px] font-semibold text-[#39FF14]">1</div>
            <div className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-[18px] font-semibold text-[#EAEEFF]">47h</div>
            <div className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium">Learned</div>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="mb-8">
        <h3 className="px-6 mb-4 text-[#EAEEFF]">Continue Learning</h3>
        <button
          onClick={() => navigate("/course/web-security")}
          className="mx-6 p-4 rounded-2xl bg-[#1E2545] border border-[#2A3362] flex items-center gap-4 w-[calc(100%-48px)] active:bg-[#252D55] transition-colors"
        >
          <div className="w-14 h-14 rounded-xl bg-[#1A2038] flex items-center justify-center flex-shrink-0">
            <PlayCircle size={32} stroke="#00E5FF" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-[11px] text-[#00E5FF] uppercase tracking-wider font-medium mb-1">Module 3: Cross-Site Scripting</div>
            <h4 className="text-[#EAEEFF] mb-1 truncate">Stored XSS Deep Dive</h4>
            <p className="text-[13px] text-[#8B95C9] mb-2">Web Application Security</p>
            <div className="w-full h-1 bg-[rgba(0,229,255,0.12)] rounded-full overflow-hidden">
              <div className="h-full bg-[#00E5FF] rounded-full" style={{ width: "62%" }}></div>
            </div>
          </div>
          <ChevronRight size={20} stroke="#5A6599" className="flex-shrink-0" />
        </button>
      </div>

      {/* Recommended For You */}
      <div className="mb-8">
        <div className="px-6 mb-4 flex items-center gap-2">
          <Sparkles size={16} stroke="#A855F7" />
          <h3 className="text-[#EAEEFF]">Recommended For You</h3>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { icon: Bug, color: "#FF3B5C", title: "SQL Injection Masterclass", reason: "Builds on your web security progress" },
            { icon: Eye, color: "#3B82F6", title: "Network Traffic Analysis", reason: "Strengthen your networking fundamentals" },
            { icon: Shield, color: "#00E5FF", title: "Intro to Cryptography", reason: "Your weakest area — great time to start" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => navigate("/courses")}
                className="mx-6 p-4 rounded-2xl bg-[#1E2545] border border-[#2A3362] flex items-center gap-3 active:bg-[#252D55] transition-colors"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}14` }}>
                  <Icon size={20} stroke={item.color} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h4 className="text-[#EAEEFF] mb-0.5">{item.title}</h4>
                  <p className="text-[13px] text-[#8B95C9]">{item.reason}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-[rgba(0,229,255,0.12)] flex items-center justify-center flex-shrink-0">
                  <ChevronRight size={16} stroke="#00E5FF" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Live Sessions */}
      <div className="mb-8">
        <h3 className="px-6 mb-4 text-[#EAEEFF]">Upcoming Live Sessions</h3>
        <div className="flex gap-3 px-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { title: "Incident Response Workshop", instructor: "Sarah Kim", enrolled: "156" },
            { title: "Red Team Operations Q&A", instructor: "Marcus Rivera", enrolled: "89" },
          ].map((session, i) => (
            <div key={i} className="w-[200px] p-4 rounded-2xl bg-[#1E2545] border border-[#2A3362] flex-shrink-0">
              <div className="px-2 py-0.5 rounded-full bg-[rgba(255,59,92,0.12)] inline-flex items-center gap-1 mb-3">
                <div className="w-1.5 h-1.5 bg-[#FF3B5C] rounded-full"></div>
                <span className="text-[10px] font-bold text-[#FF3B5C] uppercase tracking-wider">LIVE</span>
              </div>
              <h4 className="text-[#EAEEFF] mb-1 line-clamp-2 min-h-[48px]">{session.title}</h4>
              <p className="text-[13px] text-[#8B95C9] mb-3">{session.instructor}</p>
              <div className="flex items-center gap-1.5">
                <Users size={14} stroke="#5A6599" />
                <span className="text-[11px] text-[#5A6599]">{session.enrolled} enrolled</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* This Week Activity */}
      <div className="mb-8">
        <h3 className="px-6 mb-4 text-[#EAEEFF]">This Week</h3>
        <div className="mx-6 p-5 rounded-2xl bg-[#1E2545] border border-[#2A3362]">
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
                      backgroundColor: isToday ? "#00E5FF" : "rgba(0,229,255,0.25)",
                    }}
                  ></div>
                  <span className="text-[11px] text-[#5A6599] uppercase font-medium">{day.day}</span>
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
            { icon: MessageCircle, label: "Ask AI", color: "#00E5FF", path: "/chat" },
            { icon: Library, label: "Courses", color: "#A855F7", path: "/courses" },
            { icon: Trophy, label: "Certs", color: "#FF9F1C", path: "/certificates" },
            { icon: UserIcon, label: "Profile", color: "#39FF14", path: "/profile" },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-[#1E2545] border border-[#2A3362] active:bg-[#252D55] transition-colors"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: `${action.color}14` }}>
                  <Icon size={22} stroke={action.color} />
                </div>
                <span className="text-[11px] text-[#8B95C9] uppercase font-medium tracking-wide mt-1">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <TabBar />
    </div>
  );
}
