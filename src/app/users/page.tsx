"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, User, Mail, Calendar, Trash2, Pencil, Search, Loader2 } from "lucide-react";
import { getUsers, createUser, updateUser, deleteUser, getMe, mapUserFromAPI } from "@/lib/api";
import ConfirmModal from "@/components/ConfirmModal";
import { userFormSchema, updateUserSchema } from "@/lib/schemas";
import { formatZodErrors } from "@/lib/validate";

interface UserType {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  createdAt: Date;
  lastLogin?: Date;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
    getMe().then((user) => setCurrentUserId(user.id)).catch(() => {});
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");
      const data = await getUsers();
      setUsers(data.map(mapUserFromAPI));
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    status: "active" as "active" | "inactive",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", confirmPassword: "", status: "active" });
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserType) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: "", confirmPassword: "", status: user.status });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (editingUser) {
      const result = updateUserSchema.safeParse({ name: formData.name, email: formData.email, status: formData.status });
      if (!result.success) {
        setFieldErrors(formatZodErrors(result.error));
        return;
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        setFieldErrors({ confirmPassword: 'Passwords do not match' });
        return;
      }
      const result = userFormSchema.safeParse(formData);
      if (!result.success) {
        setFieldErrors(formatZodErrors(result.error));
        return;
      }
    }

    try {
      setSaving(true);
      if (editingUser) {
        await updateUser(Number(editingUser.id), {
          name: formData.name,
          email: formData.email,
          status: formData.status,
        });
      } else {
        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          status: formData.status,
        });
      }
      closeModal();
      toast.success(editingUser ? "User updated successfully" : "User created successfully");
      await loadUsers();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string) => {
    setConfirmDelete(userId);
  };

  const confirmDeleteUser = async () => {
    if (!confirmDelete) return;
    if (currentUserId !== null && Number(confirmDelete) === currentUserId) {
      toast.error('You cannot delete your own account.');
      setConfirmDelete(null);
      return;
    }
    try {
      await deleteUser(Number(confirmDelete));
      toast.success("User deleted successfully");
      await loadUsers();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to delete user");
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    try {
      await updateUser(Number(userId), {
        name: user.name,
        email: user.email,
        status: currentStatus === "active" ? "inactive" : "active",
      });
      toast.success("User status updated successfully");
      await loadUsers();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to update user status");
    }
  };

  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600 mt-2">Manage system users and their permissions</p>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" />
            <span>Add User</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text" value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${getStatusColor(user.status)}`}
                      >
                        {user.status === "active" ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {user.createdAt.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {user.lastLogin.toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-400">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded" title="Edit user">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded" title="Delete user">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-8 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No users found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? "Try adjusting your search term" : "No users in the system"}
              </p>
            </div>
          )}
        </div>

        {isModalOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeModal} />
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-md pointer-events-auto">
                <form onSubmit={handleSubmit} className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {editingUser ? "Edit User" : "Add New User"}
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input type="text" value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setFieldErrors({}); }} className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter full name" required />
                      {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input type="email" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setFieldErrors({}); }} className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter email address" required />
                      {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                    </div>

                    {!editingUser && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                          <input type="password" value={formData.password} onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setFieldErrors({}); }} className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter password" required />
                          {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                          <input type="password" value={formData.confirmPassword} onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); setFieldErrors({}); }} className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} placeholder="Confirm password" required />
                          {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })} className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" disabled={saving}>Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2" disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      {editingUser ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}

        <ConfirmModal
          open={confirmDelete !== null}
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={confirmDeleteUser}
          onCancel={() => setConfirmDelete(null)}
        />
      </div>
    </div>
  );
}
