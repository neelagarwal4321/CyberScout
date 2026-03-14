import { useNavigate } from "react-router";
import { ArrowLeft, Flame, Clock, GraduationCap, Trophy } from "lucide-react";

export function ProfileScreen() {
  const navigate = useNavigate();

  const skills = [
    { label: "Networking", percentage: 72, color: "#00E5FF" },
    { label: "Web Security", percentage: 65, color: "#3B82F6" },
    { label: "System Sec", percentage: 55, color: "#A855F7" },
    { label: "Social Eng", percentage: 48, color: "#FF9F1C" },
    { label: "Cryptography", percentage: 40, color: "#39FF14" },
    { label: "Forensics", percentage: 30, color: "#FF3B5C" },
  ];

  const achievements = [
    { emoji: "🔐", label: "First Login", earned: true },
    { emoji: "🔥", label: "7-Day Streak", earned: true },
    { emoji: "🎓", label: "First Course Complete", earned: true },
    { emoji: "💉", label: "SQL Injection Master", earned: false },
    { emoji: "⚡", label: "30-Day Streak", earned: false },
    { emoji: "🏴‍☠️", label: "Red Team Certified", earned: false },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-24 max-w-[393px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <button onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={24} stroke="#EAEEFF" />
        </button>
      </div>

      {/* Profile section */}
      <div className="flex flex-col items-center px-6 mb-6">
        <div className="w-[88px] h-[88px] rounded-full border-2 border-[rgba(0,229,255,0.25)] bg-[rgba(0,229,255,0.08)] flex items-center justify-center mb-3">
          <span className="text-[40px] text-[#EAEEFF]">A</span>
        </div>
        <h2 className="text-[#EAEEFF] mb-1" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
          Alex Chen
        </h2>
        <p className="text-[13px] text-[#8B95C9]">alex@example.com</p>
      </div>

      {/* Level + XP card */}
      <div className="mx-auto w-[80%] mb-5">
        <div className="p-4 rounded-2xl bg-[#1E2545] border border-[#2A3362]">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 rounded-full bg-[rgba(0,229,255,0.08)] text-[10px] font-bold text-[#00E5FF] uppercase tracking-wider">
              Intermediate
            </span>
            <span className="text-[13px] text-[#5A6599]">2,450 / 3,000 XP</span>
          </div>
          <div className="h-1.5 bg-[rgba(0,229,255,0.08)] rounded-full overflow-hidden">
            <div className="h-full bg-[#00E5FF] rounded-full" style={{ width: "82%" }}></div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 px-6 mb-6">
        {[
          { icon: Flame, value: "12", label: "Day streak", color: "#FF9F1C" },
          { icon: Clock, value: "47h", label: "Learned", color: "#00E5FF" },
          { icon: GraduationCap, value: "4", label: "Courses", color: "#A855F7" },
          { icon: Trophy, value: "3", label: "Badges", color: "#39FF14" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-2xl bg-[#1E2545] border border-[#2A3362] flex flex-col items-center"
            >
              <Icon size={22} stroke={stat.color} className="mb-2" />
              <div className="text-[18px] font-semibold text-[#EAEEFF] mb-0.5">{stat.value}</div>
              <div className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skill Breakdown */}
      <div className="mx-6 mb-6 p-5 rounded-2xl bg-[#1E2545] border border-[#2A3362]">
        <h3 className="text-[#EAEEFF] mb-4">Skill Breakdown</h3>
        <div className="space-y-2">
          {skills.map((skill, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-[100px] text-[13px] text-[#8B95C9]">{skill.label}</div>
              <div className="flex-1 h-1.5 bg-[rgba(0,229,255,0.12)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${skill.percentage}%`,
                    backgroundColor: skill.color,
                  }}
                ></div>
              </div>
              <div className="w-8 text-[11px] text-[#5A6599] text-right">{skill.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="mx-6 mb-6 p-5 rounded-2xl bg-[#1E2545] border border-[#2A3362]">
        <h3 className="text-[#EAEEFF] mb-4">Achievements</h3>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement, i) => (
            <div
              key={i}
              className="flex flex-col items-center"
              style={{ opacity: achievement.earned ? 1 : 0.35 }}
            >
              <div className="text-[28px] mb-1">{achievement.emoji}</div>
              <span className="text-[11px] text-[#8B95C9] text-center leading-tight">
                {achievement.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
