import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, User, Mail, Lock, Shield, Eye, Bug, Terminal, FileText } from "lucide-react";

export function SignupScreen() {
  const navigate = useNavigate();
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [interests, setInterests] = useState<string[]>([]);

  const interestOptions = [
    { id: "foundations", icon: Shield, label: "Foundations", color: "#00E5FF" },
    { id: "blueteam", icon: Eye, label: "Blue Team", color: "#3B82F6" },
    { id: "redteam", icon: Bug, label: "Red Team", color: "#FF3B5C" },
    { id: "advancedops", icon: Terminal, label: "Advanced Ops", color: "#A855F7" },
    { id: "grc", icon: FileText, label: "GRC", color: "#FF9F1C" },
  ];

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] px-6 pt-12 pb-24 max-w-[393px] mx-auto overflow-y-auto">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="mb-8"
      >
        <ArrowLeft size={24} stroke="#EAEEFF" />
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[#EAEEFF] mb-2" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
          Create Account
        </h1>
        <p className="text-[15px] text-[#8B95C9]">
          Join thousands learning cybersecurity
        </p>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-6">
        {/* Full Name */}
        <div>
          <label className="text-[11px] text-[#8B95C9] uppercase tracking-wider font-medium block mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-4 text-[#5A6599]" size={18} />
            <input
              type="text"
              placeholder="Your name"
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1E2545] border border-[#2A3362] text-[#EAEEFF] placeholder:text-[#5A6599] focus:outline-none focus:border-[#00E5FF] transition-colors"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-[11px] text-[#8B95C9] uppercase tracking-wider font-medium block mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-[#5A6599]" size={18} />
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1E2545] border border-[#2A3362] text-[#EAEEFF] placeholder:text-[#5A6599] focus:outline-none focus:border-[#00E5FF] transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-[11px] text-[#8B95C9] uppercase tracking-wider font-medium block mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-[#5A6599]" size={18} />
            <input
              type="password"
              placeholder="Min 8 characters"
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1E2545] border border-[#2A3362] text-[#EAEEFF] placeholder:text-[#5A6599] focus:outline-none focus:border-[#00E5FF] transition-colors"
            />
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="text-[11px] text-[#8B95C9] uppercase tracking-wider font-medium block mb-2">
            Experience Level
          </label>
          <div className="flex gap-2">
            {["beginner", "intermediate", "advanced"].map((level) => (
              <button
                key={level}
                onClick={() => setExperienceLevel(level)}
                className={`flex-1 px-4 py-2 rounded-full border capitalize text-[13px] transition-colors ${
                  experienceLevel === level
                    ? "border-[#00E5FF] bg-[rgba(0,229,255,0.08)] text-[#00E5FF]"
                    : "border-[#2A3362] text-[#8B95C9]"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="text-[11px] text-[#8B95C9] uppercase tracking-wider font-medium block mb-2">
            Interests (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = interests.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => toggleInterest(option.id)}
                  className="px-4 py-2 rounded-full border text-[13px] flex items-center gap-2 transition-colors"
                  style={{
                    borderColor: isSelected ? option.color : "#2A3362",
                    backgroundColor: isSelected ? `${option.color}14` : "transparent",
                    color: isSelected ? option.color : "#8B95C9",
                  }}
                >
                  <Icon size={14} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Create Account Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-4 rounded-xl bg-[#00E5FF] text-[#0A0E1A] font-semibold mt-4 active:scale-[0.97] transition-transform"
        >
          Create Account
        </button>

        {/* Terms */}
        <p className="text-[13px] text-[#5A6599] text-center leading-relaxed">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
