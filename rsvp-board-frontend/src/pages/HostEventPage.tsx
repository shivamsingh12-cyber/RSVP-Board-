import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { getSocket } from "../socket";

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

const HostEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dateTime, setDateTime] = useState<string | null>(null);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/events/${id}`);
      const { event, rsvps, messages } = res.data;
      setTitle(event.title);
      setDescription(event.description);
      setLocation(event.location);
      setDateTime(event.dateTime);
      setCode(event.code);
      setRsvps(rsvps);
      setMessages(messages);
    };
    if (id) load();
  }, [id]);

  useEffect(() => {
    if (!code) return;
    const socket = getSocket();
    socket.emit("join_event", code);

    const handleRsvp = (list: Rsvp[]) => setRsvps(list);
    const handleMessage = (msg: Message) =>
      setMessages((prev) => [msg, ...prev].slice(0, 50));

    socket.on("rsvp_update", handleRsvp);
    socket.on("chat_message", handleMessage);

    return () => {
      socket.off("rsvp_update", handleRsvp);
      socket.off("chat_message", handleMessage);
    };
  }, [code]);

  const shareUrl = code ? `${window.location.origin}/join/${code}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const yesCount = rsvps.filter((r) => r.status === "yes").length;
  const noCount = rsvps.filter((r) => r.status === "no").length;
  const maybeCount = rsvps.filter((r) => r.status === "maybe").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">

      {/* LEFT SIDE - Event Details */}
      <div className="lg:col-span-2 space-y-6">

        {/* Event Card */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg">
          <h3 className="text-3xl font-semibold text-dark mb-2">
            {title}
          </h3>

          <p className="text-dark-300 mb-3">{description}</p>
          <p className="text-dark-300">{location}</p>

          {dateTime && (
            <p className="text-dark-400 mt-1">
              {new Date(dateTime).toLocaleString()}
            </p>
          )}

          {/* Share link input */}
          <div className="mt-4">
            <label className="text-dark-300 text-sm">Share Link</label>
            <div className="flex mt-1">
              <input
                className="flex-1 bg-black/30 text-dark-200 p-2 rounded-l border border-gray-600 outline-none"
                value={shareUrl}
                readOnly
              />
              <button
                onClick={copyLink}
                className="bg-blue-600 hover:bg-blue-700 px-4 rounded-r text-dark text-sm"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* Guest List */}
        <div className="bg-white/10 backdrop-blur p-6 rounded-xl border border-white/10 shadow-md">
          <h4 className="text-xl font-semibold text-dark mb-4">
            Live Guest List
          </h4>

          <p className="text-dark-300 mb-3">
            <span className="text-green-400 font-semibold">Yes: {yesCount}</span>{" "}
            | <span className="text-yellow-400 font-semibold">Maybe: {maybeCount}</span>{" "}
            | <span className="text-red-400 font-semibold">No: {noCount}</span>
          </p>

          <ul className="space-y-2">
            {rsvps.map((r) => (
              <li
                key={r._id}
                className="bg-black/20 p-2 rounded flex justify-between text-dark"
              >
                <span>{r.name}</span>
                <span
                  className={
                    r.status === "yes"
                      ? "text-green-400"
                      : r.status === "maybe"
                      ? "text-yellow-300"
                      : "text-red-400"
                  }
                >
                  {r.status.toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* RIGHT SIDE - Chat */}
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur p-6 rounded-xl border border-white/10 shadow-lg h-[500px] flex flex-col">
          <h4 className="text-xl font-semibold text-dark mb-4">Recent Chat</h4>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {messages.length === 0 && (
              <p className="text-dark-400">No messages yet.</p>
            )}

            {messages.map((m) => (
              <div
                key={m.id || m._id}
                className="bg-black/20 p-3 rounded-lg text-dark"
              >
                <p className="font-semibold">{m.name}</p>
                <p className="text-dark-300">{m.text}</p>
                <small className="text-dark-500">
                  {new Date(m.createdAt).toLocaleTimeString()}
                </small>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default HostEventPage;
