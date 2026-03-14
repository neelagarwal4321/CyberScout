import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Clock, Video, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const MENTOR = {
  name: "Sarah Kim",
  specialty: "Incident Response & Threat Hunting",
  rating: "4.9",
  sessions: "234",
};

const SESSION_TYPES = [
  { id: "career", label: "Career Coaching", duration: "30 min", icon: "🎯" },
  { id: "technical", label: "Technical Deep Dive", duration: "60 min", icon: "💻" },
  { id: "review", label: "Code / Resume Review", duration: "45 min", icon: "📝" },
];

const TIME_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function BookingScreen() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [booked, setBooked] = useState(false);

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + weekOffset * 7 - today.getDay() + 1);

  const weekDates = DAYS.map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const canBook = selectedType && selectedDay !== null && selectedTime;

  const handleBook = () => {
    if (!canBook) return;
    setBooked(true);
  };

  if (booked) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] max-w-[393px] mx-auto flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[rgba(57,255,20,0.08)] border border-[rgba(57,255,20,0.25)] flex items-center justify-center mb-6">
          <span className="text-[40px]">✓</span>
        </div>
        <h2 className="text-[#EAEEFF] mb-3" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
          Session Booked!
        </h2>
        <p className="text-[15px] text-[#8B95C9] mb-2">
          Your session with {MENTOR.name} is confirmed.
        </p>
        <p className="text-[13px] text-[#5A6599] mb-8">
          {DAYS[selectedDay!]}, {weekDates[selectedDay!].toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {selectedTime}
        </p>
        <button
          onClick={() => navigate("/mentors")}
          className="px-8 py-3 rounded-xl bg-[#00E5FF] text-[#0A0E1A] font-semibold active:scale-[0.97] transition-transform"
        >
          Back to Mentors
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] max-w-[393px] mx-auto overflow-y-auto pb-8">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 border-b border-[#2A3362]">
        <button onClick={() => navigate("/mentors")} className="mb-4">
          <ArrowLeft size={24} stroke="#EAEEFF" />
        </button>
        <h2 className="text-[#EAEEFF] mb-1" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
          Book a Session
        </h2>
        <p className="text-[13px] text-[#8B95C9]">with {MENTOR.name} · {MENTOR.specialty}</p>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Session type */}
        <div>
          <p className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium mb-3">Session Type</p>
          <div className="space-y-2">
            {SESSION_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className="w-full p-4 rounded-xl border flex items-center gap-3 transition-all text-left"
                style={{
                  borderColor: selectedType === type.id ? "#00E5FF" : "#2A3362",
                  backgroundColor: selectedType === type.id ? "rgba(0,229,255,0.06)" : "#1E2545",
                }}
              >
                <span className="text-[22px]">{type.icon}</span>
                <div className="flex-1">
                  <p className="text-[15px] text-[#EAEEFF]">{type.label}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={11} stroke="#5A6599" />
                    <span className="text-[11px] text-[#5A6599]">{type.duration}</span>
                  </div>
                </div>
                <Video size={16} stroke={selectedType === type.id ? "#00E5FF" : "#5A6599"} />
              </button>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium">Pick a Day</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
                className="w-7 h-7 rounded-full border border-[#2A3362] flex items-center justify-center"
              >
                <ChevronLeft size={14} stroke="#8B95C9" />
              </button>
              <span className="text-[11px] text-[#8B95C9]">
                {weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <button
                onClick={() => setWeekOffset((w) => w + 1)}
                className="w-7 h-7 rounded-full border border-[#2A3362] flex items-center justify-center"
              >
                <ChevronRight size={14} stroke="#8B95C9" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekDates.map((date, i) => {
              const isPast = date < today && date.toDateString() !== today.toDateString();
              const isWeekend = i >= 5;
              const unavailable = isPast || isWeekend;
              return (
                <button
                  key={i}
                  onClick={() => !unavailable && setSelectedDay(i)}
                  disabled={unavailable}
                  className="flex flex-col items-center py-2 rounded-xl transition-all"
                  style={{
                    backgroundColor:
                      selectedDay === i ? "#00E5FF" : unavailable ? "transparent" : "#1E2545",
                    opacity: unavailable ? 0.3 : 1,
                  }}
                >
                  <span
                    className="text-[10px] font-medium mb-1"
                    style={{ color: selectedDay === i ? "#0A0E1A" : "#5A6599" }}
                  >
                    {DAYS[i]}
                  </span>
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: selectedDay === i ? "#0A0E1A" : "#EAEEFF" }}
                  >
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        {selectedDay !== null && (
          <div>
            <p className="text-[11px] text-[#5A6599] uppercase tracking-wider font-medium mb-3">Available Times</p>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className="py-2.5 rounded-xl border text-[13px] font-medium transition-all"
                  style={{
                    borderColor: selectedTime === slot ? "#00E5FF" : "#2A3362",
                    backgroundColor: selectedTime === slot ? "rgba(0,229,255,0.08)" : "#1E2545",
                    color: selectedTime === slot ? "#00E5FF" : "#8B95C9",
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleBook}
          disabled={!canBook}
          className="w-full py-4 rounded-xl font-semibold text-[#0A0E1A] active:scale-[0.97] transition-transform disabled:opacity-40"
          style={{ backgroundColor: canBook ? "#00E5FF" : "#2A3362" }}
        >
          <Calendar size={16} className="inline mr-2" stroke={canBook ? "#0A0E1A" : "#5A6599"} />
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
