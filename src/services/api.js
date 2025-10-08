import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5045/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  adminLogin(email, password) {
    return this.api.post('/admin/login', { email, password });
  }

  getDashboardStats() {
    return this.api.get('/admin/dashboard-stats');
  }

  getInstructors(params = {}) {
    return this.api.get('/instructor', { params });
  }

  getInstructor(id) {
    return this.api.get(`/instructor/${id}`);
  }

  createInstructor(formData) {
    return this.api.post('/instructor', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  updateInstructor(id, formData) {
    return this.api.put(`/instructor/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  deleteInstructor(id) {
    return this.api.delete(`/instructor/${id}`);
  }

  getCourses(params = {}) {
    return this.api.get('/course', { params });
  }

  getCourse(id) {
    return this.api.get(`/course/${id}`);
  }

  createCourse(formData) {
    return this.api.post('/course', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  updateCourse(id, formData) {
    return this.api.put(`/course/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  deleteCourse(id) {
    return this.api.delete(`/course/${id}`);
  }

  getCategories() {
    return this.api.get('/category');
  }
}

export const apiService = new ApiService();
