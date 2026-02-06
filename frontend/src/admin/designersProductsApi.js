import { apiCall } from "../context/AuthContext";

// ================== DESIGNERS API ==================

// Fetch all designers with optional filters
export const fetchDesigners = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.specialty) params.append('specialty', filters.specialty);
    
    const queryString = params.toString();
    const endpoint = `/designers${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiCall("get", endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching designers:", error);
    throw error;
  }
};

// Fetch single designer by ID
export const fetchDesignerById = async (id) => {
  try {
    const response = await apiCall("get", `/admin/designers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching designer:", error);
    // Return null instead of throwing
    return null;
  }
};

// Create new designer (Admin only)
export const createDesigner = async (designerData) => {
  try {
    const response = await apiCall("post", "/admin/designers", designerData);
    return response.data;
  } catch (error) {
    console.error("Error creating designer:", error);
    throw error;
  }
};

// Update existing designer (Admin only)
export const updateDesigner = async (id, designerData) => {
  try {
    const response = await apiCall("put", `/admin/designers/${id}`, designerData);
    return response.data;
  } catch (error) {
    console.error("Error updating designer:", error);
    throw error;
  }
};

// Delete designer (Admin only)
export const deleteDesigner = async (id) => {
  try {
    const response = await apiCall("delete", `/admin/designers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting designer:", error);
    throw error;
  }
};

// Fetch designers statistics
export const fetchDesignersStats = async () => {
  try {
    const response = await apiCall("get", "/admin/designers/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching designers stats:", error);
    return { total: 0, active: 0, total_products: 0 };
  }
};

// ================== PRODUCTS API ==================

// Fetch all products with optional filters
export const fetchProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.designer_id) params.append('designer_id', filters.designer_id);
    if (filters.min_price) params.append('min_price', filters.min_price);
    if (filters.max_price) params.append('max_price', filters.max_price);
    
    const queryString = params.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiCall("get", endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Fetch single product by ID
export const fetchProductById = async (id) => {
  try {
    const response = await apiCall("get", `/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

// Create new product (Admin only)
export const createProduct = async (productData) => {
  try {
    const response = await apiCall("post", "/admin/products", productData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Update existing product (Admin only)
export const updateProduct = async (id, productData) => {
  try {
    const response = await apiCall("put", `/admin/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete product (Admin only)
export const deleteProduct = async (id) => {
  try {
    const response = await apiCall("delete", `/admin/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Add image to product
export const addProductImage = async (productId, imageUrl) => {
  try {
    const response = await apiCall("post", `/admin/products/${productId}/images`, {
      url: imageUrl
    });
    return response.data;
  } catch (error) {
    console.error("Error adding product image:", error);
    throw error;
  }
};

// Remove image from product
export const removeProductImage = async (productId, imageId) => {
  try {
    const response = await apiCall("delete", `/admin/products/${productId}/images/${imageId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing product image:", error);
    throw error;
  }
};

// Fetch products statistics
export const fetchProductsStats = async () => {
  try {
    const response = await apiCall("get", "/admin/products/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching products stats:", error);
    return { 
      total: 0, 
      jewelry: 0, 
      designer: 0, 
      gifts: 0,
      in_stock: 0,
      out_of_stock: 0 
    };
  }
};
