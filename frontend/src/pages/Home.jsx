import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import DetailsCard from "@/components/DetailsCard";
import { CalendarDays, Clock, FileCheck, Target, TrendingUp, Users } from "lucide-react";


const formatDateForDisplay = (dateString) => {
  if (!dateString) return "To Be Announced";
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
};


export default function Home() {
  const navigate = useNavigate();
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendURL}/api/admin/exam-settings`);
        setSettings(res.data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        toast.error("Failed to load exam settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [backendURL]);


return (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    
    {/* ---- Navbar---- */}
    <header
      className="fixed top-0 left-0 w-full z-50 shadow-lg transition-all duration-300 px-6 py-4 flex justify-between items-center"
      style={{
        background: "oklch(0.98 0.001 70 / 0.35)", 
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)", 
      }}
    >
      <h1 className="text-xl font-bold text-blue-700">
        British School – Gurukul
      </h1>

      <Button
        variant="glass"
        onClick={() => navigate("/admin/dashboard")}
      >
        Admin Login
      </Button>
    </header>

    {/* ---- Hero Section ---- */}
    <section className="min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Quote */}
            <div className="text-lg md:text-2xl font-semibold text-gray-900">
              <span className="text-blue-700">"Khoj Us Talent Ki,</span> Jo Kal Ka <span className="text-blue-700">Topper Banega!"</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                <span className="text-blue-700">SUPER30</span>
              </h1>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                SOUTH BIHAR <br /> TALENT SEARCH <br /> EXAM
              </h2>
            </div>

            {/* Subheading */}
            <div className="text-lg md:text-xl text-gray-800 font-semibold">
              For Students of Class 11th & 12th(Science)
            </div>

            {/* Bottom CTA */}
            <div className="pt-4 space-y-2">
              <p className="text-lg md:text-xl">
                <span className="font-bold text-blue-700">Earn Scholarships</span>
                <span className="text-gray-800">, Get </span>
                <span className="font-bold text-blue-700">Cash Prizes</span>
                <span className="text-gray-800">, & </span>
                <span className="font-bold text-blue-700">Much More!</span>
              </p>
            </div>
          </div>

          {/* Right Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white rounded-lg p-8 w-full max-w-md border border-slate-200">

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🎓</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-blue-700 text-center mb-3">
                Register for SUPER30
              </h3>

              <p className="text-center text-gray-600 mb-6">
                Get Recognition, Scholarship, Cash Prizes & more.
              </p>

              {/* Simple Register Button */}
              {loading ? (
                <Button
                  disabled
                  className="w-full bg-gray-200 text-gray-800 font-bold py-3 rounded-lg cursor-not-allowed"
                >
                  Loading...
                </Button>
              ) : settings?.registrationOpen ? (
                <Button
                  onClick={() => navigate("/register")}
                  className="w-full bg-linear-to-r from-blue-500 to-blue-600 
                  hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 
                  rounded-lg transition transform hover:scale-105"
                >
                  Register Now
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full bg-gray-300 text-gray-800 py-3 rounded-lg cursor-not-allowed"
                >
                  Registration Closed
                </Button>
              )}

            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ---- Exam Details Section ---- */}
    <section className="min-h-screen flex items-center py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
          Exam Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          <DetailsCard
            icon={<Users className="w-10 h-10 text-orange-500" />}
            title="Eligibility"
            text="Class 10th to 11th Moving Students"
          />

          <DetailsCard
            icon={<Target className="w-10 h-10 text-orange-500" />}
            title="Target"
            text="Jee Main/Advanced, NEET (UG) - 2028"
          />

          <DetailsCard
            icon={<CalendarDays className="w-10 h-10 text-orange-500" />}
            title="Exam Date"
            text={formatDateForDisplay(settings?.examDate) || "To Be Announced"}
          />

          <DetailsCard
            icon={<Clock className="w-10 h-10 text-orange-500" />}
            title="Exam Time & Mode"
            text="9:00 AM – 12:00 PM • Offline (At Center)"
          />

          <DetailsCard
            icon={<TrendingUp className="w-10 h-10 text-orange-500" />}
            title="Last Date to Register"
            text={formatDateForDisplay(settings?.lastDateToRegister) || "To Be Announced"}
          />

          <DetailsCard
            icon={<FileCheck className="w-10 h-10 text-orange-500" />}
            title="Result Date"
            text={formatDateForDisplay(settings?.resultDate) || "To Be Announced"}
          />

        </div>
      </div>
    </section>

    {/* ---- Footer ---- */}
    <footer className="py-4 text-center text-gray-500 text-sm">
      © {new Date().getFullYear()} British School – Gurukul. All rights reserved.
    </footer>
  </div>
);
}