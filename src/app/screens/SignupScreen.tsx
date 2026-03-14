import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, User, Mail, Lock, Shield, Eye, Bug, Terminal, FileText } from "lucide-react";

export function SignupScreen() {
  const navigate = useNavigate();
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [interests, setInterests] = useState<string[]>([]);

  const interestOptions = [
    { id: "foundations", icon: Shield, label: "Foundations", color: "#A855F7" },
    { id: "blueteam", icon: Eye, label: "Blue Team", color: "#60A5FA" },
    { id: "redteam", icon: Bug, label: "Red Team", color: "#F87171" },
    { id: "advancedops", icon: Terminal, label: "Advanced Ops", color: "#C084FC" },
    { id: "grc", icon: FileText, label: "GRC", color: "#FBBF24" },
  ];

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-screen bg-[#0D0B1A] px-6 pt-12 pb-24 max-w-[393px] mx-auto overflow-y-auto">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="mb-8"
      >
        <ArrowLeft size={24} stroke="#F0ECF9" />
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[#F0ECF9] mb-2" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Create Account
        </h1>
        <p className="text-[15px] text-[#9B8FBB]">
          Join thousands learning cybersecurity
        </p>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-6">
        {/* Full Name */}
        <div>
          <label className="text-[11px] text-[#9B8FBB] uppercase tracking-wider font-medium block mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-4 text-[#655C80]" size={18} />
            <input
              type="text"
              placeholder="Your name"
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] text-[#F0ECF9] placeholder:text-[#655C80] focus:outline-none focus:border-[#A855F7] transition-colors"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-[11px] text-[#9B8FBB] uppercase tracking-wider font-medium block mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-[#655C80]" size={18} />
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] text-[#F0ECF9] placeholder:text-[#655C80] focus:outline-none focus:border-[#A855F7] transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-[11px] text-[#9B8FBB] uppercase tracking-wider font-medium block mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-[#655C80]" size={18} />
            <input
              type="password"
              placeholder="Min 8 characters"
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] text-[#F0ECF9] placeholder:text-[#655C80] focus:outline-none focus:border-[#A855F7] transition-colors"
            />
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="text-[11px] text-[#9B8FBB] uppercase tracking-wider font-medium block mb-2">
            Experience Level
          </label>
          <div className="flex gap-2">
            {["beginner", "intermediate", "advanced"].map((level) => (
              <button
                key={level}
                onClick={() => setExperienceLevel(level)}
                className={`flex-1 px-4 py-2 rounded-full border capitalize text-[13px] transition-colors ${
                  experienceLevel === level
                    ? "border-[#A855F7] bg-[rgba(168,85,247,0.1)] text-[#A855F7]"
                    : "border-[rgba(80,60,140,0.3)] text-[#9B8FBB]"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="text-[11px] text-[#9B8FBB] uppercase tracking-wider font-medium block mb-2">
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
                    borderColor: isSelected ? option.color : "rgba(80,60,140,0.3)",
                    backgroundColor: isSelected ? `${option.color}14` : "transparent",
                    color: isSelected ? option.color : "#9B8FBB",
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
          className="w-full py-4 rounded-xl bg-[#A855F7] text-[#0D0B1A] font-semibold mt-4 active:scale-[0.97] transition-transform"
        >
          Create Account
        </button>

        {/* Terms */}
        <p className="text-[13px] text-[#655C80] text-center leading-relaxed">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
