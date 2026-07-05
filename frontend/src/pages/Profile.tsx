import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useContactStore } from "../store/contactStore";

export default function Profile() {
  const userId = useAuthStore((s) => s.userId);
  const logout = useAuthStore((s) => s.logout);
  const contacts = useContactStore((s) => s.contacts);
  const loading = useContactStore((s) => s.loading);
  const fetchContacts = useContactStore((s) => s.fetchContacts);
  const addContact = useContactStore((s) => s.addContact);
  const deleteContact = useContactStore((s) => s.deleteContact);

  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    fetchContacts();
  }, [userId, navigate, fetchContacts]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addContact({
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
      });
      setForm({ name: "", phone: "", email: "" });
      setShowForm(false);
    } catch (_err) {
      setError("Failed to save contact.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Remove ${name} from trusted contacts?`)) {
      try {
        await deleteContact(id);
      } catch (_err) {
        alert("Failed to remove contact.");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!userId) return null;

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Your Profile
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your trusted contacts and account settings.
        </p>
      </div>

      {/* ── Trusted Contacts ──────────────────────────────────────── */}
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg shadow-gray-200/40 border border-gray-100 p-6 mb-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-gray-900">Trusted Contacts</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm font-medium text-via-600 hover:text-via-700 transition px-3 py-1.5 rounded-lg hover:bg-via-50"
            >
              + Add
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-4">
          These contacts will be notified when you trigger an SOS alert.
        </p>

        {/* Add Contact Form */}
        {showForm && (
          <form
            onSubmit={handleAdd}
            className="border border-via-100 bg-via-50/30 rounded-xl p-4 mb-4 space-y-3 animate-slide-down"
          >
            <input
              className="border border-gray-200 focus:border-via-400 focus:ring-2 focus:ring-via-100 outline-none w-full p-2.5 rounded-lg text-sm transition bg-white"
              placeholder="Contact name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="border border-gray-200 focus:border-via-400 focus:ring-2 focus:ring-via-100 outline-none w-full p-2.5 rounded-lg text-sm transition bg-white"
              placeholder="Phone number"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              className="border border-gray-200 focus:border-via-400 focus:ring-2 focus:ring-via-100 outline-none w-full p-2.5 rounded-lg text-sm transition bg-white"
              placeholder="Email (optional)"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {error && (
              <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-via-600 to-pink-600 text-white py-2.5 rounded-lg text-sm font-semibold transition-all hover:from-via-700 hover:to-pink-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Contact"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Contacts List */}
        {loading ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            Loading contacts...
          </p>
        ) : contacts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <svg
              className="w-10 h-10 mx-auto mb-3 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
            <p className="text-sm font-medium">No contacts yet</p>
            <p className="text-xs mt-1">
              Add trusted contacts to use the SOS feature.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 group hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-via-100 text-via-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {[c.phone, c.email].filter(Boolean).join("  ·  ") ||
                        "No details"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  className="text-xs text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100 px-2 py-1 rounded"
                  title="Remove contact"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Log out ───────────────────────────────────────────────── */}
      <button
        onClick={handleLogout}
        className="w-full text-sm font-medium text-gray-500 hover:text-red-500 transition py-3 rounded-xl hover:bg-red-50/50 border border-gray-200 bg-white/60"
      >
        Log out
      </button>
    </div>
  );
}
