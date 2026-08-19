import React, { useEffect, useState } from "react";
import { useTheme } from "./ThemaContext";
import { API_URL } from "../config/api";

interface PowerBIAnalyticsProps {
  mode: "admin" | "profile";
  userId?: string;
}

interface AdminMetrics {
  summary: {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    totalComments: number;
    totalFavorites: number;
    totalWatchlist: number;
    totalRatings: number;
  };
  userRegistrationTrends: Array<{ date: string; registrations: number }>;
  commentTrends: Array<{ date: string; commentsCount: number }>;
  topMovies: Array<{ movieId: number; title: string; mediaType: string; favoriteCount: number }>;
}

interface UserAnalytics {
  metrics: {
    favoriteCount: number;
    watchlistCount: number;
    ratingCount: number;
    commentCount: number;
    averageRating: number;
  };
  ratingDistribution: Array<{ starScore: string; count: number }>;
}

const PowerBIAnalytics: React.FC<PowerBIAnalyticsProps> = ({ mode, userId }) => {
  const { darkMode } = useTheme();
  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"visuals" | "embed">("visuals");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // Fetch Power BI Embed Config
        const configRes = await fetch(`${API_URL}/api/powerbi/config`);
        if (configRes.ok) {
          const configData = await configRes.json();
          const targetUrl =
            mode === "admin"
              ? configData.powerBiEmbedUrlAdmin
              : configData.powerBiEmbedUrlProfile;
          if (configData.isConfigured && targetUrl) {
            setEmbedUrl(targetUrl);
          }
        }

        if (mode === "admin") {
          const res = await fetch(`${API_URL}/api/powerbi/admin-metrics`, { headers });
          if (res.ok) {
            const data = await res.json();
            setAdminMetrics(data);
          }
        } else if (mode === "profile" && userId) {
          const res = await fetch(`${API_URL}/api/powerbi/user-analytics/${userId}`, { headers });
          if (res.ok) {
            const data = await res.json();
            setUserAnalytics(data);
          }
        }
      } catch (err) {
        console.error("Error loading Power BI analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [mode, userId]);

  return (
    <div
      className={`w-full rounded-2xl p-6 shadow-xl border transition-all ${
        darkMode ? "bg-[#121824] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-700/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20">
            📊
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              Microsoft Power BI Analytics
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono uppercase">
                Live Data Stream
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {mode === "admin"
                ? "Genel platform metrikleri ve kullanıcı etkileşim analizleri"
                : "Kullanıcıya özel izleme ve değerlendirme analiz raporları"}
            </p>
          </div>
        </div>

        {/* View Switcher */}
        {embedUrl && (
          <div className="flex bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setActiveTab("visuals")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === "visuals" ? "bg-amber-500 text-black shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              📊 Visual Metrics
            </button>
            <button
              onClick={() => setActiveTab("embed")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === "embed" ? "bg-amber-500 text-black shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              🖥️ Power BI Embed
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
        </div>
      ) : activeTab === "embed" && embedUrl ? (
        <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-700/50 shadow-inner">
          <iframe
            title="Power BI Report"
            className="w-full h-full border-0"
            src={embedUrl}
            allowFullScreen={true}
          />
        </div>
      ) : mode === "admin" && adminMetrics ? (
        <div className="space-y-6">
          {/* Admin KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard
              title="Toplam Kullanıcı"
              value={adminMetrics.summary.totalUsers}
              icon="👥"
              color="amber"
              darkMode={darkMode}
            />
            <KPICard
              title="Toplam Yorum"
              value={adminMetrics.summary.totalComments}
              icon="💬"
              color="indigo"
              darkMode={darkMode}
            />
            <KPICard
              title="Favori Etkileşimi"
              value={adminMetrics.summary.totalFavorites}
              icon="❤️"
              color="rose"
              darkMode={darkMode}
            />
            <KPICard
              title="Puanlama Verisi"
              value={adminMetrics.summary.totalRatings}
              icon="⭐"
              color="emerald"
              darkMode={darkMode}
            />
          </div>

          {/* Top Favorites Bar Representation */}
          <div
            className={`p-5 rounded-xl border ${
              darkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}
          >
            <h4 className="text-sm font-semibold mb-4 flex items-center justify-between">
              <span>🔥 En Çok Favorilenen İçerikler (Power BI Data Feed)</span>
              <span className="text-[11px] text-amber-500 font-mono">Dataset Stream Ready</span>
            </h4>
            <div className="space-y-3">
              {adminMetrics.topMovies.map((movie) => (
                <div key={movie.movieId} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{movie.title}</span>
                    <span className="font-mono text-amber-400">{movie.favoriteCount} Favori</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (movie.favoriteCount / (adminMetrics.topMovies[0]?.favoriteCount || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : mode === "profile" && userAnalytics ? (
        <div className="space-y-6">
          {/* User Profile Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard
              title="Ortalama Puan"
              value={`${userAnalytics.metrics.averageRating} / 5`}
              icon="⭐"
              color="amber"
              darkMode={darkMode}
            />
            <KPICard
              title="Favori Sayısı"
              value={userAnalytics.metrics.favoriteCount}
              icon="❤️"
              color="rose"
              darkMode={darkMode}
            />
            <KPICard
              title="İzleme Listesi"
              value={userAnalytics.metrics.watchlistCount}
              icon="📌"
              color="indigo"
              darkMode={darkMode}
            />
            <KPICard
              title="Yaptığı Yorumlar"
              value={userAnalytics.metrics.commentCount}
              icon="✍️"
              color="emerald"
              darkMode={darkMode}
            />
          </div>

          {/* Rating Distribution Chart */}
          <div
            className={`p-5 rounded-xl border ${
              darkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}
          >
            <h4 className="text-sm font-semibold mb-4">⭐ Puan Dağılım İstatistiği</h4>
            <div className="grid grid-cols-5 gap-2">
              {userAnalytics.ratingDistribution.map((item) => (
                <div key={item.starScore} className="flex flex-col items-center gap-2">
                  <div className="w-full bg-slate-800/80 rounded-lg h-32 relative flex items-end p-1">
                    <div
                      className="w-full bg-amber-500 rounded-md transition-all duration-500"
                      style={{
                        height: `${Math.min(
                          100,
                          (item.count /
                            Math.max(...userAnalytics.ratingDistribution.map((d) => d.count), 1)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-medium">{item.starScore}</span>
                  <span className="text-xs font-mono text-amber-400">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-slate-400 text-sm">
          Analiz verileri yüklenirken bir hata oluştu veya veri bulunamadı.
        </div>
      )}
    </div>
  );
};

export default PowerBIAnalytics;

function KPICard({
  title,
  value,
  icon,
  color,
  darkMode,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl border flex flex-col justify-between ${
        darkMode ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
        <span>{title}</span>
        <span className="text-base">{icon}</span>
      </div>
      <div className="text-2xl font-bold font-mono tracking-tight">{value}</div>
    </div>
  );
}
