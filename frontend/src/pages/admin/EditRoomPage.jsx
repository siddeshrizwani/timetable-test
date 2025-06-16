import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const EditRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // Form state
  const [roomName, setRoomName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isLab, setIsLab] = useState(false);

  // Control state
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchRoomData = async () => {
      const token = localStorage.getItem("authToken");
      setIsDataLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/rooms/${roomId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.msg || "Failed to fetch room data.");

        setRoomName(data.room_name);
        setCapacity(data.capacity || "");
        setIsLab(data.is_lab || false);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchRoomData();
  }, [roomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("authToken");
    const roomData = {
      room_name: roomName,
      capacity: Number(capacity) || null,
      is_lab: isLab,
    };

    try {
      const response = await fetch(
        `http://localhost:3000/api/rooms/${roomId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(roomData),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Failed to update room.");

      setSuccess("Room updated successfully!");
      setTimeout(() => navigate("/admin/rooms"), 1500); // Redirect after a short delay
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return <div className="text-center p-10">Loading Room Data...</div>;
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to="/admin/rooms"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Rooms List
        </Link>
        <h1 className="text-3xl font-bold text-slate-800">Edit Room</h1>
        <p className="mt-1 text-slate-600">
          Update the details for "{roomName}".
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}

        <div>
          <label htmlFor="roomName" className="label">
            Room Name / Number
          </label>
          <input
            id="roomName"
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="input w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="capacity" className="label">
            Capacity
          </label>
          <input
            id="capacity"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="e.g., 60"
            className="input w-full"
            min="0"
          />
        </div>
        <div className="flex items-center">
          <input
            id="isLab"
            type="checkbox"
            checked={isLab}
            onChange={(e) => setIsLab(e.target.checked)}
            className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="isLab" className="ml-2 block text-sm text-slate-900">
            This is a lab
          </label>
        </div>
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate("/admin/rooms")}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRoomPage;
