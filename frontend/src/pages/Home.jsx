import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

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
      <main className="flex flex-col items-center justify-center flex-1 px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Super 30 South Bihar Talent Search Examination
        </h2>

        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          A prestigious scholarship-based entrance examination conducted by 
          <strong> British School – Gurukul</strong>.  
          Exceptional students are selected for high-quality academic coaching and guidance.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-6 mt-4">
          <Button 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate("/register")}
          >
            Student Registration
          </Button>
        </div>
      </main>

      {/* ---- Footer ---- */}
      <footer className="py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} British School – Gurukul. All rights reserved.
      </footer>
    </div>
  );
}
