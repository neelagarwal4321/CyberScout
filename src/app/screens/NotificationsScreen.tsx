import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

export function NotificationsScreen() {
  const navigate = useNavigate();

  const notifications = [
    {
      section: "Today",
      items: [
        { dot: "#00E5FF", text: "Your streak is 12 days! Keep going 🔥", time: "2h ago" },
        { dot: "#A855F7", text: "New course: Advanced Cloud Security", time: "5h ago" },
      ],
    },
    {
      section: "This Week",
      items: [
        { dot: "#FF3B5C", text: "Live session starts in 1 hour: Incident Response Workshop", time: "1d ago" },
        { dot: "#39FF14", text: "You completed Module 2 of Cybersecurity Foundations 🎉", time: "2d ago" },
      ],
    },
  ];

  return (
    <div className="h-screen bg-[#0A0E1A] max-w-[393px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-4 border-b border-[#2A3362]">
        <button onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={24} stroke="#EAEEFF" />
        </button>
        <h2 className="text-[#EAEEFF]" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
          Notifications
        </h2>
      </div>

      {/* Notifications List */}
      <div>
        {notifications.map((group, i) => (
          <div key={i}>
            <div className="px-6 py-3">
              <span className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium">
                {group.section}
              </span>
            </div>
            {group.items.map((notif, j) => (
              <div
                key={j}
                className="px-6 py-4 border-b border-[#2A3362] flex items-start gap-3"
              >
                <div
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: notif.dot }}
                ></div>
                <div className="flex-1">
                  <p className="text-[15px] text-[#EAEEFF] mb-1 leading-relaxed">{notif.text}</p>
                  <span className="text-[13px] text-[#5A6599]">{notif.time}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
