import React, { useState, useEffect } from 'react';

interface ClapperboardProps {
  onAnimationEnd?: () => void;
}

const Clapperboard: React.FC<ClapperboardProps> = ({ onAnimationEnd }) => {
  const [clapState, setClapState] = useState<'open' | 'closed' | 'finished'>('open');

  useEffect(() => {
    const clapTimer = setTimeout(() => {
      setClapState('closed');
    }, 300); // Time until it claps

    const endTimer = setTimeout(() => {
      if (onAnimationEnd) {
        onAnimationEnd();
      }
      setClapState('finished');
    }, 600); // Time until it disappears and enables form

    return () => {
      clearTimeout(clapTimer);
      clearTimeout(endTimer);
    };
  }, [onAnimationEnd]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${clapState === 'finished' ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="relative w-64 h-64 flex flex-col items-center justify-center">
        
        {/* Top part (Clapper) */}
        <div 
          className={`w-60 h-12 bg-[#2b2b2b] border-4 border-white mb-1 origin-bottom-left transition-transform duration-300 ease-in-out ${clapState === 'open' ? '-rotate-[25deg] -translate-y-4' : 'rotate-0 translate-y-0'}`}
          style={{ 
            backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 20px, white 20px, white 40px)",
            zIndex: 10
          }}
        >
        </div>

        {/* Bottom part */}
        <div className="w-60 h-40 bg-[#2b2b2b] rounded-b-lg border-4 border-white flex flex-col items-center justify-center relative">
           <div className="absolute top-0 w-full h-4 bg-white opacity-20"></div>
           <span className="text-white font-bold text-2xl tracking-widest mt-4">ACTION</span>
           <div className="mt-2 flex gap-2">
             <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
             <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse delay-75"></div>
             <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse delay-150"></div>
           </div>
        </div>
        
      </div>
    </div>
  );
};

export default Clapperboard;
