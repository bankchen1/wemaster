import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/store/user';
import AdminShell from '@/layouts/AdminShell.vue';
import AuthShell from '@/layouts/AuthShell.vue';

// Auth views
const LoginView = () => import('@/modules/auth/LoginView.vue');
const ForgotPasswordView = () => import('@/modules/auth/ForgotPasswordView.vue');
const ResetPasswordView = () => import('@/modules/auth/ResetPasswordView.vue');

// Dashboard views
const DashboardView = () => import('@/modules/dashboard/DashboardView.vue');

// User views
const UserListView = () => import('@/modules/users/UserListView.vue');
const UserDetailView = () => import('@/modules/users/UserDetailView.vue');
const UserRolesView = () => import('@/modules/users/UserRolesView.vue');

// Tutor views
const TutorListView = () => import('@/modules/tutors/TutorListView.vue');
const TutorDetailView = () => import('@/modules/tutors/TutorDetailView.vue');

// Student views
const StudentListView = () => import('@/modules/students/StudentListView.vue');
const StudentDetailView = () => import('@/modules/students/StudentDetailView.vue');

// Course views
const CourseListView = () => import('@/modules/courses/CourseListView.vue');
const CourseDetailView = () => import('@/modules/courses/CourseDetailView.vue');

// Session views
const SessionCalendarView = () => import('@/modules/sessions/SessionCalendarView.vue');
const SessionListView = () => import('@/modules/sessions/SessionListView.vue');
const SessionDetailView = () => import('@/modules/sessions/SessionDetailView.vue');

// Order views
const OrderListView = () => import('@/modules/orders/OrderListView.vue');
const OrderDetailView = () => import('@/modules/orders/OrderDetailView.vue');

// Payment views
const PaymentTransactionView = () => import('@/modules/payments/PaymentTransactionView.vue');
const PaymentRefundView = () => import('@/modules/payments/PaymentRefundView.vue');
const PaymentReconciliationView = () => import('@/modules/payments/PaymentReconciliationView.vue');

// Subscription views
const SubscriptionPlanView = () => import('@/modules/subscriptions/SubscriptionPlanView.vue');
const SubscriptionMemberView = () => import('@/modules/subscriptions/SubscriptionMemberView.vue');
const SubscriptionInvoiceView = () => import('@/modules/subscriptions/SubscriptionInvoiceView.vue');

// Wallet views
const WalletAccountView = () => import('@/modules/wallets/WalletAccountView.vue');
const WalletTransactionView = () => import('@/modules/wallets/WalletTransactionView.vue');
const WalletPayoutView = () => import('@/modules/wallets/WalletPayoutView.vue');

// Earnings views
const EarningsOverviewView = () => import('@/modules/earnings/EarningsOverviewView.vue');
const EarningsSettlementView = () => import('@/modules/earnings/EarningsSettlementView.vue');
const EarningsPayoutView = () => import('@/modules/earnings/EarningsPayoutView.vue');

// Message views
const MessageModerationView = () => import('@/modules/messages/MessageModerationView.vue');
const MessageReportView = () => import('@/modules/messages/MessageReportView.vue');

// Content views
const ContentArticleView = () => import('@/modules/content/ContentArticleView.vue');
const ContentAnnouncementView = () => import('@/modules/content/ContentAnnouncementView.vue');
const ContentFaqView = () => import('@/modules/content/ContentFaqView.vue');
const ContentAssetView = () => import('@/modules/content/ContentAssetView.vue');

// Marketing views
const MarketingCouponView = () => import('@/modules/marketing/MarketingCouponView.vue');
const MarketingCampaignView = () => import('@/modules/marketing/MarketingCampaignView.vue');
const MarketingAbTestView = () => import('@/modules/marketing/MarketingAbTestView.vue');

// Analytics views
const AnalyticsOverviewView = () => import('@/modules/analytics/AnalyticsOverviewView.vue');
const AnalyticsFunnelView = () => import('@/modules/analytics/AnalyticsFunnelView.vue');
const AnalyticsFinanceView = () => import('@/modules/analytics/AnalyticsFinanceView.vue');

// Moderation views
const ModerationQueueView = () => import('@/modules/moderation/ModerationQueueView.vue');
const ModerationRuleView = () => import('@/modules/moderation/ModerationRuleView.vue');
const ModerationBlacklistView = () => import('@/modules/moderation/ModerationBlacklistView.vue');

// Tenant views
const TenantListView = () => import('@/modules/tenants/TenantListView.vue');
const TenantDetailView = () => import('@/modules/tenants/TenantDetailView.vue');

// Integration views
const IntegrationStripeView = () => import('@/modules/integrations/IntegrationStripeView.vue');
const IntegrationStorageView = () => import('@/modules/integrations/IntegrationStorageView.vue');
const IntegrationLiveKitView = () => import('@/modules/integrations/IntegrationLiveKitView.vue');
const IntegrationWebhookView = () => import('@/modules/integrations/IntegrationWebhookView.vue');

// Ops views
const OpsCacheView = () => import('@/modules/ops/OpsCacheView.vue');
const OpsQueueView = () => import('@/modules/ops/OpsQueueView.vue');
const OpsSchedulerView = () => import('@/modules/ops/OpsSchedulerView.vue');
const OpsHealthView = () => import('@/modules/ops/OpsHealthView.vue');

// Settings views
const SettingsRbacView = () => import('@/modules/settings/SettingsRbacView.vue');
const SettingsFeatureFlagView = () => import('@/modules/settings/SettingsFeatureFlagView.vue');
const SettingsDictionaryView = () => import('@/modules/settings/SettingsDictionaryView.vue');

// Audit views
const AuditLogView = () => import('@/modules/audit/AuditLogView.vue');

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    component: AuthShell,
    children: [
      {
        path: '',
        name: 'Login',
        component: LoginView,
      },
      {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: ForgotPasswordView,
      },
      {
        path: 'reset-password',
        name: 'ResetPassword',
        component: ResetPasswordView,
      },
    ],
  },
  {
    path: '/',
    component: AdminShell,
    meta: { requiresAuth: true },
    children: [
      // Dashboard
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { 
          title: 'dashboard.title',
          permissions: ['dashboard.view']
        }
      },
      
      // Users
      {
        path: 'users',
        name: 'Users',
        component: UserListView,
        meta: { 
          title: 'users.title',
          permissions: ['users.view']
        },
        children: [
          {
            path: 'list',
            name: 'UserList',
            component: UserListView,
            meta: { 
              title: 'users.list.title',
              permissions: ['users.view']
            }
          },
          {
            path: 'detail/:id',
            name: 'UserDetail',
            component: UserDetailView,
            meta: { 
              title: 'users.detail.title',
              permissions: ['users.view']
            }
          },
          {
            path: 'roles',
            name: 'UserRoles',
            component: UserRolesView,
            meta: { 
              title: 'users.roles.title',
              permissions: ['users.role.assign']
            }
          }
        ]
      },
      
      // Tutors
      {
        path: 'tutors',
        name: 'Tutors',
        component: TutorListView,
        meta: { 
          title: 'tutors.title',
          permissions: ['tutors.view']
        },
        children: [
          {
            path: 'list',
            name: 'TutorList',
            component: TutorListView,
            meta: { 
              title: 'tutors.list.title',
              permissions: ['tutors.view']
            }
          },
          {
            path: 'detail/:id',
            name: 'TutorDetail',
            component: TutorDetailView,
            meta: { 
              title: 'tutors.detail.title',
              permissions: ['tutors.view']
            }
          }
        ]
      },
      
      // Students
      {
        path: 'students',
        name: 'Students',
        component: StudentListView,
        meta: { 
          title: 'students.title',
          permissions: ['students.view']
        },
        children: [
          {
            path: 'list',
            name: 'StudentList',
            component: StudentListView,
            meta: { 
              title: 'students.list.title',
              permissions: ['students.view']
            }
          },
          {
            path: 'detail/:id',
            name: 'StudentDetail',
            component: StudentDetailView,
            meta: { 
              title: 'students.detail.title',
              permissions: ['students.view']
            }
          }
        ]
      },
      
      // Courses
      {
        path: 'courses',
        name: 'Courses',
        component: CourseListView,
        meta: { 
          title: 'courses.title',
          permissions: ['courses.view']
        },
        children: [
          {
            path: 'list',
            name: 'CourseList',
            component: CourseListView,
            meta: { 
              title: 'courses.list.title',
              permissions: ['courses.view']
            }
          },
          {
            path: 'detail/:id',
            name: 'CourseDetail',
            component: CourseDetailView,
            meta: { 
              title: 'courses.detail.title',
              permissions: ['courses.view']
            }
          }
        ]
      },
      
      // Sessions
      {
        path: 'sessions',
        name: 'Sessions',
        component: SessionCalendarView,
        meta: { 
          title: 'sessions.title',
          permissions: ['sessions.view']
        },
        children: [
          {
            path: 'calendar',
            name: 'SessionCalendar',
            component: SessionCalendarView,
            meta: { 
              title: 'sessions.calendar.title',
              permissions: ['sessions.view']
            }
          },
          {
            path: 'list',
            name: 'SessionList',
            component: SessionListView,
            meta: { 
              title: 'sessions.list.title',
              permissions: ['sessions.view']
            }
          },
          {
            path: 'detail/:id',
            name: 'SessionDetail',
            component: SessionDetailView,
            meta: { 
              title: 'sessions.detail.title',
              permissions: ['sessions.view']
            }
          }
        ]
      },
      
      // Orders
      {
        path: 'orders',
        name: 'Orders',
        component: OrderListView,
        meta: { 
          title: 'orders.title',
          permissions: ['orders.view']
        },
        children: [
          {
            path: 'list',
            name: 'OrderList',
            component: OrderListView,
            meta: { 
              title: 'orders.list.title',
              permissions: ['orders.view']
            }
          },
          {
            path: 'detail/:id',
            name: 'OrderDetail',
            component: OrderDetailView,
            meta: { 
              title: 'orders.detail.title',
              permissions: ['orders.view']
            }
          }
        ]
      },
      
      // Payments
      {
        path: 'payments',
        name: 'Payments',
        component: PaymentTransactionView,
        meta: { 
          title: 'payments.title',
          permissions: ['payments.view']
        },
        children: [
          {
            path: 'transactions',
            name: 'PaymentTransactions',
            component: PaymentTransactionView,
            meta: { 
              title: 'payments.transactions.title',
              permissions: ['payments.view']
            }
          },
          {
            path: 'refunds',
            name: 'PaymentRefunds',
            component: PaymentRefundView,
            meta: { 
              title: 'payments.refunds.title',
              permissions: ['payments.view']
            }
          },
          {
            path: 'reconciliation',
            name: 'PaymentReconciliation',
            component: PaymentReconciliationView,
            meta: { 
              title: 'payments.reconciliation.title',
              permissions: ['payments.view']
            }
          }
        ]
      },
      
      // Subscriptions
      {
        path: 'subscriptions',
        name: 'Subscriptions',
        component: SubscriptionPlanView,
        meta: { 
          title: 'subscriptions.title',
          permissions: ['subscriptions.view']
        },
        children: [
          {
            path: 'plans',
            name: 'SubscriptionPlans',
            component: SubscriptionPlanView,
            meta: { 
              title: 'subscriptions.plans.title',
              permissions: ['subscriptions.view']
            }
          },
          {
            path: 'members',
            name: 'SubscriptionMembers',
            component: SubscriptionMemberView,
            meta: { 
              title: 'subscriptions.members.title',
              permissions: ['subscriptions.view']
            }
          },
          {
            path: 'invoices',
            name: 'SubscriptionInvoices',
            component: SubscriptionInvoiceView,
            meta: { 
              title: 'subscriptions.invoices.title',
              permissions: ['subscriptions.view']
            }
          }
        ]
      },
      
      // Wallets
      {
        path: 'wallets',
        name: 'Wallets',
        component: WalletAccountView,
        meta: { 
          title: 'wallets.title',
          permissions: ['wallets.view']
        },
        children: [
          {
            path: 'accounts',
            name: 'WalletAccounts',
            component: WalletAccountView,
            meta: { 
              title: 'wallets.accounts.title',
              permissions: ['wallets.view']
            }
          },
          {
            path: 'transactions',
            name: 'WalletTransactions',
            component: WalletTransactionView,
            meta: { 
              title: 'wallets.transactions.title',
              permissions: ['wallets.view']
            }
          },
          {
            path: 'payouts',
            name: 'WalletPayouts',
            component: WalletPayoutView,
            meta: { 
              title: 'wallets.payouts.title',
              permissions: ['wallets.view']
            }
          }
        ]
      },
      
      // Earnings
      {
        path: 'earnings',
        name: 'Earnings',
        component: EarningsOverviewView,
        meta: { 
          title: 'earnings.title',
          permissions: ['earnings.view']
        },
        children: [
          {
            path: 'overview',
            name: 'EarningsOverview',
            component: EarningsOverviewView,
            meta: { 
              title: 'earnings.overview.title',
              permissions: ['earnings.view']
            }
          },
          {
            path: 'settlements',
            name: 'EarningsSettlements',
            component: EarningsSettlementView,
            meta: { 
              title: 'earnings.settlements.title',
              permissions: ['earnings.view']
            }
          },
          {
            path: 'payouts',
            name: 'EarningsPayouts',
            component: EarningsPayoutView,
            meta: { 
              title: 'earnings.payouts.title',
              permissions: ['earnings.view']
            }
          }
        ]
      },
      
      // Messages
      {
        path: 'messages',
        name: 'Messages',
        component: MessageModerationView,
        meta: { 
          title: 'messages.title',
          permissions: ['messages.view']
        },
        children: [
          {
            path: 'moderation',
            name: 'MessageModeration',
            component: MessageModerationView,
            meta: { 
              title: 'messages.moderation.title',
              permissions: ['messages.view']
            }
          },
          {
            path: 'reports',
            name: 'MessageReports',
            component: MessageReportView,
            meta: { 
              title: 'messages.reports.title',
              permissions: ['messages.view']
            }
          }
        ]
      },
      
      // Content
      {
        path: 'content',
        name: 'Content',
        component: ContentArticleView,
        meta: { 
          title: 'content.title',
          permissions: ['content.view']
        },
        children: [
          {
            path: 'articles',
            name: 'ContentArticles',
            component: ContentArticleView,
            meta: { 
              title: 'content.articles.title',
              permissions: ['content.view']
            }
          },
          {
            path: 'announcements',
            name: 'ContentAnnouncements',
            component: ContentAnnouncementView,
            meta: { 
              title: 'content.announcements.title',
              permissions: ['content.view']
            }
          },
          {
            path: 'faq',
            name: 'ContentFaq',
            component: ContentFaqView,
            meta: { 
              title: 'content.faq.title',
              permissions: ['content.view']
            }
          },
          {
            path: 'assets',
            name: 'ContentAssets',
            component: ContentAssetView,
            meta: { 
              title: 'content.assets.title',
              permissions: ['content.view']
            }
          }
        ]
      },
      
      // Marketing
      {
        path: 'marketing',
        name: 'Marketing',
        component: MarketingCouponView,
        meta: { 
          title: 'marketing.title',
          permissions: ['marketing.view']
        },
        children: [
          {
            path: 'coupons',
            name: 'MarketingCoupons',
            component: MarketingCouponView,
            meta: { 
              title: 'marketing.coupons.title',
              permissions: ['marketing.view']
            }
          },
          {
            path: 'campaigns',
            name: 'MarketingCampaigns',
            component: MarketingCampaignView,
            meta: { 
              title: 'marketing.campaigns.title',
              permissions: ['marketing.view']
            }
          },
          {
            path: 'ab-tests',
            name: 'MarketingAbTests',
            component: MarketingAbTestView,
            meta: { 
              title: 'marketing.abTests.title',
              permissions: ['marketing.view']
            }
          }
        ]
      },
      
      // Analytics
      {
        path: 'analytics',
        name: 'Analytics',
        component: AnalyticsOverviewView,
        meta: { 
          title: 'analytics.title',
          permissions: ['analytics.view']
        },
        children: [
          {
            path: 'overview',
            name: 'AnalyticsOverview',
            component: AnalyticsOverviewView,
            meta: { 
              title: 'analytics.overview.title',
              permissions: ['analytics.view']
            }
          },
          {
            path: 'funnel',
            name: 'AnalyticsFunnel',
            component: AnalyticsFunnelView,
            meta: { 
              title: 'analytics.funnel.title',
              permissions: ['analytics.view']
            }
          },
          {
            path: 'finance',
            name: 'AnalyticsFinance',
            component: AnalyticsFinanceView,
            meta: { 
              title: 'analytics.finance.title',
              permissions: ['analytics.view']
            }
          }
        ]
      },
      
      // Moderation
      {
        path: 'moderation',
        name: 'Moderation',
        component: ModerationQueueView,
        meta: { 
          title: 'moderation.title',
          permissions: ['moderation.view']
        },
        children: [
          {
            path: 'queue',
            name: 'ModerationQueue',
            component: ModerationQueueView,
            meta: { 
              title: 'moderation.queue.title',
              permissions: ['moderation.view']
            }
          },
          {
            path: 'rules',
            name: 'ModerationRules',
            component: ModerationRuleView,
            meta: { 
              title: 'moderation.rules.title',
              permissions: ['moderation.view']
            }
          },
          {
            path: 'blacklist',
            name: 'ModerationBlacklist',
            component: ModerationBlacklistView,
            meta: { 
              title: 'moderation.blacklist.title',
              permissions: ['moderation.view']
            }
          }
        ]
      },
      
      // Tenants
      {
        path: 'tenants',
        name: 'Tenants',
        component: TenantListView,
        meta: { 
          title: 'tenants.title',
          permissions: ['tenants.view']
        },
        children: [
          {
            path: 'list',
            name: 'TenantList',
            component: TenantListView,
            meta: { 
              title: 'tenants.list.title',
              permissions: ['tenants.view']
            }
          },
          {
            path: 'detail/:id',
            name: 'TenantDetail',
            component: TenantDetailView,
            meta: { 
              title: 'tenants.detail.title',
              permissions: ['tenants.view']
            }
          }
        ]
      },
      
      // Integrations
      {
        path: 'integrations',
        name: 'Integrations',
        component: IntegrationStripeView,
        meta: { 
          title: 'integrations.title',
          permissions: ['integrations.view']
        },
        children: [
          {
            path: 'stripe',
            name: 'IntegrationStripe',
            component: IntegrationStripeView,
            meta: { 
              title: 'integrations.stripe.title',
              permissions: ['integrations.view']
            }
          },
          {
            path: 'storage',
            name: 'IntegrationStorage',
            component: IntegrationStorageView,
            meta: { 
              title: 'integrations.storage.title',
              permissions: ['integrations.view']
            }
          },
          {
            path: 'livekit',
            name: 'IntegrationLiveKit',
            component: IntegrationLiveKitView,
            meta: { 
              title: 'integrations.livekit.title',
              permissions: ['integrations.view']
            }
          },
          {
            path: 'webhooks',
            name: 'IntegrationWebhooks',
            component: IntegrationWebhookView,
            meta: { 
              title: 'integrations.webhooks.title',
              permissions: ['integrations.view']
            }
          }
        ]
      },
      
      // Ops
      {
        path: 'ops',
        name: 'Ops',
        component: OpsCacheView,
        meta: { 
          title: 'ops.title',
          permissions: ['ops.view']
        },
        children: [
          {
            path: 'cache',
            name: 'OpsCache',
            component: OpsCacheView,
            meta: { 
              title: 'ops.cache.title',
              permissions: ['ops.view']
            }
          },
          {
            path: 'queues',
            name: 'OpsQueues',
            component: OpsQueueView,
            meta: { 
              title: 'ops.queues.title',
              permissions: ['ops.view']
            }
          },
          {
            path: 'scheduler',
            name: 'OpsScheduler',
            component: OpsSchedulerView,
            meta: { 
              title: 'ops.scheduler.title',
              permissions: ['ops.view']
            }
          },
          {
            path: 'health',
            name: 'OpsHealth',
            component: OpsHealthView,
            meta: { 
              title: 'ops.health.title',
              permissions: ['ops.view']
            }
          }
        ]
      },
      
      // Settings
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsRbacView,
        meta: { 
          title: 'settings.title',
          permissions: ['settings.view']
        },
        children: [
          {
            path: 'rbac',
            name: 'SettingsRbac',
            component: SettingsRbacView,
            meta: { 
              title: 'settings.rbac.title',
              permissions: ['settings.view']
            }
          },
          {
            path: 'feature-flags',
            name: 'SettingsFeatureFlags',
            component: SettingsFeatureFlagView,
            meta: { 
              title: 'settings.featureFlags.title',
              permissions: ['settings.view']
            }
          },
          {
            path: 'dictionaries',
            name: 'SettingsDictionaries',
            component: SettingsDictionaryView,
            meta: { 
              title: 'settings.dictionaries.title',
              permissions: ['settings.view']
            }
          }
        ]
      },
      
      // Audit
      {
        path: 'audit',
        name: 'Audit',
        component: AuditLogView,
        meta: { 
          title: 'audit.title',
          permissions: ['audit.view']
        },
        children: [
          {
            path: 'logs',
            name: 'AuditLogs',
            component: AuditLogView,
            meta: { 
              title: 'audit.logs.title',
              permissions: ['audit.view']
            }
          }
        ]
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication and permissions
router.beforeEach((to, from, next) => {
  try {
    const userStore = useUserStore();
    
    // Check if route requires authentication
    if (to.meta.requiresAuth && !userStore.isAuthenticated) {
      next({ name: 'Login' });
      return;
    }
    
    // Check permissions
    if (to.meta.permissions) {
      const requiredPermissions = to.meta.permissions;
      console.log('检查路由权限:', to.name, requiredPermissions);
      console.log('用户当前权限:', userStore.permissions);
      
      // 确保用户已认证且有权限
      if (!userStore.isAuthenticated) {
        console.log('用户未认证');
        next({ name: 'Login' });
        return;
      }
      
      const hasPermission = requiredPermissions.some(permission => 
        userStore.checkPermission(permission)
      );
      
      console.log('权限检查结果:', hasPermission);
      
      if (!hasPermission) {
        // Redirect to unauthorized page or show error message
        console.error('Permission denied for route:', to.name, 'Required permissions:', requiredPermissions);
        next(false); // Cancel navigation
        return;
      }
    }
    
    next();
  } catch (error) {
    console.error('路由守卫错误:', error);
    next(); // 允许导航继续，避免阻塞
  }
});

export default router;