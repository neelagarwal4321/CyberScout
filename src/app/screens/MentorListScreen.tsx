import { useNavigate } from "react-router";
import { ArrowLeft, Lock, Star, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function MentorListScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMaxTier = user?.tier === "max";

  const mentors = [
    {
      name: "Sarah Kim",
      rating: "4.9",
      sessions: "234",
      tags: ["Incident Response", "SIEM", "Threat Hunting"],
      available: true,
    },
    {
      name: "Marcus Rivera",
      rating: "4.8",
      sessions: "189",
      tags: ["Penetration Testing", "Web Security", "Red Team"],
      available: true,
    },
    {
      name: "Dr. James Okonkwo",
      rating: "5.0",
      sessions: "156",
      tags: ["Malware Analysis", "Reverse Engineering", "Forensics"],
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E1A] max-w-[393px] mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 border-b border-[#2A3362]">
        <button onClick={() => navigate("/dashboard")} className="mb-4">
          <ArrowLeft size={24} stroke="#EAEEFF" />
        </button>
        <h1 className="text-[#EAEEFF]" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
          Mentors
        </h1>
      </div>

      {!isMaxTier ? (
        /* Feature Gate */
        <div className="flex flex-col items-center justify-center px-6 py-16">
          <div className="w-[60px] h-[60px] rounded-full bg-[rgba(255,215,0,0.08)] flex items-center justify-center mb-6">
            <Lock size={28} stroke="#FFD700" />
          </div>
          <h4 className="text-[#EAEEFF] mb-3 text-center">MAX Feature</h4>
          <p className="text-[13px] text-[#8B95C9] text-center mb-8 max-w-[280px] leading-relaxed">
            Upgrade to MAX to unlock this feature and accelerate your learning.
          </p>
          <button
            onClick={() => navigate("/subscription")}
            className="px-8 py-3 rounded-xl bg-[#FFD700] text-[#0A0E1A] font-semibold active:scale-[0.97] transition-transform"
          >
            Upgrade to MAX
          </button>
        </div>
      ) : (
        /* Mentor List */
        <div className="px-6 py-6 space-y-4">
          {mentors.map((mentor, i) => (
            <div
              key={i}
              onClick={() => navigate("/booking")}
            className="p-4 rounded-2xl bg-[#1E2545] border border-[#2A3362] cursor-pointer active:bg-[#252D55] transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[#1A2038] flex items-center justify-center flex-shrink-0">
                  <User size={20} stroke="#5A6599" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[#EAEEFF] mb-1">{mentor.name}</h4>
                  <div className="flex items-center gap-3 text-[13px]">
                    <div className="flex items-center gap-1">
                      <Star size={12} fill="#FF9F1C" stroke="#FF9F1C" />
                      <span className="text-[#EAEEFF]">{mentor.rating}</span>
                    </div>
                    <span className="text-[#5A6599]">{mentor.sessions} sessions</span>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded text-[11px] font-medium ${
                    mentor.available
                      ? "bg-[rgba(57,255,20,0.08)] text-[#39FF14]"
                      : "bg-[rgba(255,59,92,0.08)] text-[#FF3B5C]"
                  }`}
                >
                  {mentor.available ? "Available" : "Unavailable"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {mentor.tags.map((tag, j) => (
                  <span
                    key={j}
                    className="px-2 py-1 rounded-full bg-[#1A2038] border border-[#2A3362] text-[11px] text-[#8B95C9]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
