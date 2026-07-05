import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const fields: { key: string; label: string; type: string }[] = [
    { key: "name", label: "Full name", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "password", label: "Password", type: "password" },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white/90 backdrop-blur rounded-2xl shadow-lg shadow-gray-200/40 border border-gray-100 p-8 animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-via-500 to-pink-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-via-200 mb-3">
            V
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Create account</h1>
          <p className="text-gray-400 text-sm mt-1">Join ViaHer</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {fields.map((f) => (
            <input
              key={f.key}
              id={`register-${f.key}`}
              className="border border-gray-200 focus:border-via-400 focus:ring-2 focus:ring-via-100 outline-none w-full p-3 rounded-xl text-sm transition bg-gray-50/80 focus:bg-white"
              placeholder={f.label}
              type={f.type}
              value={(form as any)[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          ))}
          {error && (
            <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="bg-gradient-to-r from-via-600 to-pink-600 hover:from-via-700 hover:to-pink-700 text-white w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-via-200/40 hover:shadow-lg disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <p className="text-sm text-center text-gray-400 mt-5">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-via-600 font-medium hover:text-via-700 transition"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
