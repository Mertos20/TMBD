import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../components/ThemaContext";

const API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w200";

interface Comment {
  _id: string;
  movieId: string;
  media_type?: "movie" | "tv";
  username: string;
  comment: string;
  rating: number;
}

interface MovieData {
  id: string;
  title?: string;
  name?: string;
  poster_path?: string;
}

interface Favorite {
  _id: string;
  movieId: number;
  media_type?: "movie" | "tv";
  poster_path: string;
  title?: string;
  name?: string;
}

interface Watchlist {
  _id: string;
  movieId: number;
  media_type?: "movie" | "tv";
  poster_path: string;
  title?: string;
  name?: string;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  current: number;
  target: number;
  unlocked: boolean;
}

const ProfilePage = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams(); // URL'den gelen ID

  const [username, setUsername] = useState("");
  const [comments, setComments] = useState<(Comment & MovieData)[]>([]);
  const [userRatings, setUserRatings] = useState<{ movieId: number; rating: number }[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [watchlist, setWatchlist] = useState<Watchlist[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [allUnlocked, setAllUnlocked] = useState(false);
  const [rewardCode, setRewardCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFavorites, setShowFavorites] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowModal, setShowFollowModal] = useState<"followers" | "following" | null>(null);
  const [modalUsers, setModalUsers] = useState<{ _id: string; username: string }[]>([]);
  
  // Privacy states
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [canViewProfile, setCanViewProfile] = useState(true);
  const [myPrivacySetting, setMyPrivacySetting] = useState(false);
  const [followRequests, setFollowRequests] = useState<any[]>([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  
  // Eğer URL'de ID varsa onu kullan, yoksa kendi ID'mizi kullan
  const targetUserId = paramUserId || currentUserId;
  const isOwnProfile = targetUserId === currentUserId;

  // 🔴 Navbar ile aynı logout fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    window.location.href = "/login"; 
  };

  // ► Kullanıcı + yorumlar + favoriler + watchlist fetch
  useEffect(() => {
    if (!token || !targetUserId) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      // Reset states to avoid showing stale data
      setComments([]);
      setFavorites([]);
      setWatchlist([]);
      setUserRatings([]);
      setBadges([]);
      setIsFollowing(false);
      setHasPendingRequest(false);
      
      try {
        // 1. Kullanıcı Bilgisi
        const userRes = await fetch(`http://localhost:5000/api/auth/user/${targetUserId}`);
        const userData = await userRes.json();

        if (isOwnProfile) {
          setUsername(localStorage.getItem("username") || "");
          // Fetch my privacy setting
          const privacyRes = await fetch("http://localhost:5000/api/auth/privacy-status", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (privacyRes.ok) {
            const privacyData = await privacyRes.json();
            setMyPrivacySetting(privacyData.isPrivate);
          }
          // Fetch follow requests
          const requestsRes = await fetch("http://localhost:5000/api/friends/requests", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (requestsRes.ok) {
            setFollowRequests(await requestsRes.json());
          }
        } else {
          setUsername(userData.username);
          setIsPrivateAccount(userData.isPrivate || false);
          
          // Check if following
          const amIFollowing = userData.followers?.includes(currentUserId);
          setIsFollowing(amIFollowing);
          
          // Check if can view profile (not private OR already following)
          if (userData.isPrivate && !amIFollowing) {
            setCanViewProfile(false);
            // Check pending request status
            const reqStatusRes = await fetch(`http://localhost:5000/api/friends/request-status/${targetUserId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (reqStatusRes.ok) {
              const reqData = await reqStatusRes.json();
              setHasPendingRequest(reqData.hasPendingRequest);
            }
          } else {
            setCanViewProfile(true);
          }
        }

        setFollowersCount(userData.followers?.length || 0);
        setFollowingCount(userData.following?.length || 0);

        // If can't view profile, skip fetching private data
        if (!isOwnProfile && userData.isPrivate && !userData.followers?.includes(currentUserId)) {
          setLoading(false);
          return;
        }

        // Yorumlar
        const commentsRes = await fetch(
          `http://localhost:5000/api/comments/user/${targetUserId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const rawComments: Comment[] = await commentsRes.json();
        const sliced = rawComments.slice(0, 5);

        // Her yorum için TMDB verisi ekle
        const enriched = await Promise.all(
          sliced.map(async (c) => {
            try {
              let type: "movie" | "tv" = "movie";
              let res = await fetch(
                `https://api.themoviedb.org/3/movie/${c.movieId}?api_key=${API_KEY}`
              );
              let data = await res.json();

              if (data.status_code) {
                res = await fetch(
                  `https://api.themoviedb.org/3/tv/${c.movieId}?api_key=${API_KEY}`
                );
                data = await res.json();
                type = "tv";
              }

              return { ...c, ...data, media_type: type };
            } catch {
              return c;
            }
          })
        );

        setComments(enriched);

        // Ratings
        const ratingsRes = await fetch(`http://localhost:5000/api/ratings/user/${targetUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ratingsRes.ok) {
          setUserRatings(await ratingsRes.json());
        }

        // Favoriler (targetUserId parametresi ile)
        const favRes = await fetch(`http://localhost:5000/api/favorites/user/${targetUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(await favRes.json());

        // Watchlist (targetUserId parametresi ile)
        const watchRes = await fetch(`http://localhost:5000/api/watchlists/user/${targetUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWatchlist(await watchRes.json());

        // Badges (Artık herkesin badge'lerini görebiliriz)
        const badgeRes = await fetch(`http://localhost:5000/api/gamification/progress?userId=${targetUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (badgeRes.ok) {
          const badgeData = await badgeRes.json();
          setBadges(badgeData.badges);
          setAllUnlocked(badgeData.allUnlocked);
          // Reward code sadece kendi profilimizde görünsün
          if (isOwnProfile) {
            setRewardCode(badgeData.rewardCode);
          } else {
            setRewardCode(null);
          }
        }

      } catch (err) {
        console.log("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [targetUserId, isOwnProfile, token]);

  const handleOpenModal = async (type: "followers" | "following") => {
    try {
      const res = await fetch(`http://localhost:5000/api/friends/${type}/${targetUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setModalUsers(data);
      setShowFollowModal(type);
    } catch (err) {
      console.error("Error fetching list:", err);
    }
  };

  const handleCloseModal = () => {
    setShowFollowModal(null);
    setModalUsers([]);
  };

  const handleFollowToggle = async () => {
    if (isFollowing) {
      // Unfollow
      try {
        await fetch(`http://localhost:5000/api/friends/unfollow/${targetUserId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
        if (isPrivateAccount) {
          setCanViewProfile(false);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Follow or send request
      try {
        const res = await fetch(`http://localhost:5000/api/friends/follow/${targetUserId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        if (data.requestSent) {
          // Private account - request sent
          setHasPendingRequest(true);
        } else {
          // Public account - followed directly
          setIsFollowing(true);
          setFollowersCount(prev => prev + 1);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleTogglePrivacy = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/toggle-private", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMyPrivacySetting(data.isPrivate);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await fetch(`http://localhost:5000/api/friends/requests/${requestId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowRequests(prev => prev.filter(r => r._id !== requestId));
      setFollowersCount(prev => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await fetch(`http://localhost:5000/api/friends/requests/${requestId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaimReward = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/gamification/claim`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRewardCode(data.code);
        alert(`Congratulations! You won a double cinema ticket valid at all Paribu Cineverse theaters for any movie you wish.\n\nHere is your code: ${data.code}`);
      } else {
        alert("Could not claim reward. Please try again.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const displayedItems = showFavorites ? favorites : watchlist;

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-800"
        }`}
      >
        Loading profile...
      </div>
    );
  }

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen pb-20`}>
      <div className={`max-w-[1300px] mx-auto p-6 mt-6 rounded-xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
        
        {/* HEADER */}
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">
              {username}
              {!isOwnProfile && isPrivateAccount && (
                <span className="ml-2 text-sm opacity-60">🔒</span>
              )}
            </h1>
            {isOwnProfile && (
              <>
                <button
                  onClick={() => navigate("/profile-detail")}
                  className="w-10 h-10 flex items-center justify-center bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors"
                  title="View Statistics"
                >
                  📊
                </button>
                <button
                  onClick={handleTogglePrivacy}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    myPrivacySetting 
                      ? "bg-yellow-500 text-white hover:bg-yellow-600" 
                      : "bg-gray-500 text-white hover:bg-gray-600"
                  }`}
                  title={myPrivacySetting ? "Account is Private" : "Account is Public"}
                >
                  {myPrivacySetting ? "🔒 Private" : "🌐 Public"}
                </button>
                {followRequests.length > 0 && (
                  <button
                    onClick={() => setShowRequestsModal(true)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold text-sm hover:bg-red-600 transition-all relative"
                  >
                    📩 Requests
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                      {followRequests.length}
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
          
          {!isOwnProfile && (
            <button
              onClick={handleFollowToggle}
              disabled={hasPendingRequest}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                isFollowing 
                  ? "bg-gray-500 text-white hover:bg-gray-600" 
                  : hasPendingRequest
                    ? "bg-yellow-500 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isFollowing ? "Unfollow" : hasPendingRequest ? "Request Sent" : "Follow"}
            </button>
          )}

          <div className="flex gap-6 text-lg">
            <button onClick={() => handleOpenModal("followers")} className="hover:underline">
              <span className="font-bold">{followersCount}</span> Followers
            </button>
            <button onClick={() => handleOpenModal("following")} className="hover:underline">
              <span className="font-bold">{followingCount}</span> Following
            </button>
          </div>
        </div>

        {/* PRIVATE ACCOUNT BLUR OVERLAY */}
        {!isOwnProfile && !canViewProfile && (
          <div className="relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 backdrop-blur-sm rounded-xl">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold mb-2">This Account is Private</h3>
                <p className="opacity-70 mb-4">Follow this user to see their content</p>
                {hasPendingRequest ? (
                  <p className="text-yellow-400 font-semibold">Follow request sent</p>
                ) : (
                  <button
                    onClick={handleFollowToggle}
                    className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all"
                  >
                    Send Follow Request
                  </button>
                )}
              </div>
            </div>
            
            {/* Blurred placeholder content */}
            <div className="filter blur-lg pointer-events-none opacity-50 min-h-[400px]">
              <div className="grid grid-cols-5 gap-4 p-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="aspect-[2/3] bg-gray-600 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTENT - Only show if can view profile */}
        {(isOwnProfile || canViewProfile) && (
          <>
        {/* BADGES */}
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
                  {badge.id === 1 && "⭐"}
                  {badge.id === 2 && "💬"}
                  {badge.id === 3 && "❤️"}
                  {badge.id === 4 && "📅"}
                  {badge.id === 5 && "🎵"}
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
                  onClick={handleClaimReward}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform animate-bounce"
                >
                  🎁 View Reward Code
                </button>
              )}
            </div>
          )}
        </section>

        {/* LAST COMMENTS */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            {isOwnProfile ? "Your" : `${username}'s`} Last 5 Comments
          </h2>

          {comments.length === 0 ? (
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              No comments yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => {
                const ratingVal = userRatings.find((r) => r.movieId === Number(c.movieId))?.rating || 0;
                return (
                <li
                  key={c._id}
                  className={`flex overflow-hidden border rounded ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-200 border-gray-300"
                  }`}
                >
                  <Link to={`/${c.media_type}/${c.id}`}>
                    {c.poster_path && (
                      <img
                        src={`${IMAGE_BASE}${c.poster_path}`}
                        className="w-[80px] md:w-[100px]"
                        alt=""
                      />
                    )}
                  </Link>
                  <div className="p-3 flex-1">
                    <h3 className="font-bold">{c.title || c.name}</h3>
                    <p>{c.comment}</p>
                    <div className="flex items-center gap-1 text-sm opacity-70 mt-1">
                      <span>Rating:</span>
                      {ratingVal > 0 ? (
                        <>
                          <span className="text-yellow-500 text-lg">★</span>
                          <span>{ratingVal}/5</span>
                        </>
                      ) : (
                        <span>Not Rated</span>
                      )}
                    </div>
                  </div>
                </li>
              )})}
            </ul>
          )}
        </section>

        {/* FAVORITES / WATCHLIST TOGGLE */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setShowFavorites(true)}
            className={`px-6 py-2 font-semibold rounded-full transition ${
              showFavorites ? "bg-[#0d253f] text-[#1ed5a9]" : "hover:bg-[#0d253f1a]"
            }`}
          >
            Favorites
          </button>

          <button
            onClick={() => setShowFavorites(false)}
            className={`px-6 py-2 font-semibold rounded-full transition ${
              !showFavorites ? "bg-[#0d253f] text-[#1ed5a9]" : "hover:bg-[#0d253f1a]"
            }`}
          >
            Watchlist
          </button>
        </div>

        {/* MOVIE LIST */}
        <div className="overflow-x-auto scrollbar-hide">
          <ul className="flex gap-4 snap-x snap-mandatory">
            {displayedItems.length === 0 ? (
              <p className="w-full text-center py-10 opacity-70">
                No {showFavorites ? "favorites" : "watchlist"} found.
              </p>
            ) : (
              displayedItems.map((m) => (
                <li key={m.movieId} className="snap-start">
                  <Link to={`/${m.media_type}/${m.movieId}`}>
                    <div className="w-[120px] md:w-[150px] text-center">
                      {m.poster_path ? (
                        <img
                          src={`${IMAGE_BASE}${m.poster_path}`}
                          className="rounded-xl shadow-md"
                        />
                      ) : (
                        <div className="w-[120px] h-[180px] bg-gray-600 rounded-xl" />
                      )}
                      <p className="mt-2 text-sm">{m.title || m.name}</p>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </>
      )}
      </div>

      {isOwnProfile && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition"
          >
            Çıkış Yap
          </button>
        </div>
      )}

      {/* FOLLOW REQUESTS MODAL */}
      {showRequestsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} p-6 rounded-xl w-96 max-h-[80vh] overflow-y-auto shadow-2xl`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Follow Requests</h2>
              <button onClick={() => setShowRequestsModal(false)} className="text-2xl hover:text-red-500">&times;</button>
            </div>
            <ul className="space-y-3">
              {followRequests.map((req) => (
                <li key={req._id} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <Link to={`/profile/${req.from._id}`} onClick={() => setShowRequestsModal(false)} className="font-semibold hover:text-blue-500">
                    {req.from.username}
                  </Link>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(req._id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
              {followRequests.length === 0 && <p className="text-center opacity-70">No pending requests.</p>}
            </ul>
          </div>
        </div>
      )}

      {/* FOLLOW MODAL */}
      {showFollowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} p-6 rounded-xl w-96 max-h-[80vh] overflow-y-auto shadow-2xl`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold capitalize">{showFollowModal}</h2>
              <button onClick={handleCloseModal} className="text-2xl hover:text-red-500">&times;</button>
            </div>
            <ul className="space-y-3">
              {modalUsers.map((u) => (
                <li key={u._id} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <Link to={`/profile/${u._id}`} onClick={handleCloseModal} className="font-semibold hover:text-blue-500">
                    {u.username}
                  </Link>
                </li>
              ))}
              {modalUsers.length === 0 && <p className="text-center opacity-70">No users found.</p>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
