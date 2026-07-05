import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useRouteStore } from "../store/routeStore";
import { useContactStore } from "../store/contactStore";
import MapView from "../components/MapView";
import RouteComparisonCard from "../components/RouteComparisonCard";
import SOSButton from "../components/SOSButton";

export default function Home() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactBannerDismissed, setContactBannerDismissed] = useState(false);
  const setRoutes = useRouteStore((s) => s.setRoutes);
  const clearRoutes = useRouteStore((s) => s.clearRoutes);
  const { userId } = useAuthStore();
  const { contacts, fetchContacts, fetched } = useContactStore();
  const navigate = useNavigate();

  // Live clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Fetch contacts for banner
  useEffect(() => {
    if (userId && !fetched) fetchContacts();
  }, [userId, fetched]);

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const dayStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  const search = async () => {
    setError(null);
    if (!origin || !destination)
      return setError(
        "Please enter both a starting point and a destination."
      );
    setLoading(true);
    clearRoutes();
    try {
      const res = await api.post("/routes/compare", {
        origin_address: origin,
        destination_address: destination,
      });
      setRoutes(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          "Route search failed. Check that both places exist in the loaded city map."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) search();
  };

  const showContactBanner =
    userId && fetched && contacts.length === 0 && !contactBannerDismissed;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Find your{" "}
          <span className="bg-gradient-to-r from-via-500 to-pink-500 bg-clip-text text-transparent">
            safest route
          </span>
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Fast when it matters. Safe when it counts. ViaHer helps you choose the
          better route.
        </p>

        {/* Time + Day pill */}
        <div className="inline-flex items-center gap-2 text-via-500 text-sm font-medium mt-4 bg-white/60 backdrop-blur-sm rounded-full px-4 py-1.5 border border-via-100 shadow-sm">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {dayStr} | {timeStr}
        </div>
      </div>

      {/* ── Contact banner ────────────────────────────────────────── */}
      {showContactBanner && (
        <div className="bg-white/80 backdrop-blur border border-via-100 rounded-xl px-4 py-3 mb-5 flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-via-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            <p className="text-sm text-gray-600">
              Add trusted contacts to enable SOS emergency alerts.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <button
              onClick={() => navigate("/profile")}
              className="text-sm font-semibold text-via-600 hover:text-via-700 transition px-3 py-1 rounded-lg hover:bg-via-50"
            >
              Add now
            </button>
            <button
              onClick={() => setContactBannerDismissed(true)}
              className="text-xs text-gray-400 hover:text-gray-500 transition px-2 py-1"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* ── Search card ───────────────────────────────────────────── */}
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md shadow-gray-200/40 border border-gray-100 p-5 mb-6 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Origin */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-via-400 pointer-events-none"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <input
              id="input-origin"
              className="border border-gray-200 focus:border-via-400 focus:ring-2 focus:ring-via-100 outline-none w-full p-3 pl-10 rounded-xl text-sm transition bg-gray-50/80 focus:bg-white placeholder:text-gray-400"
              placeholder="Starting point (e.g. Porur, Chennai)"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Destination */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-via-400 pointer-events-none"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                clipRule="evenodd"
              />
            </svg>
            <input
              id="input-destination"
              className="border border-gray-200 focus:border-via-400 focus:ring-2 focus:ring-via-100 outline-none w-full p-3 pl-10 rounded-xl text-sm transition bg-gray-50/80 focus:bg-white placeholder:text-gray-400"
              placeholder="Destination (e.g. Guindy, Chennai)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Search button */}
          <button
            id="btn-find-route"
            onClick={search}
            disabled={loading}
            className="bg-gradient-to-r from-via-600 to-pink-600 hover:from-via-700 hover:to-pink-700 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-via-200/40 hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Analyzing...
              </>
            ) : (
              "Find Route"
            )}
          </button>
        </div>
      </div>

      {/* ── Error banner ──────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 animate-slide-down flex items-center gap-2">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* ── Loading hint ──────────────────────────────────────────── */}
      {loading && (
        <div className="flex justify-center py-3 mb-4 animate-fade-in">
          <div className="inline-flex items-center gap-3 bg-via-50 text-via-700 rounded-full px-5 py-2.5 text-sm font-medium shadow-sm">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Computing safety scores across road network...
          </div>
        </div>
      )}

      {/* ── Map + results ─────────────────────────────────────────── */}
      <MapView />
      <RouteComparisonCard />
      <SOSButton />
    </div>
  );
}
