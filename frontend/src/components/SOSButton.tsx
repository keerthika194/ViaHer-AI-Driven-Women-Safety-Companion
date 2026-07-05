import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useRouteStore } from "../store/routeStore";
import { useContactStore } from "../store/contactStore";

export default function SOSButton() {
  const { userId } = useAuthStore();
  const { safe } = useRouteStore();
  const { contacts, fetchContacts, fetched } = useContactStore();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userId && !fetched) fetchContacts();
  }, [userId, fetched]);

  const triggerSOS = async () => {
    if (!userId) return alert("Please log in to use SOS.");

    if (contacts.length === 0) {
      const goToProfile = confirm(
        "You have no trusted contacts.\n\nAdd contacts in your Profile to use SOS.\n\nGo to Profile now?"
      );
      if (goToProfile) navigate("/profile");
      return;
    }

    setSending(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        let battery_percent: number | undefined;
        try {
          const battery: any = await (navigator as any).getBattery?.();
          battery_percent = battery
            ? Math.round(battery.level * 100)
            : undefined;
        } catch {}

        try {
          const res = await api.post("/sos/trigger", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            battery_percent,
            eta_minutes: safe?.duration_min,
            route_coords: safe?.coordinates,
          });
          setSent(true);
          setMessage(
            `SOS alert sent to ${res.data.contacts_notified} contact(s)`
          );
          setTimeout(() => {
            setSent(false);
            setMessage(null);
          }, 5000);
        } catch (err: any) {
          alert(err?.response?.data?.detail ?? "SOS failed to send");
        } finally {
          setSending(false);
        }
      },
      () => {
        setSending(false);
        alert("Location permission is required to send SOS.");
      }
    );
  };

  return (
    <>
      {/* Feedback toast */}
      {message && (
        <div className="fixed bottom-28 right-8 bg-emerald-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-200/50 z-[1001] animate-slide-down">
          {message}
        </div>
      )}

      <button
        id="btn-sos"
        onClick={triggerSOS}
        disabled={sending}
        title="Send SOS to trusted contacts"
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full font-bold text-sm transition-all duration-300 z-[1000] ${
          sent
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110"
            : "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-300/50 animate-pulse-ring hover:scale-105"
        } disabled:opacity-60 disabled:animate-none`}
      >
        {sent ? "Sent" : sending ? "..." : "SOS"}
      </button>
    </>
  );
}
