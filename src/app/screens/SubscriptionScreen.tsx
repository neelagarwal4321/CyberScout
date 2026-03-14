import { useNavigate } from "react-router";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function SubscriptionScreen() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const handleUpgrade = (tier: "pro" | "max") => {
    // Mock: immediately apply tier change
    updateUser({ tier });
    navigate("/settings");
  };

  const plans = [
    {
      name: "Free",
      tier: "free" as const,
      price: "$0",
      period: "forever",
      features: [
        { text: "AI chatbot tutor (50 msgs/day)", included: true },
        { text: "Course roadmap & progress", included: true },
        { text: "Community forum", included: true },
        { text: "First module of every course", included: true },
        { text: "Recorded lectures", included: false },
        { text: "Live lectures", included: false },
        { text: "1:1 Mentorship", included: false },
      ],
      button: "Current Plan",
      isCurrent: user?.tier === "free",
      borderColor: user?.tier === "free" ? "#00E5FF" : "#2A3362",
    },
    {
      name: "Pro",
      tier: "pro" as const,
      price: "$19",
      period: "/month",
      badge: "MOST POPULAR",
      features: [
        { text: "Everything in Free", included: true },
        { text: "Unlimited AI chat", included: true },
        { text: "Full lecture library", included: true },
        { text: "Live batch lectures", included: true },
        { text: "Hands-on labs", included: true },
        { text: "Completion certificates", included: true },
        { text: "1:1 Mentorship", included: false },
      ],
      button: user?.tier === "pro" ? "Current Plan" : user?.tier === "max" ? "Downgrade" : "Upgrade to Pro",
      isCurrent: user?.tier === "pro",
      borderColor: user?.tier === "pro" ? "#00E5FF" : "#2A3362",
    },
    {
      name: "Max",
      tier: "max" as const,
      price: "$49",
      period: "/month",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "1:1 mentorship (4x/month)", included: true },
        { text: "Priority AI responses", included: true },
        { text: "Career coaching", included: true },
        { text: "Private instructor channel", included: true },
        { text: "Early access to courses", included: true },
        { text: "Custom learning paths", included: true },
      ],
      button: user?.tier === "max" ? "Current Plan" : "Upgrade to Max",
      isCurrent: user?.tier === "max",
      borderColor: user?.tier === "max" ? "#FFD700" : "#2A3362",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-12 max-w-[393px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <button onClick={() => navigate("/settings")} className="mb-4">
          <ArrowLeft size={24} stroke="#EAEEFF" />
        </button>
        <h2 className="text-[#EAEEFF] mb-2" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
          Choose Your Plan
        </h2>
        <p className="text-[15px] text-[#8B95C9]">
          Invest in your cybersecurity career
        </p>
      </div>

      {/* Plans */}
      <div className="px-6 space-y-4">
        {plans.map((plan) => {
          const nameColor =
            plan.name === "Max" ? "#FFD700" : plan.isCurrent ? "#00E5FF" : "#8B95C9";

          return (
            <div
              key={plan.name}
              className="p-5 rounded-2xl bg-[#1E2545] relative"
              style={{ border: `${plan.isCurrent ? 2 : 1}px solid ${plan.borderColor}` }}
            >
              {plan.badge && (
                <div className="absolute -top-2.5 left-5 px-2 py-0.5 rounded bg-[#00E5FF]">
                  <span className="text-[10px] font-bold text-[#0A0E1A] uppercase tracking-wider">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[18px] font-semibold" style={{ color: nameColor }}>
                  {plan.name}
                </h3>
                {plan.isCurrent && (
                  <span className="px-2 py-0.5 rounded-full bg-[rgba(0,229,255,0.08)] text-[10px] font-bold text-[#00E5FF] uppercase tracking-wider">
                    Current
                  </span>
                )}
              </div>

              <div className="mb-5">
                <span className="text-[32px] font-bold text-[#EAEEFF]" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
                  {plan.price}
                </span>
                <span className="text-[15px] text-[#5A6599] ml-1">{plan.period}</span>
              </div>

              <div className="space-y-2 mb-5">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-2">
                    {feature.included ? (
                      <CheckCircle size={16} stroke="#39FF14" className="flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={16} stroke="#5A6599" className="flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`text-[15px] ${feature.included ? "text-[#EAEEFF]" : "text-[#5A6599]"}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => !plan.isCurrent && plan.tier !== "free" && handleUpgrade(plan.tier as "pro" | "max")}
                disabled={plan.isCurrent || plan.tier === "free"}
                className="w-full py-3 rounded-xl font-semibold active:scale-[0.97] transition-transform disabled:opacity-60"
                style={
                  plan.name === "Max"
                    ? { backgroundColor: plan.isCurrent ? "transparent" : "#FFD700", color: plan.isCurrent ? "#FFD700" : "#0A0E1A", border: plan.isCurrent ? "1px solid #FFD700" : "none" }
                    : plan.isCurrent
                    ? { border: "1px solid #8B95C9", color: "#8B95C9" }
                    : { border: "1px solid #00E5FF", color: "#00E5FF" }
                }
              >
                {plan.button}
              </button>
            </div>
          );
        })}
      </div>

      <div className="px-6 mt-6">
        <p className="text-[13px] text-[#5A6599] text-center leading-relaxed">
          Cancel anytime. All paid plans include a 7-day free trial.
        </p>
      </div>
    </div>
  );
}
