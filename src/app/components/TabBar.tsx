import { Home, Library, MessageCircle, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

export function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "dashboard", icon: Home, label: "Dashboard", path: "/dashboard" },
    { id: "courses", icon: Library, label: "Courses", path: "/courses" },
    { id: "chat", icon: MessageCircle, label: "AI Tutor", path: "/chat" },
    { id: "settings", icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#111629] border-t border-[#2A3362] h-[85px] pt-2 px-4 flex justify-around items-start z-50 max-w-[393px] mx-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;

        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center gap-1 min-w-[60px]"
          >
            <Icon
              size={24}
              fill={isActive ? "#00E5FF" : "none"}
              stroke={isActive ? "#00E5FF" : "#5A6599"}
              strokeWidth={2}
            />
            <span
              className="text-[11px] tracking-tight"
              style={{ color: isActive ? "#00E5FF" : "#5A6599" }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
