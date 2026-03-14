import { useNavigate } from "react-router";
import { ArrowLeft, Lock, Mail } from "lucide-react";

export function ForgotPasswordScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center px-6 max-w-[393px] mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-12 left-6"
      >
        <ArrowLeft size={24} stroke="#EAEEFF" />
      </button>

      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-[rgba(0,229,255,0.08)] border border-[#00E5FF] flex items-center justify-center mx-auto mb-6">
          <Lock size={28} stroke="#00E5FF" />
        </div>

        {/* Header */}
        <h2 className="text-[#EAEEFF] text-center mb-2" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
          Reset Password
        </h2>
        <p className="text-[15px] text-[#8B95C9] text-center mb-8">
          Enter your email and we'll send a reset link
        </p>

        {/* Email input */}
        <div className="relative mb-6">
          <Mail className="absolute left-4 top-4 text-[#5A6599]" size={18} />
          <input
            type="email"
            placeholder="Email address"
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1E2545] border border-[#2A3362] text-[#EAEEFF] placeholder:text-[#5A6599] focus:outline-none focus:border-[#00E5FF] transition-colors"
          />
        </div>

        {/* Send button */}
        <button className="w-full py-4 rounded-xl bg-[#00E5FF] text-[#0A0E1A] font-semibold mb-4 active:scale-[0.97] transition-transform">
          Send Reset Link
        </button>

        {/* Back to login */}
        <button
          onClick={() => navigate("/")}
          className="w-full text-[15px] text-[#00E5FF] text-center"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
