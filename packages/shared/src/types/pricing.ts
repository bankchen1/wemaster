export enum CourseType {
  ONE_ON_ONE = 'one_on_one',      // 一对一课程
  LESSONS_PLAN = 'lessons_plan',   // 课时包
  TRIAL_LESSON = 'trial_lesson',   // 试听课
}

export interface CoursePrice {
  basePrice: number;           // 导师基础收入
  platformFee: number;         // 平台服务费 (25%)
  totalPrice: number;          // 学生支付总价
  taxIncluded: boolean;        // 是否含税
}

export interface CoursePricing {
  courseType: CourseType;
  lessonsCount?: number;       // 课时包数量
  basePrice: number;           // 导师期望收入
  displayPrice: number;        // 展示给学生的价格 (含税)
  platformFee: number;         // 平台服务费
}

export interface MonthlyBonus {
  lessonCount: number;         // 月度课时数
  bonusRate: number;           // 奖金比例
  bonusAmount: number;         // 奖金金额
  baseIncome: number;          // 基础收入
  totalIncome: number;         // 总收入
}

export interface RefundCalculation {
  totalPrice: number;          // 课程总价
  giftCardAmount: number;      // 礼品卡金额
  couponAmount: number;        // 折扣券金额
  completedLessons: number;    // 已完成课时
  tutorBasePrice: number;      // 导师单价
  refundAmount: number;        // 退款金额
}
