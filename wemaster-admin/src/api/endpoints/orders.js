/**
 * Orders API endpoints
 */
import instance from '../mutator'
import { Order } from '../models/order'

// Order endpoints
export const ordersApi = {
  // Get all orders
  async getOrders(params = {}) {
    try {
      const response = await instance.get('/orders', { params })
      return {
        success: true,
        data: response.data.data?.map(order => new Order(order)) || [],
        total: response.data.total || 0
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to fetch orders' }
      }
    }
  },

  // Get order by ID
  async getOrderById(id) {
    try {
      const response = await instance.get(`/orders/${id}`)
      return {
        success: true,
        data: new Order(response.data.data)
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to fetch order' }
      }
    }
  },

  // Create order
  async createOrder(orderData) {
    try {
      const response = await instance.post('/orders', orderData)
      return {
        success: true,
        data: new Order(response.data.data)
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to create order' }
      }
    }
  },

  // Update order
  async updateOrder(id, orderData) {
    try {
      const response = await instance.put(`/orders/${id}`, orderData)
      return {
        success: true,
        data: new Order(response.data.data)
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to update order' }
      }
    }
  }
}