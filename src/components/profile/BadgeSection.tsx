import { useEffect, useState, useRef } from "react";
import { useTheme } from "../ThemaContext";
import { 
  FaStar, 
  FaComments, 
  FaHeart, 
  FaCalendarCheck, 
  FaMusic, 
  FaTrophy, 
  FaLock 
} from "react-icons/fa";

interface Badge {
  id: number;
  name: string;
  description: string;
  current: number;
  target: number;
  unlocked: boolean;
}

interface BadgeSectionProps {
  badges: Badge[];
  isOwnProfile: boolean;
  username: string;
  allUnlocked: boolean;
  rewardCode: string | null;
  onClaimReward: () => void;
}

const BADGE_ICONS: Record<number, React.ElementType> = {
  1: FaStar,
  2: FaComments,
  3: FaHeart,
  4: FaCalendarCheck,
  5: FaMusic,
};

const BADGE_COLORS: Record<number, string> = {
  1: "text-yellow-500",
  2: "text-blue-500",
  3: "text-red-500",
  4: "text-green-500",
  5: "text-purple-500",
};

const BADGE_BORDERS: Record<number, string> = {
  1: "border-yellow-500",
  2: "border-blue-500",
  3: "border-red-500",
  4: "border-green-500",
  5: "border-purple-500",
};

// Simple Confetti Implementation
const fireConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: any) {
    // Since we can't use canvas-confetti package, we'll create a simple DOM based confetti
    // or just skip if not available. But let's try to create a simple one.
    // Actually, for this environment, let's create a simple CSS based confetti overlay
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-10px';
      confetti.style.opacity = '1';
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      // Random animation duration and delay
      const duration = Math.random() * 3 + 2;
      const delay = Math.random() * 2;
      
      confetti.style.transition = `top ${duration}s ease-out, transform ${duration}s linear, opacity ${duration}s ease-out`;
      
      container.appendChild(confetti);

      // Trigger animation
      setTimeout(() => {
        confetti.style.top = '110vh';
        confetti.style.transform = `rotate(${Math.random() * 360 + 360}deg)`;
        confetti.style.opacity = '0';
      }, delay * 100);
    }

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(container);
    }, 6000);
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
};

const BadgeSection = ({ 
  badges, 
  isOwnProfile, 
  username, 
  allUnlocked, 
  rewardCode, 
  onClaimReward 
}: BadgeSectionProps) => {
  const { darkMode } = useTheme();
  const [isCopied, setIsCopied] = useState(false);

  const handleClaimClick = () => {
    fireConfetti();
    onClaimReward();
  };

  const handleCopyCode = () => {
    if (rewardCode && !isCopied) {
      navigator.clipboard.writeText(rewardCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  return (
    <section className="mb-12 animate-fade-in-up relative">
      <div className="flex items-center justify-center gap-3 mb-10">
        <FaTrophy className="text-4xl text-yellow-500 drop-shadow-lg" />
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          {isOwnProfile ? "Achievements" : `${username}'s Achievements`}
        </h2>
      </div>

      <div className="flex flex-wrap justify-center gap-8 md:gap-12">
        {badges.map((badge) => {
          const Icon = BADGE_ICONS[badge.id] || FaTrophy;
          const colorClass = BADGE_COLORS[badge.id] || "text-gray-400";
          const borderClass = BADGE_BORDERS[badge.id] || "border-gray-400";
          const percentage = Math.min(100, Math.max(0, (badge.current / badge.target) * 100));

          return (
            <div 
              key={badge.id} 
              className="group relative flex flex-col items-center"
            >
              {/* Medal Token */}
              <div 
                className={`
                  relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500
                  ${badge.unlocked 
                    ? `bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-[0_0_20px_rgba(0,0,0,0.2)] scale-110 border-4 ${borderClass}` 
                    : "bg-gray-200 dark:bg-gray-800 border-4 border-gray-300 dark:border-gray-700 grayscale opacity-60"
                  }
                `}
              >
                {/* Inner Glow for Unlocked */}
                {badge.unlocked && (
                  <div className={`absolute inset-0 rounded-full opacity-20 bg-current ${colorClass} blur-md`}></div>
                )}

                {/* Icon */}
                <div className="relative z-10 transform transition-transform duration-300 group-hover:scale-110">
                  {badge.unlocked ? (
                    <Icon className={`text-4xl ${colorClass} drop-shadow-md`} />
                  ) : (
                    <FaLock className="text-3xl text-gray-400" />
                  )}
                </div>

                {/* Shine Effect */}
                {badge.unlocked && (
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                )}
              </div>

              {/* Name & Progress */}
              <div className="mt-4 text-center">
                <h3 className={`font-bold text-sm mb-1 ${badge.unlocked ? "text-gray-800 dark:text-white" : "text-gray-500"}`}>
                  {badge.name}
                </h3>
                
                {/* Simple Progress Bar */}
                <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-auto">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${badge.unlocked ? "bg-green-500" : "bg-gray-400"}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-[10px] mt-1 text-gray-400 font-mono">
                  {badge.current} / {badge.target}
                </p>
              </div>

              {/* Tooltip */}
              <div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-300 bottom-full mb-4 w-48 p-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-xs rounded-xl text-center pointer-events-none z-20 shadow-2xl border border-gray-100 dark:border-gray-700 transform translate-y-2 group-hover:translate-y-0">
                <p className="font-semibold mb-1">{badge.name}</p>
                <p className="opacity-80">{badge.description}</p>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-100 dark:border-gray-700 transform rotate-45"></div>
              </div>
            </div>
          );
        })}
      </div>

      {isOwnProfile && allUnlocked && (
        <div className="mt-16 transform transition-all duration-500 hover:scale-[1.01]">
          {rewardCode ? (
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 rounded-2xl p-[2px] shadow-2xl max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center relative overflow-hidden h-full">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <div className="text-6xl mb-4 animate-bounce">🎟️</div>
                  <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    Cinema Ticket Unlocked!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Congratulations! You've proven yourself as a true movie buff.
                    Here is your double cinema ticket code valid at all Paribu Cineverse theaters.
                  </p>
                  
                  <div 
                    className={`group relative inline-block ${isCopied ? "cursor-default" : "cursor-pointer"}`} 
                    onClick={handleCopyCode}
                  >
                    <div className={`absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-lg blur opacity-25 transition duration-200 ${isCopied ? "opacity-0" : "group-hover:opacity-75"}`}></div>
                    <div className={`relative bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-8 py-4 flex items-center gap-4 transition-all duration-300 ${isCopied ? "bg-green-50 dark:bg-green-900/20 border-green-500" : ""}`}>
                      <span className={`font-mono text-2xl font-bold tracking-[0.2em] transition-colors duration-300 ${isCopied ? "text-green-600 dark:text-green-400" : "text-gray-800 dark:text-white"}`}>
                        {rewardCode}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded uppercase font-bold transition-all duration-300 flex items-center gap-1 ${isCopied ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"}`}>
                        {isCopied ? (
                          <>
                            <span>Copied</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </>
                        ) : (
                          "Copy"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={handleClaimClick}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-1"
              >
                <span className="mr-2 text-xl">🎁</span>
                <span className="text-lg">Claim Your Reward</span>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default BadgeSection;
