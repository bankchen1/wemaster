/**
 * Course model
 */

export const CourseStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
}

export class Course {
  constructor(data = {}) {
    this.id = data.id || ''
    this.title = data.title || ''
    this.description = data.description || ''
    this.status = data.status || CourseStatus.DRAFT
    this.price = data.price || 0
    this.duration = data.duration || 0 // in minutes
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}