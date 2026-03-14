import { useNavigate } from "react-router";
import { ArrowLeft, Flame, Clock, GraduationCap, Trophy } from "lucide-react";

export function ProfileScreen() {
  const navigate = useNavigate();

  const skills = [
    { label: "Networking", percentage: 72, color: "#A855F7" },
    { label: "Web Security", percentage: 65, color: "#60A5FA" },
    { label: "System Sec", percentage: 55, color: "#C084FC" },
    { label: "Social Eng", percentage: 48, color: "#E8A838" },
    { label: "Cryptography", percentage: 40, color: "#4ADE80" },
    { label: "Forensics", percentage: 30, color: "#F87171" },
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
    <div className="h-screen bg-[#0D0B1A] pb-24 max-w-[393px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <button onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={24} stroke="#F0ECF9" />
        </button>
      </div>

      {/* Profile section */}
      <div className="flex flex-col items-center px-6 mb-6">
        <div className="w-[88px] h-[88px] rounded-full border-2 border-[rgba(168,85,247,0.25)] bg-[rgba(168,85,247,0.1)] flex items-center justify-center mb-3">
          <span className="text-[40px] text-[#F0ECF9]">A</span>
        </div>
        <h2 className="text-[#F0ECF9] mb-1" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Alex Chen
        </h2>
        <p className="text-[13px] text-[#9B8FBB]">alex@example.com</p>
      </div>

      {/* Level + XP card */}
      <div className="mx-auto w-[80%] mb-5">
        <div className="p-4 rounded-2xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)]">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 rounded-full bg-[rgba(168,85,247,0.1)] text-[10px] font-bold text-[#A855F7] uppercase tracking-wider">
              Intermediate
            </span>
            <span className="text-[13px] text-[#655C80]">2,450 / 3,000 XP</span>
          </div>
          <div className="h-1.5 bg-[rgba(168,85,247,0.1)] rounded-full overflow-hidden">
            <div className="h-full bg-[#A855F7] rounded-full" style={{ width: "82%" }}></div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 px-6 mb-6">
        {[
          { icon: Flame, value: "12", label: "Day streak", color: "#E8A838" },
          { icon: Clock, value: "47h", label: "Learned", color: "#A855F7" },
          { icon: GraduationCap, value: "4", label: "Courses", color: "#C084FC" },
          { icon: Trophy, value: "3", label: "Badges", color: "#4ADE80" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-2xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] flex flex-col items-center"
            >
              <Icon size={22} stroke={stat.color} className="mb-2" />
              <div className="text-[18px] font-semibold text-[#F0ECF9] mb-0.5">{stat.value}</div>
              <div className="text-[11px] text-[#655C80] uppercase tracking-wider font-medium">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skill Breakdown */}
      <div className="mx-6 mb-6 p-5 rounded-2xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)]">
        <h3 className="text-[#F0ECF9] mb-4">Skill Breakdown</h3>
        <div className="space-y-2">
          {skills.map((skill, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-[100px] text-[13px] text-[#9B8FBB]">{skill.label}</div>
              <div className="flex-1 h-1.5 bg-[rgba(168,85,247,0.12)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${skill.percentage}%`,
                    backgroundColor: skill.color,
                  }}
                ></div>
              </div>
              <div className="w-8 text-[11px] text-[#655C80] text-right">{skill.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="mx-6 mb-6 p-5 rounded-2xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)]">
        <h3 className="text-[#F0ECF9] mb-4">Achievements</h3>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement, i) => (
            <div
              key={i}
              className="flex flex-col items-center"
              style={{ opacity: achievement.earned ? 1 : 0.35 }}
            >
              <div className="text-[28px] mb-1">{achievement.emoji}</div>
              <span className="text-[11px] text-[#9B8FBB] text-center leading-tight">
                {achievement.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
