import { apiCall } from "../context/AuthContext";

// Fetch all shops with optional filters
export const fetchShops = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.status !== undefined) params.append('status', filters.status);
    
    const queryString = params.toString();
    const endpoint = `/admin/shops${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiCall("get", endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching shops:", error);
    // Return empty array instead of throwing
    return [];
  }
};

// Fetch single shop by ID
export const fetchShopById = async (id) => {
  try {
    const response = await apiCall("get", `/admin/shops/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching shop:", error);
    // Return null instead of throwing so the form can handle it
    return null;
  }
};

// Create new shop
export const createShop = async (shopData) => {
  try {
    const response = await apiCall("post", "/admin/shops", shopData);
    return response.data;
  } catch (error) {
    console.error("Error creating shop:", error);
    throw error;
  }
};

// Update existing shop
export const updateShop = async (id, shopData) => {
  try {
    const response = await apiCall("put", `/admin/shops/${id}`, shopData);
    return response.data;
  } catch (error) {
    console.error("Error updating shop:", error);
    throw error;
  }
};

// Delete shop
export const deleteShop = async (id) => {
  try {
    const response = await apiCall("delete", `/admin/shops/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting shop:", error);
    throw error;
  }
};

// Add image to shop
export const addShopImage = async (shopId, imageUrl) => {
  try {
    const response = await apiCall("post", `/admin/shops/${shopId}/images`, {
      url: imageUrl
    });
    return response.data;
  } catch (error) {
    console.error("Error adding shop image:", error);
    throw error;
  }
};

// Remove image from shop
export const removeShopImage = async (shopId, imageId) => {
  try {
    const response = await apiCall("delete", `/admin/shops/${shopId}/images/${imageId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing shop image:", error);
    throw error;
  }
};

// Fetch shops statistics
export const fetchShopsStats = async () => {
  try {
    const response = await apiCall("get", "/admin/shops/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching shops stats:", error);
    return { total: 0, jewelry: 0, gifts: 0, active: 0, inactive: 0 };
  }
};

// Fetch users count (for dashboard stats)
export const fetchUsersCount = async () => {
  try {
    const response = await apiCall("get", "/admin/users/count");
    return response.data;
  } catch (error) {
    console.error("Error fetching users count:", error);
    return { count: 0 };
  }
};
