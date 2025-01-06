export enum TransactionType {
  DEPOSIT = 'deposit',           // 充值
  WITHDRAWAL = 'withdrawal',     // 提现
  COURSE_PAYMENT = 'course_payment',  // 课程支付
  COURSE_REFUND = 'course_refund',    // 课程退款
  COURSE_EARNING = 'course_earning',   // 课程收入
  APPEAL_REFUND = 'appeal_refund',     // 申诉退款
}

export enum TransactionStatus {
  PENDING = 'pending',           // 等待中
  PROCESSING = 'processing',     // 处理中
  COMPLETED = 'completed',       // 已完成
  FAILED = 'failed',            // 失败
  CANCELLED = 'cancelled',       // 已取消
}

export enum FundsStatus {
  AVAILABLE = 'available',       // 可用资金
  FROZEN = 'frozen',            // 冻结资金（等待结算）
  LOCKED = 'locked',            // 锁定资金（申诉中）
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  fundsStatus: FundsStatus;
  relatedId?: string;           // 关联的订单/课程/申诉ID
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletBalance {
  userId: string;
  availableBalance: number;     // 可用余额
  frozenBalance: number;        // 冻结余额
  lockedBalance: number;        // 锁定余额
  totalBalance: number;         // 总余额
  updatedAt: Date;
}
