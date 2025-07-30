import React, { useState, useEffect } from "react";
import {
  Bus,
  Users,
  Plus,
  Edit2,
  Trash2,
  UserRoundCog,
} from "lucide-react";
import axios from "axios";

// Modal placeholder for Edit forms
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
    <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg relative">
      <button
        className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
        onClick={onClose}
        aria-label="Close modal"
      >
        ✕
      </button>
      {children}
    </div>
  </div>
);

const AdminDashboard = ({ token, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [buses, setBuses] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // States for modals and currently edited item
  const [editBus, setEditBus] = useState(null);
  const [editUser, setEditUser] = useState(null);

  // Authorization header helper
  const getAuthHeaders = () => (token ? { Authorization: `Token ${token}` } : {});

  // API error handler
  const handleApiError = (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        setErrMsg("Unauthorized. Please login again.");
        onLogout();
      } else if (error.response.status === 403) {
        setErrMsg("Forbidden. You do not have permission.");
      } else {
        setErrMsg(error.response.data.detail || "An error occurred.");
      }
    } else {
      setErrMsg(error.message || "Network error.");
    }
  };

  // Fetch buses
  const fetchBuses = async () => {
    setLoading(true);
    setErrMsg("");
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/admin/buses/", {
        headers: getAuthHeaders(),
      });
      setBuses(response.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setErrMsg("");
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/admin/users/", {
        headers: getAuthHeaders(),
      });
      setUsers(response.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // Delete handlers with confirmation
  const deleteBus = async (busId) => {
    if (!window.confirm("Are you sure you want to delete this bus?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/admin/buses/${busId}/`, {
        headers: getAuthHeaders(),
      });
      fetchBuses();
    } catch (error) {
      handleApiError(error);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/admin/users/${userId}/`, {
        headers: getAuthHeaders(),
      });
      fetchUsers();
    } catch (error) {
      handleApiError(error);
    }
  };

  // Tab data fetch effect
  useEffect(() => {
    if (!token) {
      setErrMsg("No authentication token. Please login.");
      return;
    }
    if (activeTab === "buses") fetchBuses();
    else if (activeTab === "users") fetchUsers();
    else setErrMsg("");
  }, [activeTab, token]);

  // Edit form for Bus (mockup)
  const BusEditForm = ({ bus, onClose }) => {
    const [formData, setFormData] = useState({
      bus_name: bus.bus_name,
      number: bus.number,
      origin: bus.origin,
      destination: bus.destination,
      status: bus.status,
    });

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.put(`http://127.0.0.1:8000/api/admin/buses/${bus.id}/`, formData, {
          headers: getAuthHeaders(),
        });
        fetchBuses();
        onClose();
      } catch (error) {
        alert("Failed to update bus.");
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-xl font-semibold mb-4">Edit Bus</h3>
        <label className="block">
          <span className="text-gray-700">Bus Name</span>
          <input
            name="bus_name"
            value={formData.bus_name}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Number</span>
          <input
            name="number"
            value={formData.number}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Origin</span>
          <input
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2"
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Destination</span>
          <input
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2"
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Status</span>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Save
          </button>
        </div>
      </form>
    );
  };

  // Edit form for User (mockup)
  const UserEditForm = ({ user, onClose }) => {
    const [formData, setFormData] = useState({
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.put(`http://127.0.0.1:8000/api/admin/users/${user.id}/`, formData, {
          headers: getAuthHeaders(),
        });
        fetchUsers();
        onClose();
      } catch (error) {
        alert("Failed to update user.");
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-xl font-semibold mb-4">Edit User</h3>
        <label className="block">
          <span className="text-gray-700">Username</span>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Email</span>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Role</span>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2"
          >
            <option value="admin">Admin</option>
            <option value="conductor">Conductor</option>
            <option value="traveler">Traveler</option>
          </select>
        </label>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Save
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-6 py-6 shadow flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Bus Supervisor Admin</h1>
          <p className="text-gray-500">Manage buses and users</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <button
            className="flex items-center bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700"
            onClick={() => alert("Add New clicked (implement modal)")}
          >
            <Plus className="mr-2" size={20} />
            Add New
          </button>
          <button
            onClick={onLogout}
            className="bg-gray-200 text-gray-700 font-medium px-5 py-2 rounded-lg hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs Bar */}
      <nav className="border-b border-gray-200 bg-white px-6">
        <ul className="flex space-x-4">
          <li>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-4 px-3 font-medium text-sm border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === "dashboard"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-blue-600"
              }`}
            >
              <Bus size={18} />
              <span>Dashboard</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => setActiveTab("buses")}
              className={`py-4 px-3 font-medium text-sm border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === "buses"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-blue-600"
              }`}
            >
              <Bus size={18} />
              <span>Buses</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-3 font-medium text-sm border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === "users"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-blue-600"
              }`}
            >
              <UserRoundCog size={18} />
              <span>Users</span>
            </button>
          </li>
        </ul>
      </nav>

      <main className="p-6 min-h-[calc(100vh-150px)] overflow-auto">
        {errMsg && <p className="text-red-600 mb-4">{errMsg}</p>}

        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6 flex items-center space-x-4 border border-gray-200">
              <Bus className="text-indigo-600" size={40} />
              <div>
                <h3 className="text-lg font-semibold">{buses.length}</h3>
                <p className="text-gray-500">Total Buses</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex items-center space-x-4 border border-gray-200">
              <Users className="text-indigo-600" size={40} />
              <div>
                <h3 className="text-lg font-semibold">{users.length}</h3>
                <p className="text-gray-500">Total Users</p>
              </div>
            </div>
          </div>
        )}

        {/* Buses Tab with cards */}
        {activeTab === "buses" && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {buses.length === 0 ? (
              <p className="text-gray-500">No buses found.</p>
            ) : (
              buses.map((bus) => (
                <div
                  key={bus.id}
                  className="bg-white rounded-xl p-6 shadow border border-gray-200 hover:shadow-lg transition-shadow relative"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{bus.bus_name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditBus(bus)}
                        title="Edit Bus"
                        className="p-1 rounded hover:bg-indigo-100"
                      >
                        <Edit2 className="text-indigo-600" size={20} />
                      </button>
                      <button
                        onClick={() => deleteBus(bus.id)}
                        title="Delete Bus"
                        className="p-1 rounded hover:bg-red-100"
                      >
                        <Trash2 className="text-red-600" size={20} />
                      </button>
                    </div>
                  </div>
                  <p><strong>Number:</strong> {bus.number}</p>
                  <p><strong>Origin:</strong> {bus.origin}</p>
                  <p><strong>Destination:</strong> {bus.destination}</p>
                  <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-sm font-semibold ${bus.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{bus.status}</span></p>
                  <p><strong>Conductors:</strong> {bus.conductors.map(c => c.username).join(", ") || "N/A"}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Users Tab with cards */}
        {activeTab === "users" && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {users.length === 0 ? (
              <p className="text-gray-500">No users found.</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-lg shadow-md p-5 flex items-center space-x-4 border border-gray-200 hover:shadow-lg transition-shadow relative"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff`}
                      alt={user.username}
                      className="h-16 w-16 rounded-full object-cover border-2 border-indigo-600"
                    />
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{user.username}</h3>
                    <p className="text-gray-500">{user.email}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      Role: <span className="font-medium">{user.role || "N/A"}</span>
                    </p>
                    <p className="text-sm mt-0.5">
                      Status:{" "}
                      {user.is_active ? (
                        <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-semibold">
                          Inactive
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => setEditUser(user)}
                      title="Edit User"
                      className="p-2 rounded hover:bg-indigo-100 text-indigo-600 disabled:opacity-50"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      title="Delete User"
                      className="p-2 rounded hover:bg-red-100 text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}


      </main>

      {editBus && (
        <Modal onClose={() => setEditBus(null)}>
          <BusEditForm bus={editBus} onClose={() => setEditBus(null)} />
        </Modal>
      )}

      {editUser && (
        <Modal onClose={() => setEditUser(null)}>
          <UserEditForm user={editUser} onClose={() => setEditUser(null)} />
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;
