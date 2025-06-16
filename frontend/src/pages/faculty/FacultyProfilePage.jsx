// src/pages/faculty/FacultyProfilePage.jsx
import React, { useState, useEffect } from "react";

// A reusable Modal component
const Modal = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

const FacultyProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const fetchProfile = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("http://localhost:3000/api/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch profile.");
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading)
    return <div className="text-center p-10">Loading Profile...</div>;
  if (error)
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>

      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="label">Full Name</label>
            <p className="value">{profile?.teacher_name}</p>
          </div>
          <div>
            <label className="label">Email Address</label>
            <p className="value">{profile?.email}</p>
          </div>
          <div>
            <label className="label">Account Type</label>
            <p className="value capitalize">{profile?.provider}</p>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 flex justify-end gap-4">
          {profile?.provider === "local" && (
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="btn btn-secondary"
            >
              Change Password
            </button>
          )}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-primary"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={profile}
        onProfileUpdate={fetchProfile} // Refetch profile on successful update
      />
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

// Edit Profile Modal Component
const EditProfileModal = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdate,
}) => {
  const [name, setName] = useState(currentUser?.teacher_name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(currentUser?.teacher_name || "");
    setEmail(currentUser?.email || "");
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("http://localhost:3000/api/profile/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Failed to update.");
      alert("Profile updated successfully!");
      onProfileUpdate(); // Callback to refetch data on the main page
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div>
          <label htmlFor="name" className="label">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label htmlFor="email" className="label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input w-full"
          />
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Change Password Modal Component
const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(
        "http://localhost:3000/api/profile/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.msg || "Failed to change password.");
      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(onClose, 2000); // Close modal after 2 seconds on success
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-6">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <div>
          <label htmlFor="currentPassword" className="label">
            Current Password
          </label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="label">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input w-full"
          />
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Update Password
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FacultyProfilePage;
