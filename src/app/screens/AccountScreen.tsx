import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Mail, Key, Fingerprint, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AccountScreen() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [section, setSection] = useState<"main" | "email" | "password" | "2fa">("main");
  const [newEmail, setNewEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveEmail = () => {
    updateUser({ email: newEmail });
    setSaved(true);
    setTimeout(() => { setSaved(false); setSection("main"); }, 1500);
  };

  const handleSavePassword = () => {
    if (!currentPassword || !newPassword) return;
    setSaved(true);
    setTimeout(() => { setSaved(false); setCurrentPassword(""); setNewPassword(""); setSection("main"); }, 1500);
  };

  const SettingRow = ({ icon: Icon, label, value, onClick }: any) => (
    <button
      onClick={onClick}
      className="w-full px-4 py-4 border-b border-[#2A3362] flex items-center gap-3 active:bg-[#252D55] transition-colors last:border-b-0"
    >
      <div className="w-9 h-9 rounded-lg bg-[rgba(0,229,255,0.08)] flex items-center justify-center">
        <Icon size={18} stroke="#00E5FF" />
      </div>
      <span className="flex-1 text-left text-[15px] text-[#EAEEFF]">{label}</span>
      {value && <span className="text-[13px] text-[#5A6599]">{value}</span>}
      <span className="text-[#5A6599] text-[18px]">›</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0A0E1A] max-w-[393px] mx-auto overflow-y-auto pb-12">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 border-b border-[#2A3362]">
        <button onClick={() => section === "main" ? navigate("/settings") : setSection("main")} className="mb-4">
          <ArrowLeft size={24} stroke="#EAEEFF" />
        </button>
        <h2 className="text-[#EAEEFF]" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
          {section === "main" ? "Account" : section === "email" ? "Change Email" : section === "password" ? "Change Password" : "Two-Factor Auth"}
        </h2>
      </div>

      {section === "main" && (
        <div className="px-6 py-6">
          <div className="rounded-2xl bg-[#1E2545] border border-[#2A3362] overflow-hidden">
            <SettingRow
              icon={Mail}
              label="Change Email"
              value={user?.email}
              onClick={() => setSection("email")}
            />
            <SettingRow
              icon={Key}
              label="Change Password"
              value="••••••••"
              onClick={() => setSection("password")}
            />
            <SettingRow
              icon={Fingerprint}
              label="Two-Factor Auth"
              value="Off"
              onClick={() => setSection("2fa")}
            />
          </div>
        </div>
      )}

      {section === "email" && (
        <div className="px-6 py-6 space-y-4">
          <p className="text-[13px] text-[#8B95C9]">Enter your new email address.</p>
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-[#5A6599]" size={18} />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1E2545] border border-[#2A3362] text-[#EAEEFF] focus:outline-none focus:border-[#00E5FF] transition-colors"
            />
          </div>
          {saved ? (
            <div className="flex items-center gap-2 justify-center py-3">
              <CheckCircle size={18} stroke="#39FF14" />
              <span className="text-[#39FF14] text-[15px]">Email updated!</span>
            </div>
          ) : (
            <button
              onClick={handleSaveEmail}
              className="w-full py-4 rounded-xl bg-[#00E5FF] text-[#0A0E1A] font-semibold active:scale-[0.97] transition-transform"
            >
              Save Email
            </button>
          )}
        </div>
      )}

      {section === "password" && (
        <div className="px-6 py-6 space-y-4">
          <p className="text-[13px] text-[#8B95C9]">Enter your current password, then your new one.</p>
          <div className="relative">
            <Key className="absolute left-4 top-4 text-[#5A6599]" size={18} />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-4 rounded-xl bg-[#1E2545] border border-[#2A3362] text-[#EAEEFF] placeholder:text-[#5A6599] focus:outline-none focus:border-[#00E5FF] transition-colors"
            />
            <button onClick={() => setShowPass((p) => !p)} className="absolute right-4 top-4 text-[#5A6599]">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="relative">
            <Key className="absolute left-4 top-4 text-[#5A6599]" size={18} />
            <input
              type={showPass ? "text" : "password"}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1E2545] border border-[#2A3362] text-[#EAEEFF] placeholder:text-[#5A6599] focus:outline-none focus:border-[#00E5FF] transition-colors"
            />
          </div>
          {newPassword && (
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-1 rounded-full"
                  style={{
                    backgroundColor:
                      newPassword.length >= i * 3
                        ? i <= 2 ? "#FF3B5C" : i === 3 ? "#FF9F1C" : "#39FF14"
                        : "#2A3362",
                  }}
                />
              ))}
            </div>
          )}
          {saved ? (
            <div className="flex items-center gap-2 justify-center py-3">
              <CheckCircle size={18} stroke="#39FF14" />
              <span className="text-[#39FF14] text-[15px]">Password updated!</span>
            </div>
          ) : (
            <button
              onClick={handleSavePassword}
              disabled={!currentPassword || !newPassword}
              className="w-full py-4 rounded-xl bg-[#00E5FF] text-[#0A0E1A] font-semibold active:scale-[0.97] transition-transform disabled:opacity-40"
            >
              Update Password
            </button>
          )}
        </div>
      )}

      {section === "2fa" && (
        <div className="px-6 py-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.25)] flex items-center justify-center mb-4">
            <Fingerprint size={32} stroke="#00E5FF" />
          </div>
          <h3 className="text-[#EAEEFF] mb-2">Two-Factor Authentication</h3>
          <p className="text-[13px] text-[#8B95C9] mb-6 max-w-[280px] leading-relaxed">
            Add an extra layer of security to your account. We'll send a code to your device each time you sign in.
          </p>
          <button className="w-full py-4 rounded-xl bg-[#00E5FF] text-[#0A0E1A] font-semibold active:scale-[0.97] transition-transform">
            Enable 2FA
          </button>
        </div>
      )}
    </div>
  );
}
