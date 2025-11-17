import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sendOTP = async (e) => {
    e.preventDefault();

    if (phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      const res = await axios.post(`${backendURL}/api/students/send-otp`, {
        mobile: phoneNumber,
      });

      if (res.data.success) {
        setOtpSent(true);
        setIsModalOpen(true);
        toast.success("OTP sent successfully!");
      } else {
        throw new Error("Failed to send OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const verifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast.error("Invalid OTP. Please enter a 6-digit code.");
      return;
    }

    setIsVerifying(true);

    try {
      const res = await axios.post(`${backendURL}/api/students/verify-otp`, {
        mobile: phoneNumber,
        otp: otpCode,
      });

      if (res.data.success) {
        toast.success("OTP Verified! Redirecting...");
        setIsModalOpen(false);
        navigate("/register", { state: { mobile: phoneNumber } });
      } else {
        throw new Error("OTP did not match");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setIsVerifying(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* ---- Navbar---- */}
      <header className="w-full py-4 px-8 bg-white shadow-sm flex justify-between items-center">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
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

          {/* Right Card with Mobile Input */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
              {/* Graduation Cap Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🎓</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-blue-700 text-center mb-3">
                Register for SUPER30
              </h3>

              <p className="text-center text-gray-600 mb-6">
                Get Recognition, Scholarship, Cash Prizes & much more.
              </p>

              {/* Form */}
              <form onSubmit={sendOTP} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      id="phone"
                      placeholder="Enter your mobile number"
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      maxLength="10"
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none transition font-semibold"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
                >
                  Get OTP
                </Button>
              </form>

              {/* OTP Modal */}
              {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                  <div className="bg-white rounded-lg p-8 w-[90%] max-w-md">
                    <h2 className="text-xl font-bold mb-4">Enter OTP</h2>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border rounded-lg mb-4"
                      placeholder="Enter 6-digit OTP"
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                    />
                    <Button
                      onClick={verifyOTP}
                      disabled={isVerifying}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2"
                    >
                      {isVerifying ? "Verifying..." : "Verify OTP"}
                    </Button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="mt-3 w-full text-sm text-gray-500 underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ---- Footer ---- */}
      <footer className="py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} British School – Gurukul. All rights reserved.
      </footer>
    </div>
  );
}
