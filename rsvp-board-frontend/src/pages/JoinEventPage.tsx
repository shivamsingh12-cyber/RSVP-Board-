import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { getSocket } from "../socket";

type EventInfo = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  dateTime?: string;
  code: string;
  isActive: boolean;
};

type Rsvp = {
  _id: string;
  name: string;
  status: "yes" | "no" | "maybe";
};

type Message = {
  id?: string;
  _id?: string;
  name: string;
  text: string;
  createdAt: string;
};

const JoinEventPage = () => {
  const { code } = useParams<{ code: string }>();
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"yes" | "no" | "maybe">("yes");
  const [chatText, setChatText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem(`rsvp_name_${code}`);
    if (storedName) setName(storedName);
  }, [code]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/public/events/${code}`);
        setEvent(res.data.event);
        setRsvps(res.data.rsvps);
        setMessages(res.data.messages);
      } catch (e: any) {
        setError(e.response?.data?.error || "Event not found");
      }
    };
    if (code) load();
  }, [code]);

  useEffect(() => {
    if (!code) return;
    const socket = getSocket();
    socket.emit("join_event", code);

    socket.on("rsvp_update", (list: Rsvp[]) => setRsvps(list));
    socket.on("chat_message", (msg: Message) =>
      setMessages((prev) => [msg, ...prev].slice(0, 50))
    );

    return () => {
      socket.off("rsvp_update");
      socket.off("chat_message");
    };
  }, [code]);

  const submitRsvp = async () => {
    try {
      const res = await api.post(`/public/events/${code}/rsvp`, {
        name,
        status,
      });
      setRsvps(res.data.rsvps);
      localStorage.setItem(`rsvp_name_${code}`, name);
      setError("");
    } catch (e: any) {
      setError(e.response?.data?.error || "Error submitting RSVP");
    }
  };

  const sendMessage = async () => {
    if (!chatText.trim()) return;
    try {
      await api.post(`/public/events/${code}/messages`, {
        name: name || "Guest",
        text: chatText,
      });
      setChatText("");
    } catch (e: any) {
      setError(e.response?.data?.error || "Error sending message");
    }
  };

  if (error && !event) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!event) return <div className="text-center mt-10">Loading...</div>;

  const yesCount = rsvps.filter((r) => r.status === "yes").length;
  const noCount = rsvps.filter((r) => r.status === "no").length;
  const maybeCount = rsvps.filter((r) => r.status === "maybe").length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* LEFT SIDE */}
      <div className="md:col-span-2 space-y-6">
        {/* Event Info */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl shadow-md">
          <h2 className="text-3xl font-bold text-dark mb-2">{event.title}</h2>
          <p className="text-dark-300">{event.description}</p>
          {event.location && <p className="text-dark-400 mt-2">📍 {event.location}</p>}
          {event.dateTime && (
            <p className="text-dark-400 mt-1">
              🕒 {new Date(event.dateTime).toLocaleString()}
            </p>
          )}
          {!event.isActive && (
            <p className="text-red-400 font-semibold mt-3">
              This event is closed.
            </p>
          )}
        </div>

        {/* RSVP Card */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl shadow-md space-y-4">
          <h3 className="text-xl font-semibold text-dark">Your RSVP</h3>

          {error && <p className="text-red-400">{error}</p>}

          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-white/10 text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex gap-6 text-dark">
            {["yes", "maybe", "no"].map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={status === s}
                  onChange={() => setStatus(s as any)}
                />
                {s.toUpperCase()}
              </label>
            ))}
          </div>

          <button
            onClick={submitRsvp}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 rounded-md text-dark font-semibold"
          >
            Submit RSVP
          </button>
        </div>

        {/* Guest List */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl shadow-md">
          <h4 className="text-xl font-semibold text-dark mb-2">Guest List (live)</h4>

          <p className="text-dark-300 mb-4">
            ✅ Yes: {yesCount} | ❌ No: {noCount} | ❔ Maybe: {maybeCount}
          </p>

          <ul className="space-y-2">
            {rsvps.map((r) => (
              <li
                key={r._id}
                className="text-dark bg-white/10 px-3 py-2 rounded-md"
              >
                <span className="font-semibold">{r.name}</span> –{" "}
                {r.status.toUpperCase()}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT SIDE: CHAT */}
      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl shadow-md flex flex-col h-[32rem]">
          <h3 className="text-xl font-semibold text-dark mb-4">Chat</h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.length === 0 && (
              <p className="text-dark-400">No messages yet.</p>
            )}

            {messages.map((m) => (
              <div
                key={m.id || m._id}
                className="bg-white/10 px-3 py-2 rounded-md text-dark text-sm"
              >
                <p>
                  <span className="font-bold">{m.name}:</span> {m.text}
                </p>
                <p className="text-dark-400 text-xs mt-1">
                  {new Date(m.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>

          <textarea
            placeholder="Type a message..."
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            className="w-full mt-4 px-3 py-2 rounded-md bg-white/10 text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={sendMessage}
            className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 rounded-md text-dark font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinEventPage;
