import { useNavigate } from "react-router";
import { ArrowLeft, Award, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCourses } from "../context/CourseContext";

export function CertificatesScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrollments, getProgress } = useCourses();

  const canEarnCertificates = user?.tier === "pro" || user?.tier === "max";
  const completedCourses = enrollments.filter((e) => getProgress(e.courseId) === 100);
  const hasCertificates = canEarnCertificates && completedCourses.length > 0;

  const certificates = [
    {
      course: "Cybersecurity Foundations",
      date: "March 1, 2026",
      id: "CS-2026-00142",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E1A] max-w-[393px] mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 border-b border-[#2A3362]">
        <button onClick={() => navigate("/dashboard")} className="mb-4">
          <ArrowLeft size={24} stroke="#EAEEFF" />
        </button>
        <h2 className="text-[#EAEEFF]" style={{ fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
          Certificates
        </h2>
      </div>

      {!canEarnCertificates ? (
        /* Upgrade gate */
        <div className="flex flex-col items-center justify-center px-6 py-24">
          <div className="w-[60px] h-[60px] rounded-full bg-[rgba(0,229,255,0.08)] flex items-center justify-center mb-6">
            <Lock size={28} stroke="#00E5FF" />
          </div>
          <h4 className="text-[#EAEEFF] mb-3 text-center">Pro Feature</h4>
          <p className="text-[13px] text-[#8B95C9] text-center mb-8 max-w-[280px] leading-relaxed">
            Upgrade to Pro to earn verifiable certificates when you complete courses.
          </p>
          <button
            onClick={() => navigate("/subscription")}
            className="px-8 py-3 rounded-xl bg-[#00E5FF] text-[#0A0E1A] font-semibold active:scale-[0.97] transition-transform"
          >
            Upgrade to Pro
          </button>
        </div>
      ) : !hasCertificates ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center px-6 py-24">
          <div className="w-12 h-12 rounded-full bg-[rgba(90,101,153,0.12)] flex items-center justify-center mb-4">
            <Award size={24} stroke="#5A6599" />
          </div>
          <p className="text-[15px] text-[#5A6599] mb-2 text-center">No certificates yet</p>
          <p className="text-[13px] text-[#5A6599] mb-8 text-center max-w-[260px] leading-relaxed">
            Complete a course to earn your first certificate
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="px-6 py-3 rounded-xl bg-[#00E5FF] text-[#0A0E1A] font-semibold active:scale-[0.97] transition-transform"
          >
            Browse Courses
          </button>
        </div>
      ) : (
        /* Certificates List */
        <div className="px-6 py-6 space-y-4">
          {certificates.map((cert, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#1E2545] border border-[#2A3362]"
            >
              <h4 className="text-[#EAEEFF] mb-2">{cert.course}</h4>
              <p className="text-[13px] text-[#8B95C9] mb-1">
                Completed {cert.date}
              </p>
              <p className="text-[11px] text-[#5A6599] mb-4">
                Certificate ID: {cert.id}
              </p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg bg-[#00E5FF] text-[#0A0E1A] text-[13px] font-semibold active:scale-[0.97] transition-transform">
                  View Certificate
                </button>
                <button className="flex-1 py-2 rounded-lg border border-[#2A3362] text-[#EAEEFF] text-[13px] font-semibold active:bg-[#1E2545] transition-colors">
                  Share to LinkedIn
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
