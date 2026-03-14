import { useState } from "react";
import { useNavigate } from "react-router";
import { ShieldCheck, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function LoginScreen() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithApple } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    await loginWithGoogle();
    navigate("/dashboard");
    setLoading(false);
  };

  const handleApple = async () => {
    setLoading(true);
    await loginWithApple();
    navigate("/dashboard");
    setLoading(false);
  };

  return (
    <div className="h-screen bg-[#0A0E1A] flex flex-col items-center justify-center px-6 max-w-[393px] mx-auto relative overflow-hidden">
      {/* Matrix rain accent lines */}
      <div className="absolute top-0 left-[10%] w-[1.5px] h-[300px] bg-[#00E5FF] opacity-[0.03]"></div>
      <div className="absolute top-0 left-[30%] w-[1.5px] h-[300px] bg-[#00E5FF] opacity-[0.05]"></div>
      <div className="absolute top-0 left-[50%] w-[1.5px] h-[300px] bg-[#00E5FF] opacity-[0.07]"></div>
      <div className="absolute top-0 left-[70%] w-[1.5px] h-[300px] bg-[#00E5FF] opacity-[0.04]"></div>
      <div className="absolute top-0 left-[90%] w-[1.5px] h-[300px] bg-[#00E5FF] opacity-[0.06]"></div>

      <div className="w-full max-w-sm z-10">
        {/* Logo section */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-[72px] h-[72px] rounded-[20px] border-2 border-[#00E5FF] bg-[rgba(0,229,255,0.08)] flex items-center justify-center mb-6">
            <ShieldCheck size={36} stroke="#00E5FF" />
          </div>
          <h1 className="text-[32px] font-bold text-[#EAEEFF] mb-2" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
            CyberScout
          </h1>
          <p className="text-[13px] text-[#8B95C9] text-center">
            Your cybersecurity learning journey starts here
          </p>
        </div>

        {/* Form section */}
        <div className="flex flex-col gap-3">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-[rgba(255,59,92,0.08)] border border-[rgba(255,59,92,0.25)] text-[13px] text-[#FF3B5C]">
              {error}
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-4 text-[#5A6599]" size={18} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1E2545] border border-[#2A3362] text-[#EAEEFF] placeholder:text-[#5A6599] focus:outline-none focus:border-[#00E5FF] transition-colors"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 text-[#5A6599]" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full pl-12 pr-12 py-4 rounded-xl bg-[#1E2545] border border-[#2A3362] text-[#EAEEFF] placeholder:text-[#5A6599] focus:outline-none focus:border-[#00E5FF] transition-colors"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-[#5A6599]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            onClick={() => navigate("/forgot-password")}
            className="text-[13px] text-[#00E5FF] self-end"
          >
            Forgot password?
          </button>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-[#00E5FF] text-[#0A0E1A] font-semibold mt-2 active:scale-[0.97] transition-transform disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-[#2A3362]"></div>
            <span className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium">OR</span>
            <div className="flex-1 h-px bg-[#2A3362]"></div>
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-3 rounded-xl border border-[#2A3362] bg-transparent text-[#EAEEFF] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
              <path fill="#8B95C9" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#8B95C9" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#8B95C9" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#8B95C9" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            onClick={handleApple}
            disabled={loading}
            className="w-full py-3 rounded-xl border border-[#2A3362] bg-transparent text-[#EAEEFF] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
              <path fill="#8B95C9" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span>Continue with Apple</span>
          </button>
        </div>

        <div className="text-center mt-8">
          <span className="text-[15px] text-[#8B95C9]">Don't have an account? </span>
          <button
            onClick={() => navigate("/signup")}
            className="text-[15px] text-[#00E5FF] font-semibold"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
