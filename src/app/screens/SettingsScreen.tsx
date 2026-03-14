import { useNavigate } from "react-router";
import {
  ChevronRight,
  Diamond,
  Receipt,
  Moon,
  Type,
  Flag,
  Bell,
  Globe,
  Mail,
  Key,
  Fingerprint,
  Download,
  LogOut,
  Trash2,
} from "lucide-react";
import { TabBar } from "../components/TabBar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export function SettingsScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const tierLabel = user?.tier === "max" ? "Max" : user?.tier === "pro" ? "Pro" : "Free";
  const tierColor =
    user?.tier === "max" ? "#FFD700" : user?.tier === "pro" ? "#00E5FF" : "#8B95C9";

  const SettingRow = ({ icon: Icon, label, value, onClick, iconBg, danger }: any) => (
    <button
      onClick={onClick}
      className="w-full px-4 py-4 border-b border-[#2A3362] flex items-center gap-3 active:bg-[#1E2545] transition-colors last:border-b-0"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: iconBg || "rgba(0,229,255,0.08)" }}
      >
        <Icon size={18} stroke={danger ? "#FF3B5C" : "#00E5FF"} />
      </div>
      <span className={`flex-1 text-left text-[15px] ${danger ? "text-[#FF3B5C]" : "text-[#EAEEFF]"}`}>
        {label}
      </span>
      {value && <span className="text-[13px] text-[#5A6599]">{value}</span>}
      <ChevronRight size={20} stroke="#5A6599" />
    </button>
  );

  const SettingRowToggle = ({ icon: Icon, label }: any) => (
    <div className="px-4 py-4 border-b border-[#2A3362] flex items-center gap-3 last:border-b-0">
      <div className="w-9 h-9 rounded-lg bg-[rgba(0,229,255,0.08)] flex items-center justify-center">
        <Icon size={18} stroke="#00E5FF" />
      </div>
      <span className="flex-1 text-left text-[15px] text-[#EAEEFF]">{label}</span>
      <button
        onClick={toggleTheme}
        className="relative w-12 h-7 rounded-full transition-colors"
        style={{ backgroundColor: isDark ? "rgba(0,229,255,0.25)" : "#2A3362" }}
      >
        <div
          className="absolute top-1 w-5 h-5 rounded-full transition-all"
          style={{
            left: isDark ? "calc(100% - 24px)" : "4px",
            backgroundColor: isDark ? "#00E5FF" : "#5A6599",
          }}
        />
      </button>
    </div>
  );

  return (
    <div className="h-screen bg-[#0A0E1A] pb-[100px] max-w-[393px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-[#EAEEFF]" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
          Settings
        </h1>
      </div>

      {/* Profile card */}
      <button
        onClick={() => navigate("/profile")}
        className="mx-6 mb-6 p-4 rounded-2xl bg-[#1E2545] border border-[#2A3362] flex items-center gap-3 w-[calc(100%-48px)] active:bg-[#252D55] transition-colors"
      >
        <div className="w-14 h-14 rounded-full bg-[rgba(0,229,255,0.08)] flex items-center justify-center">
          <span className="text-[28px] text-[#EAEEFF]">
            {user?.name?.[0] ?? "A"}
          </span>
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-[#EAEEFF] mb-1">{user?.name ?? "Alex Chen"}</h3>
          <p className="text-[13px] text-[#8B95C9] mb-1">{user?.email ?? "alex@example.com"}</p>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${tierColor}15`,
              border: `1px solid ${tierColor}40`,
              color: tierColor,
            }}
          >
            {tierLabel} Plan
          </span>
        </div>
        <ChevronRight size={20} stroke="#5A6599" />
      </button>

      {/* Subscription */}
      <div className="mb-6">
        <div className="px-6 py-2">
          <span className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium">Subscription</span>
        </div>
        <div className="mx-6 rounded-2xl bg-[#1E2545] border border-[#2A3362] overflow-hidden">
          <SettingRow icon={Diamond} label="Manage Plan" value={tierLabel} onClick={() => navigate("/subscription")} />
          <SettingRow icon={Receipt} label="Billing History" onClick={() => navigate("/subscription")} />
        </div>
      </div>

      {/* Appearance */}
      <div className="mb-6">
        <div className="px-6 py-2">
          <span className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium">Appearance</span>
        </div>
        <div className="mx-6 rounded-2xl bg-[#1E2545] border border-[#2A3362] overflow-hidden">
          <SettingRowToggle icon={Moon} label="Dark Mode" />
          <SettingRow icon={Type} label="Font Size" value="Medium" onClick={() => navigate("/appearance")} />
        </div>
      </div>

      {/* Learning */}
      <div className="mb-6">
        <div className="px-6 py-2">
          <span className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium">Learning</span>
        </div>
        <div className="mx-6 rounded-2xl bg-[#1E2545] border border-[#2A3362] overflow-hidden">
          <SettingRow icon={Flag} label="Daily Goal" value="30 min" onClick={() => {}} />
          <SettingRow icon={Bell} label="Notifications" onClick={() => navigate("/notifications")} />
          <SettingRow icon={Globe} label="Language" value="English" onClick={() => {}} />
        </div>
      </div>

      {/* Account */}
      <div className="mb-6">
        <div className="px-6 py-2">
          <span className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium">Account</span>
        </div>
        <div className="mx-6 rounded-2xl bg-[#1E2545] border border-[#2A3362] overflow-hidden">
          <SettingRow icon={Mail} label="Change Email" onClick={() => navigate("/account")} />
          <SettingRow icon={Key} label="Change Password" onClick={() => navigate("/account")} />
          <SettingRow icon={Fingerprint} label="Two-Factor Auth" value="Off" onClick={() => navigate("/account")} />
          <SettingRow icon={Download} label="Export My Data" onClick={() => {}} />
        </div>
      </div>

      {/* Danger zone */}
      <div className="mb-6">
        <div className="mx-6 rounded-2xl bg-[#1E2545] border border-[#2A3362] overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-4 border-b border-[#2A3362] flex items-center gap-3 active:bg-[rgba(255,59,92,0.05)] transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-[rgba(255,59,92,0.08)] flex items-center justify-center">
              <LogOut size={18} stroke="#FF3B5C" />
            </div>
            <span className="flex-1 text-left text-[15px] text-[#FF3B5C]">Log Out</span>
          </button>
          <button className="w-full px-4 py-4 flex items-center gap-3 active:bg-[rgba(255,59,92,0.05)] transition-colors">
            <div className="w-9 h-9 rounded-lg bg-[rgba(255,59,92,0.08)] flex items-center justify-center">
              <Trash2 size={18} stroke="#FF3B5C" />
            </div>
            <span className="flex-1 text-left text-[15px] text-[#FF3B5C]">Delete Account</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8">
        <p className="text-[11px] text-[#5A6599] mb-1">CyberScout v1.0.0</p>
        <p className="text-[11px] text-[#5A6599]">Terms · Privacy · Support</p>
      </div>

      <TabBar />
    </div>
  );
}
