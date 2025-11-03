/**
 * User model
 */

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING'
}

export const UserRole = {
  ADMIN: 'ADMIN',
  TUTOR: 'TUTOR',
  STUDENT: 'STUDENT'
}

export class User {
  constructor(data = {}) {
    this.id = data.id || ''
    this.name = data.name || ''
    this.email = data.email || ''
    this.role = data.role || UserRole.STUDENT
    this.status = data.status || UserStatus.ACTIVE
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}