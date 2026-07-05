import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const decoded = JSON.parse(atob(res.data.access_token.split(".")[1]));
      login(res.data.access_token, decoded.sub);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white/90 backdrop-blur rounded-2xl shadow-lg shadow-gray-200/40 border border-gray-100 p-8 animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-via-500 to-pink-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-via-200 mb-3">
            V
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Log in to ViaHer</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            id="login-email"
            className="border border-gray-200 focus:border-via-400 focus:ring-2 focus:ring-via-100 outline-none w-full p-3 rounded-xl text-sm transition bg-gray-50/80 focus:bg-white"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            id="login-password"
            className="border border-gray-200 focus:border-via-400 focus:ring-2 focus:ring-via-100 outline-none w-full p-3 rounded-xl text-sm transition bg-gray-50/80 focus:bg-white"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="bg-gradient-to-r from-via-600 to-pink-600 hover:from-via-700 hover:to-pink-700 text-white w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-via-200/40 hover:shadow-lg disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="text-sm text-center text-gray-400 mt-5">
          No account?{" "}
          <a
            href="/register"
            className="text-via-600 font-medium hover:text-via-700 transition"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
