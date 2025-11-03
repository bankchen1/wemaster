/**
 * Courses API endpoints
 */
import instance from '../mutator'
import { Course } from '../models/course'

// Course endpoints
export const coursesApi = {
  // Get all courses
  async getCourses(params = {}) {
    try {
      const response = await instance.get('/courses', { params })
      return {
        success: true,
        data: response.data.data?.map(course => new Course(course)) || [],
        total: response.data.total || 0
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to fetch courses' }
      }
    }
  },

  // Get course by ID
  async getCourseById(id) {
    try {
      const response = await instance.get(`/courses/${id}`)
      return {
        success: true,
        data: new Course(response.data.data)
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to fetch course' }
      }
    }
  },

  // Create course
  async createCourse(courseData) {
    try {
      const response = await instance.post('/courses', courseData)
      return {
        success: true,
        data: new Course(response.data.data)
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to create course' }
      }
    }
  },

  // Update course
  async updateCourse(id, courseData) {
    try {
      const response = await instance.put(`/courses/${id}`, courseData)
      return {
        success: true,
        data: new Course(response.data.data)
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to update course' }
      }
    }
  },

  // Delete course
  async deleteCourse(id) {
    try {
      await instance.delete(`/courses/${id}`)
      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to delete course' }
      }
    }
  }
}