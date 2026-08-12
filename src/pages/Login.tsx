import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config/api";
import { FaEye, FaEyeSlash, FaFilm, FaTv, FaStar } from "react-icons/fa";

// This new component will be an overlay that needs to be clicked.
const ClapperboardOverlay = ({ onClap }: { onClap: () => void }) => {
  const [isClapped, setIsClapped] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClap = () => {
    if (isClapped) return;
    setIsClapped(true);
    
    // Start the exit animation shortly after the clap animation begins
    setTimeout(() => {
      setIsLeaving(true);
    }, 200);

    // Inform parent to remove overlay after the exit animation is complete
    setTimeout(() => {
      onClap();
    }, 700); // 200ms delay + 500ms animation
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-700 ${isClapped ? 'bg-transparent' : 'bg-black/60'}`}
      onClick={handleClap}
    >
      <div 
        className={`relative w-80 cursor-pointer group select-none transition-all duration-500 ease-in-out ${isLeaving ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}`}
        style={{ perspective: '1000px' }}
      >
        {/* Top part (Clapper Stick) */}
        <div 
          className={`h-16 bg-[#1a1a1a] rounded-t-xl origin-bottom-left relative z-20 transition-transform duration-150 ease-in ${!isClapped ? '-rotate-[25deg]' : 'rotate-0'}`}
          style={{ 
            backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 20px, white 20px, white 40px)",
            boxShadow: "0 4px 6px rgba(0,0,0,0.5)"
          }}
        >
            {/* Hinge Detail */}
            <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-neutral-400 border-2 border-neutral-600 shadow-inner z-30" />
        </div>

        {/* Bottom part (Board) */}
        <div className="h-64 bg-[#1a1a1a] rounded-b-xl shadow-2xl flex flex-col relative overflow-hidden border-t-4 border-white">
           {/* Top stripe on bottom board to match */}
           <div className="h-4 w-full absolute top-0 left-0" 
                style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 20px, white 20px, white 40px)" }} 
           />
           
           <div className="p-6 mt-4 flex flex-col h-full justify-between">
               {/* Info Grid */}
               <div className="grid grid-cols-2 gap-px bg-white/20 border border-white/20 rounded-lg overflow-hidden">
                   <div className="bg-[#222] p-3">
                       <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Production</p>
                       <p className="text-white font-mono font-bold text-lg truncate">MOVIBASE</p>
                   </div>
                   <div className="bg-[#222] p-3">
                       <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Scene</p>
                       <p className="text-white font-mono text-lg">LOGIN</p>
                   </div>
                   <div className="bg-[#222] p-3">
                       <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Take</p>
                       <p className="text-red-500 font-mono text-xl font-bold">01</p>
                   </div>
                   <div className="bg-[#222] p-3">
                       <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Director</p>
                       <p className="text-white font-mono text-sm truncate">YOU</p>
                   </div>
               </div>

               {/* Action Text */}
               <div className="text-center mt-2">
                   <h2 className="text-4xl font-black text-white tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                       ACTION
                   </h2>
                   <p className="text-xs text-white/40 font-mono mt-1 animate-pulse">CLICK TO START</p>
               </div>
           </div>
           
           {/* Glossy overlay */}
           <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};


const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  // New state to control the clapperboard interaction
  const [isClapperboardOpen, setIsClapperboardOpen] = useState(false);

  // Parallax mouse effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent login if clapperboard hasn't been "clapped"
    if (!isClapperboardOpen) {
      setError("Please clap the board to begin!");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuspendReason("");
    
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("userId", data.id);
        localStorage.setItem("isAdmin", data.isAdmin ? "true" : "false");

        // Admin goes to admin panel, regular users go to home
        if (data.isAdmin) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      } else {
        setError(data.error);
        if (data.reason) setSuspendReason(data.reason);
        setIsLoading(false);
      }
    } catch (err) {
      setError("Something went wrong");
      setSuspendReason("");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a1a] flex items-center justify-center">
      
      {/* Clapperboard Overlay - Outside the blurred container */}
      {!isClapperboardOpen && <ClapperboardOverlay onClap={() => setIsClapperboardOpen(true)} />}

      {/* Main Content Wrapper - Blurs when clapperboard is active */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-out ${!isClapperboardOpen ? 'blur-md brightness-[0.4] scale-105' : 'blur-0 brightness-100 scale-100'}`}>
        
        {/* Animated Background */}
        <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-[120px]"
          style={{
            background: "linear-gradient(135deg, #01b4e4, #90cea1)",
            top: "10%",
            left: "10%",
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]"
          style={{
            background: "linear-gradient(135deg, #e91e63, #9c27b0)",
            bottom: "10%",
            right: "10%",
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        
        {/* Floating Icons */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white/10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          >
            {i % 3 === 0 ? <FaFilm size={30 + Math.random() * 20} /> : 
             i % 3 === 1 ? <FaTv size={30 + Math.random() * 20} /> : 
             <FaStar size={20 + Math.random() * 15} />}
          </div>
        ))}
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
        </div>

        {/* Login Card */}
        <div 
          className="relative z-10 w-full max-w-md mx-4"
          style={{
            transform: `perspective(1000px) rotateY(${mousePosition.x * 0.02}deg) rotateX(${-mousePosition.y * 0.02}deg)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          <div className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl transition-opacity duration-500 ${!isClapperboardOpen ? 'pointer-events-none' : 'opacity-100'}`}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <span className="text-4xl font-black bg-gradient-to-r from-[#01b4e4] to-[#90cea1] bg-clip-text text-transparent">
                Movi
              </span>
              <span className="text-4xl font-black text-white">base</span>
            </div>
            <p className="text-white/60 text-sm">Welcome back! Sign in to continue</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm text-center animate-shake">
              <p className="font-bold">⚠️ {error}</p>
              {suspendReason && (
                <p className="mt-2 text-xs text-white/60">
                  Reason: <span className="italic text-white/90">{suspendReason}</span>
                </p>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="group">
              <label className="block text-white/70 text-sm font-medium mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#01b4e4] focus:bg-white/10 focus:ring-2 focus:ring-[#01b4e4]/20 transition-all duration-300"
                  required
                  disabled={!isClapperboardOpen || isLoading}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#01b4e4]/0 via-[#01b4e4]/0 to-[#90cea1]/0 group-focus-within:from-[#01b4e4]/10 group-focus-within:to-[#90cea1]/10 pointer-events-none transition-all duration-500" />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-white/70 text-sm font-medium mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#01b4e4] focus:bg-white/10 focus:ring-2 focus:ring-[#01b4e4]/20 transition-all duration-300"
                  required
                  disabled={!isClapperboardOpen || isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  disabled={!isClapperboardOpen || isLoading}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className={`text-sm text-[#01b4e4] hover:text-[#90cea1] transition-colors ${!isClapperboardOpen ? 'pointer-events-none' : ''}`}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isClapperboardOpen || isLoading}
              className="relative w-full py-4 rounded-xl font-bold text-white overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {/* Button Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#01b4e4] to-[#90cea1] transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#90cea1] to-[#01b4e4] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Button Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
              
              {/* Button Text */}
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="text-white/40 text-sm">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-white/60">
            New to Movibase?{" "}
            <Link 
              to="/signup" 
              className={`font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#01b4e4] to-[#90cea1] hover:from-[#90cea1] hover:to-[#01b4e4] transition-all duration-300 ${!isClapperboardOpen ? 'pointer-events-none' : ''}`}
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Bottom Glow */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-gradient-to-r from-[#01b4e4] to-[#90cea1] blur-3xl opacity-30" />
        </div>
      </div> {/* End of Main Content Wrapper */}

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
