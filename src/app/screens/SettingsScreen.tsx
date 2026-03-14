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
    user?.tier === "max" ? "#E8A838" : user?.tier === "pro" ? "#A855F7" : "#9B8FBB";

  const SettingRow = ({ icon: Icon, label, value, onClick, iconBg, danger }: any) => (
    <button
      onClick={onClick}
      className="w-full px-4 py-4 border-b border-[rgba(80,60,140,0.3)] flex items-center gap-3 active:bg-[rgba(30,22,56,0.65)] transition-colors last:border-b-0"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: iconBg || "rgba(168,85,247,0.1)" }}
      >
        <Icon size={18} stroke={danger ? "#F87171" : "#A855F7"} />
      </div>
      <span className={`flex-1 text-left text-[15px] ${danger ? "text-[#F87171]" : "text-[#F0ECF9]"}`}>
        {label}
      </span>
      {value && <span className="text-[13px] text-[#655C80]">{value}</span>}
      <ChevronRight size={20} stroke="#655C80" />
    </button>
  );

  const SettingRowToggle = ({ icon: Icon, label }: any) => (
    <div className="px-4 py-4 border-b border-[rgba(80,60,140,0.3)] flex items-center gap-3 last:border-b-0">
      <div className="w-9 h-9 rounded-lg bg-[rgba(168,85,247,0.1)] flex items-center justify-center">
        <Icon size={18} stroke="#A855F7" />
      </div>
      <span className="flex-1 text-left text-[15px] text-[#F0ECF9]">{label}</span>
      <button
        onClick={toggleTheme}
        className="relative w-12 h-7 rounded-full transition-colors"
        style={{ backgroundColor: isDark ? "rgba(168,85,247,0.3)" : "rgba(80,60,140,0.3)" }}
      >
        <div
          className="absolute top-1 w-5 h-5 rounded-full transition-all"
          style={{
            left: isDark ? "calc(100% - 24px)" : "4px",
            backgroundColor: isDark ? "#A855F7" : "#655C80",
          }}
        />
      </button>
    </div>
  );

  return (
    <div className="h-screen bg-[#0D0B1A] pb-[100px] max-w-[393px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-[#F0ECF9]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Settings
        </h1>
      </div>

      {/* Profile card */}
      <button
        onClick={() => navigate("/profile")}
        className="mx-6 mb-6 p-4 rounded-2xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] flex items-center gap-3 w-[calc(100%-48px)] active:bg-[rgba(40,30,72,0.7)] transition-colors"
      >
        <div className="w-14 h-14 rounded-full bg-[rgba(168,85,247,0.1)] flex items-center justify-center">
          <span className="text-[28px] text-[#F0ECF9]">
            {user?.name?.[0] ?? "A"}
          </span>
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-[#F0ECF9] mb-1">{user?.name ?? "Alex Chen"}</h3>
          <p className="text-[13px] text-[#9B8FBB] mb-1">{user?.email ?? "alex@example.com"}</p>
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
        <ChevronRight size={20} stroke="#655C80" />
      </button>

      {/* Subscription */}
      <div className="mb-6">
        <div className="px-6 py-2">
          <span className="text-[11px] text-[#655C80] uppercase tracking-wider font-medium">Subscription</span>
        </div>
        <div className="mx-6 rounded-2xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] overflow-hidden">
          <SettingRow icon={Diamond} label="Manage Plan" value={tierLabel} onClick={() => navigate("/subscription")} />
          <SettingRow icon={Receipt} label="Billing History" onClick={() => navigate("/subscription")} />
        </div>
      </div>

      {/* Appearance */}
      <div className="mb-6">
        <div className="px-6 py-2">
          <span className="text-[11px] text-[#655C80] uppercase tracking-wider font-medium">Appearance</span>
        </div>
        <div className="mx-6 rounded-2xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] overflow-hidden">
          <SettingRowToggle icon={Moon} label="Dark Mode" />
          <SettingRow icon={Type} label="Font Size" value="Medium" onClick={() => navigate("/appearance")} />
        </div>
      </div>

      {/* Learning */}
      <div className="mb-6">
        <div className="px-6 py-2">
          <span className="text-[11px] text-[#655C80] uppercase tracking-wider font-medium">Learning</span>
        </div>
        <div className="mx-6 rounded-2xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] overflow-hidden">
          <SettingRow icon={Flag} label="Daily Goal" value="30 min" onClick={() => {}} />
          <SettingRow icon={Bell} label="Notifications" onClick={() => navigate("/notifications")} />
          <SettingRow icon={Globe} label="Language" value="English" onClick={() => {}} />
        </div>
      </div>

      {/* Account */}
      <div className="mb-6">
        <div className="px-6 py-2">
          <span className="text-[11px] text-[#655C80] uppercase tracking-wider font-medium">Account</span>
        </div>
        <div className="mx-6 rounded-2xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] overflow-hidden">
          <SettingRow icon={Mail} label="Change Email" onClick={() => navigate("/account")} />
          <SettingRow icon={Key} label="Change Password" onClick={() => navigate("/account")} />
          <SettingRow icon={Fingerprint} label="Two-Factor Auth" value="Off" onClick={() => navigate("/account")} />
          <SettingRow icon={Download} label="Export My Data" onClick={() => {}} />
        </div>
      </div>

      {/* Danger zone */}
      <div className="mb-6">
        <div className="mx-6 rounded-2xl bg-[rgba(30,22,56,0.65)] border border-[rgba(80,60,140,0.3)] overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-4 border-b border-[rgba(80,60,140,0.3)] flex items-center gap-3 active:bg-[rgba(248,113,113,0.05)] transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-[rgba(248,113,113,0.08)] flex items-center justify-center">
              <LogOut size={18} stroke="#F87171" />
            </div>
            <span className="flex-1 text-left text-[15px] text-[#F87171]">Log Out</span>
          </button>
          <button className="w-full px-4 py-4 flex items-center gap-3 active:bg-[rgba(248,113,113,0.05)] transition-colors">
            <div className="w-9 h-9 rounded-lg bg-[rgba(248,113,113,0.08)] flex items-center justify-center">
              <Trash2 size={18} stroke="#F87171" />
            </div>
            <span className="flex-1 text-left text-[15px] text-[#F87171]">Delete Account</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8">
        <p className="text-[11px] text-[#655C80] mb-1">CyberScout v1.0.0</p>
        <p className="text-[11px] text-[#655C80]">Terms · Privacy · Support</p>
      </div>

      <TabBar />
    </div>
  );
}
