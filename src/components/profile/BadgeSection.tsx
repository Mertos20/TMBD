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

const BADGE_ICONS: Record<number, string> = {
  1: "⭐",
  2: "💬",
  3: "❤️",
  4: "📅",
  5: "🎵",
};

const BadgeSection = ({ 
  badges, 
  isOwnProfile, 
  username, 
  allUnlocked, 
  rewardCode, 
  onClaimReward 
}: BadgeSectionProps) => {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-4 text-center">
        {isOwnProfile ? "Your Badges" : `${username}'s Badges`}
      </h2>
      <div className="flex flex-wrap justify-center gap-6">
        {badges.map((badge) => (
          <div key={badge.id} className="flex flex-col items-center w-24 text-center">
            <div 
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 border-4 transition-all duration-500 ${
                badge.unlocked 
                  ? "bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 shadow-lg scale-110" 
                  : "bg-gray-300 border-gray-400 grayscale opacity-50"
              }`}
            >
              {BADGE_ICONS[badge.id] || "🏆"}
            </div>
            <h3 className={`font-bold text-sm ${badge.unlocked ? "text-yellow-600" : "text-gray-500"}`}>
              {badge.name}
            </h3>
            <p className="text-xs opacity-70">{badge.current}/{badge.target}</p>
          </div>
        ))}
      </div>

      {isOwnProfile && allUnlocked && (
        <div className="flex justify-center mt-8">
          {rewardCode ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg text-center">
              <p className="font-bold text-lg mb-2">🎉 Congratulations! 🎉</p>
              <p className="mb-2">You won a double cinema ticket valid at all Paribu Cineverse theaters!</p>
              <p className="font-mono text-2xl bg-white px-4 py-2 rounded border border-green-200 inline-block">
                {rewardCode}
              </p>
            </div>
          ) : (
            <button
              onClick={onClaimReward}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform animate-bounce"
            >
              🎁 View Reward Code
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default BadgeSection;
