import { apiCall } from "../context/AuthContext";

// ================== USERS API ==================

// Fetch all users with optional filters (Admin only)
export const fetchUsers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    
    const queryString = params.toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiCall("get", endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    // Return empty array instead of throwing
    return [];
  }
};

// Fetch single user by ID (Admin only)
export const fetchUserById = async (id) => {
  try {
    const response = await apiCall("get", `/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// Update user role (Admin only)
export const updateUserRole = async (userId, role) => {
  try {
    const response = await apiCall("put", `/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

// Update user status (Admin only)
export const updateUserStatus = async (userId, isActive) => {
  try {
    const response = await apiCall("put", `/admin/users/${userId}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};

// Delete user (Admin only)
export const deleteUser = async (userId) => {
  try {
    const response = await apiCall("delete", `/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Get user statistics (Admin only)
export const fetchUsersStats = async () => {
  try {
    const response = await apiCall("get", "/admin/users/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching users stats:", error);
    return { 
      total: 0, 
      admins: 0, 
      customers: 0,
      active: 0,
      inactive: 0,
      verified: 0,
      unverified: 0
    };
  }
};

// Get user orders history (Admin only)
export const fetchUserOrders = async (userId) => {
  try {
    const response = await apiCall("get", `/admin/users/${userId}/orders`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
};

// Update user information (Admin only)
export const updateUser = async (userId, userData) => {
  try {
    const response = await apiCall("put", `/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Send notification to user (Admin only)
export const sendNotificationToUser = async (userId, notification) => {
  try {
    const response = await apiCall("post", `/admin/users/${userId}/notifications`, notification);
    return response.data;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

// Block/Unblock user (Admin only)
export const toggleUserBlock = async (userId, isBlocked) => {
  try {
    const response = await apiCall("put", `/admin/users/${userId}/block`, { isBlocked });
    return response.data;
  } catch (error) {
    console.error("Error blocking/unblocking user:", error);
    throw error;
  }
};

// Reset user password (Admin only)
export const resetUserPassword = async (userId, newPassword) => {
  try {
    const response = await apiCall("put", `/admin/users/${userId}/reset-password`, { new_password: newPassword });
    return response.data;
  } catch (error) {
    console.error("Error resetting user password:", error);
    throw error;
  }
};
