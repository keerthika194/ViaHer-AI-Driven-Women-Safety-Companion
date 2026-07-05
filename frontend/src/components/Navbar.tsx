import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { userId } = useAuthStore();
  const navigate = useNavigate();

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm sticky top-0 z-[1000]">
      {/* Gradient accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-via-500 via-pink-400 to-via-600" />

      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-via-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-via-200 group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
            V
          </div>
          <div>
            <p className="font-extrabold text-lg text-gray-900 leading-none tracking-tight">
              ViaHer
            </p>
            <p className="text-[11px] text-gray-400 leading-none mt-0.5">
              safety-first navigation
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {userId ? (
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-via-600 transition px-3 py-2 rounded-lg hover:bg-via-50"
              title="Your Profile"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              Profile
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-medium text-gray-500 hover:text-via-600 transition px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Log in
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-sm font-medium bg-gradient-to-r from-via-600 to-pink-600 hover:from-via-700 hover:to-pink-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-via-200 hover:shadow-lg"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
