// src/pages/admin/RoomsListPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const RoomsListPage = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("http://localhost:3000/api/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch rooms.");
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleDelete = async (roomId, roomName) => {
    if (window.confirm(`Are you sure you want to delete room: ${roomName}?`)) {
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(
          `http://localhost:3000/api/rooms/${roomId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to delete room.");
        alert("Room deleted successfully!");
        fetchRooms(); // Refresh list
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Rooms Management
          </h1>
          <p className="mt-1 text-slate-600">
            Manage all classrooms, labs, and facilities.
          </p>
        </div>
        <Link to="/admin/rooms/new" className="btn btn-primary">
          Add Room
        </Link>
      </div>
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="th">Room Name</th>
              <th className="th">Capacity</th>
              <th className="th">Type</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan="4" className="td text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.room_id}>
                  <td className="td font-medium">{room.room_name}</td>
                  <td className="td">{room.capacity || "N/A"}</td>
                  <td className="td">
                    <span
                      className={`badge ${
                        room.is_lab ? "badge-teal" : "badge-sky"
                      }`}
                    >
                      {room.is_lab ? "Lab" : "Classroom"}
                    </span>
                  </td>
                  <td className="td">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/rooms/edit/${room.room_id}`}
                        title="Edit"
                        className="p-2 text-slate-500 hover:text-sky-600 rounded-full hover:bg-sky-50"
                      >
                        <img
                          src="/src/assets/icons/pencil.svg"
                          alt="Edit"
                          className="w-5 h-5"
                        />
                      </Link>
                      <button
                        onClick={() =>
                          handleDelete(room.room_id, room.room_name)
                        }
                        title="Delete"
                        className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-50"
                      >
                        <img
                          src="/src/assets/icons/trash-2.svg"
                          alt="Delete"
                          className="w-5 h-5"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomsListPage;
