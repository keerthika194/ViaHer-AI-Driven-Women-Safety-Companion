import { useRouteStore } from "../store/routeStore";

/* ── SVG Icons ──────────────────────────────────────────────────────── */
function ClockIcon() {
  return (
    <svg className="w-5 h-5 text-via-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-4 h-4 text-via-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-via-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

/* ── Safety score visual bar ────────────────────────────────────────── */
function SafetyBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  let barColor = "bg-red-500";
  let textColor = "text-red-600";
  let trackColor = "bg-red-100";
  if (score >= 75) {
    barColor = "bg-emerald-500";
    textColor = "text-emerald-600";
    trackColor = "bg-emerald-100";
  } else if (score >= 55) {
    barColor = "bg-amber-500";
    textColor = "text-amber-600";
    trackColor = "bg-amber-100";
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          Safety
        </span>
        <span className={`text-xs font-bold ${textColor}`}>{score}</span>
      </div>
      <div className={`h-2 rounded-full ${trackColor} overflow-hidden`}>
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── Main Card ──────────────────────────────────────────────────────── */
export default function RouteComparisonCard() {
  const {
    fastest,
    safe,
    timeDifference,
    explanation,
    selectedRoute,
    selectRoute,
  } = useRouteStore();

  if (!fastest || !safe) return null;

  const isFollowing = selectedRoute === "safe";

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg shadow-gray-200/40 border border-gray-100 p-6 mt-6 space-y-5 animate-fade-in-up">
      {/* ── Route cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Fastest */}
        <button
          type="button"
          onClick={() => selectRoute("fastest")}
          className={`text-left rounded-xl p-4 border-2 transition-all duration-200 ${
            selectedRoute === "fastest"
              ? "border-blue-400 bg-blue-50 shadow-md shadow-blue-100"
              : "border-gray-100 bg-gray-50/50 hover:border-blue-200 hover:bg-blue-50/40"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-300" />
            <p className="text-blue-600 font-semibold text-sm">
              Fastest Route
            </p>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {fastest.duration_min}{" "}
            <span className="text-sm font-normal text-gray-400">min</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {fastest.distance_km} km
          </p>
          <SafetyBar score={fastest.avg_safety_score} />
        </button>

        {/* Safe */}
        <button
          type="button"
          onClick={() => selectRoute("safe")}
          className={`text-left rounded-xl p-4 border-2 transition-all duration-200 ${
            selectedRoute === "safe" || !selectedRoute
              ? "border-via-400 bg-via-50 shadow-md shadow-via-100"
              : "border-gray-100 bg-gray-50/50 hover:border-via-200 hover:bg-via-50/40"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-via-500 shadow-sm shadow-via-300" />
            <p className="text-via-600 font-semibold text-sm">
              ViaHer Safe Route
            </p>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {safe.duration_min}{" "}
            <span className="text-sm font-normal text-gray-400">min</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{safe.distance_km} km</p>
          <SafetyBar score={safe.avg_safety_score} />
        </button>
      </div>

      {/* ── Time delta banner ─────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-via-50 to-pink-50 rounded-xl px-4 py-3.5 flex items-center gap-3">
        <ClockIcon />
        <p className="text-sm text-gray-700 leading-relaxed">
          {timeDifference > 0 ? (
            <>
              Only{" "}
              <span className="font-bold text-via-600">
                +{timeDifference} min
              </span>{" "}
              for a significantly safer journey.
            </>
          ) : (
            <>
              The safe route is{" "}
              <span className="font-bold text-emerald-600">just as fast</span>{" "}
              — no trade-off needed!
            </>
          )}
        </p>
      </div>

      {/* ── Why this route? ───────────────────────────────────────── */}
      <div>
        <p className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <ShieldIcon />
          <span className="text-sm">Why this route?</span>
        </p>
        <div className="space-y-2 stagger">
          {explanation.map((reason, i) => (
            <div
              key={i}
              className="flex items-start gap-3 text-sm text-gray-600 bg-gray-50/80 rounded-xl px-4 py-3 animate-fade-in-up"
            >
              <CheckIcon />
              <span className="leading-relaxed">{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA button ────────────────────────────────────────────── */}
      <button
        onClick={() => selectRoute("safe")}
        className={`w-full rounded-xl py-3.5 font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
          isFollowing
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200/50"
            : "bg-gradient-to-r from-via-600 to-pink-600 hover:from-via-700 hover:to-pink-700 text-white shadow-lg shadow-via-200/50 hover:shadow-xl hover:shadow-via-300/40 hover:-translate-y-0.5"
        }`}
      >
        {isFollowing ? (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            Following ViaHer Safe Route
          </>
        ) : (
          "Use ViaHer Safe Route"
        )}
      </button>
    </div>
  );
}
