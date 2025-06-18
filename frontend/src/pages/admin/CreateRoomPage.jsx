import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateRoomPage = () => {
  const navigate = useNavigate();
  const [room_name, setRoomName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [is_lab, setIsLab] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_name,
          capacity: Number(capacity) || null,
          is_lab,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Failed to create room.");
      alert("Room created successfully!");
      navigate("/admin/rooms");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Add New Room</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <label className="label">Room Name / Number</label>
          <input
            type="text"
            value={room_name}
            onChange={(e) => setRoomName(e.target.value)}
            className="input w-full"
            required
          />
        </div>
        <div>
          <label className="label">Capacity</label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="input w-full"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={is_lab}
            onChange={(e) => setIsLab(e.target.checked)}
            className="h-4 w-4 rounded"
            id="is_lab"
          />
          <label htmlFor="is_lab" className="ml-2">
            This is a lab
          </label>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/admin/rooms")}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Room
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoomPage;
