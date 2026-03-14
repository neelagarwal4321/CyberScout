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
      borderColor: user?.tier === "free" ? "#A855F7" : "rgba(80,60,140,0.3)",
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
      borderColor: user?.tier === "pro" ? "#A855F7" : "rgba(80,60,140,0.3)",
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
      borderColor: user?.tier === "max" ? "#E8A838" : "rgba(80,60,140,0.3)",
    },
  ];

  return (
    <div className="h-screen bg-[#0D0B1A] pb-12 max-w-[393px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <button onClick={() => navigate("/settings")} className="mb-4">
          <ArrowLeft size={24} stroke="#F0ECF9" />
        </button>
        <h2 className="text-[#F0ECF9] mb-2" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Choose Your Plan
        </h2>
        <p className="text-[15px] text-[#9B8FBB]">
          Invest in your cybersecurity career
        </p>
      </div>

      {/* Plans */}
      <div className="px-6 space-y-4">
        {plans.map((plan) => {
          const nameColor =
            plan.name === "Max" ? "#E8A838" : plan.name === "Pro" ? "#A855F7" : "#9B8FBB";

          return (
            <div
              key={plan.name}
              className="p-5 rounded-2xl bg-[rgba(30,22,56,0.65)] relative"
              style={{ border: `${plan.isCurrent ? 2 : 1}px solid ${plan.borderColor}` }}
            >
              {plan.badge && (
                <div className="absolute -top-2.5 left-5 px-2 py-0.5 rounded bg-[#A855F7]">
                  <span className="text-[10px] font-bold text-[#0D0B1A] uppercase tracking-wider">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[18px] font-semibold" style={{ color: nameColor }}>
                  {plan.name}
                </h3>
                {plan.isCurrent && (
                  <span className="px-2 py-0.5 rounded-full bg-[rgba(168,85,247,0.1)] text-[10px] font-bold text-[#A855F7] uppercase tracking-wider">
                    Current
                  </span>
                )}
              </div>

              <div className="mb-5">
                <span className="text-[32px] font-bold text-[#F0ECF9]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  {plan.price}
                </span>
                <span className="text-[15px] text-[#655C80] ml-1">{plan.period}</span>
              </div>

              <div className="space-y-2 mb-5">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-2">
                    {feature.included ? (
                      <CheckCircle size={16} stroke="#4ADE80" className="flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={16} stroke="#655C80" className="flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`text-[15px] ${feature.included ? "text-[#F0ECF9]" : "text-[#655C80]"}`}>
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
                    ? { backgroundColor: plan.isCurrent ? "transparent" : "#E8A838", color: plan.isCurrent ? "#E8A838" : "#0D0B1A", border: plan.isCurrent ? "1px solid #E8A838" : "none" }
                    : plan.isCurrent
                    ? { border: "1px solid #9B8FBB", color: "#9B8FBB" }
                    : plan.tier === "free"
                    ? { border: "1px solid rgba(80,60,140,0.3)", color: "#9B8FBB" }
                    : { border: "1px solid #A855F7", color: "#A855F7" }
                }
              >
                {plan.button}
              </button>
            </div>
          );
        })}
      </div>

      <div className="px-6 mt-6">
        <p className="text-[13px] text-[#655C80] text-center leading-relaxed">
          Cancel anytime. All paid plans include a 7-day free trial.
        </p>
      </div>
    </div>
  );
}
