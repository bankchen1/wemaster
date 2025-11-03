/**
 * Order model
 */

export const OrderStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  PAID: 'PAID',
  FULFILLED: 'FULFILLED',
  REFUNDING: 'REFUNDING',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED'
}

export class Order {
  constructor(data = {}) {
    this.id = data.id || ''
    this.userId = data.userId || ''
    this.courseId = data.courseId || ''
    this.amount = data.amount || 0
    this.status = data.status || OrderStatus.DRAFT
    this.paymentMethod = data.paymentMethod || ''
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}