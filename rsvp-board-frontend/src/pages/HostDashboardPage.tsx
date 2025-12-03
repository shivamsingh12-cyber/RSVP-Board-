import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

type Event = {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  dateTime?: string;
  code: string;
  isActive: boolean;
};

const HostDashboardPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    const res = await api.get("/events");
    setEvents(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const createEvent = async () => {
    try {
      const res = await api.post("/events", {
        title,
        description,
        location,
        dateTime,
      });
      setTitle("");
      setDescription("");
      setLocation("");
      setDateTime("");
      setError("");
      setEvents((prev) => [res.data.event, ...prev]);
    } catch (e: any) {
      setError(e.response?.data?.error || "Error");
    }
  };

  const toggleActive = async (id: string) => {
    const res = await api.post(`/events/${id}/toggle`);
    setEvents((prev) => prev.map((ev) => (ev._id === id ? res.data : ev)));
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await api.delete(`/events/${id}`);
    setEvents((prev) => prev.filter((e) => e._id !== id));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">

      {/* LEFT: Events List */}
      <div className="md:col-span-2">
        <h3 className="text-2xl font-bold mb-4 text-dark">Your Events</h3>

        {events.length === 0 && (
          <p className="text-dark-400">No events yet. Create one on the right →</p>
        )}

        <div className="space-y-4">
          {events.map((ev) => {
            const shareUrl = `${window.location.origin}/join/${ev.code}`;
            return (
              <div
                key={ev._id}
                className="bg-gray-800 border border-gray-700 p-5 rounded-xl shadow-md hover:shadow-lg transition"
              >
                <h4
                  onClick={() => navigate(`/events/${ev._id}`)}
                  className="text-xl font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  {ev.title}
                </h4>

                <p className="text-gray-300 mt-1">{ev.description}</p>
                <p className="text-gray-400">{ev.location}</p>

                {ev.dateTime && (
                  <p className="text-gray-400">
                    {new Date(ev.dateTime).toLocaleString()}
                  </p>
                )}

                <p className="mt-3 text-sm">
                  <span
                    className={`font-semibold ${
                      ev.isActive ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {ev.isActive ? "Active" : "Closed"}
                  </span>
                  {" • "}
                  Code: <code className="text-yellow-300">{ev.code}</code>
                </p>

                <div className="mt-3">
                  <span className="text-sm text-gray-400">Share link:</span>
                  <input
                    value={shareUrl}
                    readOnly
                    onFocus={(e) => e.target.select()}
                    className="w-full mt-1 p-2 bg-gray-900 border border-gray-600 rounded-md text-green-300"
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => toggleActive(ev._id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-dark rounded-md"
                  >
                    {ev.isActive ? "Close Event" : "Re-open Event"}
                  </button>

                  <button
                    onClick={() => deleteEvent(ev._id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-dark rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Create Event Form */}
   <div className="md:col-span-1">
  <h3 className="text-2xl font-bold mb-4 text-white">Create New Event</h3>

  {error && <p className="text-red-400 mb-2">{error}</p>}

  <div className="space-y-4 bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md">

    <input
      placeholder="Event title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-300"
    />

    <textarea
      placeholder="Description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      rows={3}
      className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-300"
    />

    <input
      placeholder="Location"
      value={location}
      onChange={(e) => setLocation(e.target.value)}
      className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-300"
    />

    <input
      type="datetime-local"
      value={dateTime}
      onChange={(e) => setDateTime(e.target.value)}
      className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-300"
    />

    <button
      onClick={createEvent}
      className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-md text-lg font-semibold"
    >
      Create Event
    </button>
  </div>
</div>

    </div>
  );
};

export default HostDashboardPage;
