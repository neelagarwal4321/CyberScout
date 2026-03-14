import { useNavigate } from "react-router";
import { ArrowLeft, Moon, Sun, Type } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const FONT_SIZES = ["Small", "Medium", "Large"];
const ACCENT_COLORS = [
  { name: "Cyan", value: "#00E5FF" },
  { name: "Green", value: "#39FF14" },
  { name: "Purple", value: "#A855F7" },
  { name: "Orange", value: "#FF9F1C" },
];

export function AppearanceScreen() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="h-screen bg-[#0A0E1A] max-w-[393px] mx-auto overflow-y-auto pb-12">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 border-b border-[#2A3362]">
        <button onClick={() => navigate("/settings")} className="mb-4">
          <ArrowLeft size={24} stroke="#EAEEFF" />
        </button>
        <h2 className="text-[#EAEEFF]" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
          Appearance
        </h2>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Theme */}
        <div>
          <p className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium mb-3">Theme</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => isDark && toggleTheme()}
              className="p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all"
              style={{
                borderColor: !isDark ? "#00E5FF" : "#2A3362",
                backgroundColor: !isDark ? "rgba(0,229,255,0.06)" : "#1E2545",
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                <Sun size={20} stroke="#0A0E1A" />
              </div>
              <span className={`text-[13px] font-medium ${!isDark ? "text-[#00E5FF]" : "text-[#5A6599]"}`}>
                Light
              </span>
            </button>
            <button
              onClick={() => !isDark && toggleTheme()}
              className="p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all"
              style={{
                borderColor: isDark ? "#00E5FF" : "#2A3362",
                backgroundColor: isDark ? "rgba(0,229,255,0.06)" : "#1E2545",
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#111629] flex items-center justify-center">
                <Moon size={20} stroke="#00E5FF" />
              </div>
              <span className={`text-[13px] font-medium ${isDark ? "text-[#00E5FF]" : "text-[#5A6599]"}`}>
                Dark
              </span>
            </button>
          </div>
        </div>

        {/* Font size */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Type size={14} stroke="#5A6599" />
            <p className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium">Font Size</p>
          </div>
          <div className="flex gap-2">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                className="flex-1 py-2.5 rounded-xl border text-[13px] font-medium transition-all"
                style={{
                  borderColor: size === "Medium" ? "#00E5FF" : "#2A3362",
                  backgroundColor: size === "Medium" ? "rgba(0,229,255,0.08)" : "#1E2545",
                  color: size === "Medium" ? "#00E5FF" : "#8B95C9",
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Accent color */}
        <div>
          <p className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium mb-3">Accent Color</p>
          <div className="flex gap-3">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.name}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: `${c.value}20`,
                    borderColor: c.value === "#00E5FF" ? c.value : "transparent",
                  }}
                >
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: c.value }} />
                </div>
                <span className="text-[10px] text-[#5A6599]">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div>
          <p className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium mb-3">Preview</p>
          <div className="p-4 rounded-2xl bg-[#1E2545] border border-[#2A3362]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.25)] flex items-center justify-center">
                <span className="text-[18px]">🛡️</span>
              </div>
              <div>
                <p className="text-[15px] text-[#EAEEFF] font-semibold">Web App Security</p>
                <p className="text-[11px] text-[#5A6599]">12h · Beginner</p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-[#2A3362]">
              <div className="h-full rounded-full bg-[#00E5FF]" style={{ width: "65%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
