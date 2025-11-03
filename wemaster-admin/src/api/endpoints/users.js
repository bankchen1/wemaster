/**
 * Users API endpoints
 */
import instance from '../mutator'
import { User } from '../models/user'

// User endpoints
export const usersApi = {
  // Get all users
  async getUsers(params = {}) {
    try {
      const response = await instance.get('/users', { params })
      return {
        success: true,
        data: response.data.data?.map(user => new User(user)) || [],
        total: response.data.total || 0
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to fetch users' }
      }
    }
  },

  // Get user by ID
  async getUserById(id) {
    try {
      const response = await instance.get(`/users/${id}`)
      return {
        success: true,
        data: new User(response.data.data)
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to fetch user' }
      }
    }
  },

  // Create user
  async createUser(userData) {
    try {
      const response = await instance.post('/users', userData)
      return {
        success: true,
        data: new User(response.data.data)
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to create user' }
      }
    }
  },

  // Update user
  async updateUser(id, userData) {
    try {
      const response = await instance.put(`/users/${id}`, userData)
      return {
        success: true,
        data: new User(response.data.data)
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to update user' }
      }
    }
  },

  // Delete user
  async deleteUser(id) {
    try {
      await instance.delete(`/users/${id}`)
      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to delete user' }
      }
    }
  }
}