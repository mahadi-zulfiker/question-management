import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/userManagement', { cache: 'no-store' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched users:', data); // Debug: Log fetched data
      // Ensure each user has a unique _id
      const usersWithUniqueId = data.map((user, index) => ({
        ...user,
        _id: user._id || `${user.email}_${index}`, // Fallback if _id is missing
      }));
      setUsers(usersWithUniqueId);
      setLoading(false);
    } catch (err) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to fetch users: ${err.message}`,
      });
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      const previousUsers = [...users];
      setUsers(users.filter(user => user._id !== userId));
      
      try {
        const response = await fetch('/api/userManagement', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _id: userId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete');
        MySwal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: data.message || 'User deleted successfully',
        });
        await fetchUsers(); // Refresh the list
      } catch (err) {
        setUsers(previousUsers);
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to delete user: ${err.message}`,
        });
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const previousUsers = [...users];
    const updatedUser = { ...editingUser, userType: editingUser.userType }; // Keep original userType
    setUsers(users.map(user => user._id === editingUser._id ? updatedUser : user));

    try {
      const response = await fetch('/api/userManagement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: editingUser._id,
          username: editingUser.username,
          email: editingUser.email,
          userType: editingUser.userType, // Send original userType
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update');
      setUsers(users.map(user => user._id === editingUser._id ? { ...updatedUser, ...data } : user));
      setEditingUser(null);
      MySwal.fire({
        icon: 'success',
        title: 'Updated!',
        text: data.message || 'User updated successfully',
      });
      await fetchUsers(); // Refresh the list to ensure consistency
    } catch (err) {
      setUsers(previousUsers);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to update user: ${err.message}`,
      });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
          User Management Dashboard
        </h1>
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-800">
                <tr>
                  {['Username', 'Email', 'User Type', 'Actions'].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.userType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2 hover:bg-blue-700 transition-colors duration-200 shadow-md"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {editingUser && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
              <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit User</h2>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">User Type</label>
                  <input
                    type="text"
                    value={editingUser.userType}
                    disabled // Make userType uneditable
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;