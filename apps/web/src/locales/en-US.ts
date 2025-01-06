export default {
  common: {
    platform: {
      name: 'WeMaster',
      slogan: 'Your Gateway to Expert Knowledge',
      description: 'Connect with expert tutors worldwide for personalized learning experiences',
    },
    actions: {
      search: 'Search',
      book: 'Book Now',
      start: 'Get Started',
      learn: 'Learn More',
      contact: 'Contact Us',
      submit: 'Submit',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
    },
    status: {
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      empty: 'No Data Found',
    },
  },

  home: {
    hero: {
      title: 'Learn from the Best',
      subtitle: 'One-on-one tutoring with expert instructors',
      cta: 'Find Your Tutor',
    },
    features: {
      title: 'Why Choose WeMaster',
      list: {
        experts: {
          title: 'Expert Tutors',
          desc: 'Learn from verified professionals with proven track records',
        },
        flexibility: {
          title: 'Flexible Schedule',
          desc: 'Book lessons that fit your schedule, 24/7',
        },
        personalized: {
          title: 'Personalized Learning',
          desc: 'Customized curriculum based on your needs and goals',
        },
        guarantee: {
          title: 'Satisfaction Guaranteed',
          desc: '100% satisfaction or get your money back',
        },
      },
    },
  },

  search: {
    filters: {
      subject: 'Subject',
      price: 'Price Range',
      rating: 'Rating',
      availability: 'Availability',
    },
    sort: {
      rating: 'Highest Rated',
      price_low: 'Price: Low to High',
      price_high: 'Price: High to Low',
      popularity: 'Most Popular',
    },
    results: {
      count: '{{count}} tutors found',
      empty: 'No tutors match your criteria',
    },
  },

  tutor: {
    profile: {
      about: 'About',
      experience: 'Experience',
      education: 'Education',
      subjects: 'Subjects',
      reviews: 'Reviews',
      schedule: 'Schedule',
    },
    actions: {
      book: 'Book Trial Lesson',
      message: 'Send Message',
      follow: 'Follow',
      following: 'Following',
    },
    stats: {
      students: '{{count}} Students',
      lessons: '{{count}} Lessons',
      rating: '{{rating}} Rating',
    },
  },

  booking: {
    steps: {
      select: 'Select Time',
      confirm: 'Confirm Details',
      payment: 'Payment',
    },
    trial: {
      title: 'Book Trial Lesson',
      description: 'Try a 30-minute lesson at 50% off',
      terms: 'Trial lesson terms',
    },
    regular: {
      title: 'Book Regular Lessons',
      packages: {
        single: 'Single Lesson',
        five: '5 Lessons Pack (5% off)',
        ten: '10 Lessons Pack (10% off)',
        twenty: '20 Lessons Pack (15% off)',
      },
    },
  },

  classroom: {
    status: {
      upcoming: 'Upcoming',
      live: 'Live Now',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    actions: {
      join: 'Join Class',
      start: 'Start Class',
      end: 'End Class',
      extend: 'Extend Time',
      reschedule: 'Reschedule',
    },
    tools: {
      chat: 'Chat',
      whiteboard: 'Whiteboard',
      screen: 'Screen Share',
      materials: 'Materials',
    },
  },

  payment: {
    methods: {
      card: 'Credit Card',
      paypal: 'PayPal',
      apple: 'Apple Pay',
      google: 'Google Pay',
    },
    status: {
      pending: 'Payment Pending',
      processing: 'Processing Payment',
      completed: 'Payment Completed',
      failed: 'Payment Failed',
      refunded: 'Refunded',
    },
    summary: {
      subtotal: 'Subtotal',
      discount: 'Discount',
      tax: 'Tax',
      total: 'Total',
    },
  },

  account: {
    profile: {
      title: 'Profile',
      edit: 'Edit Profile',
      settings: 'Account Settings',
    },
    wallet: {
      balance: 'Current Balance',
      transactions: 'Transaction History',
      withdraw: 'Withdraw Funds',
      deposit: 'Add Funds',
    },
    notifications: {
      title: 'Notifications',
      settings: 'Notification Settings',
      empty: 'No new notifications',
    },
  },

  errors: {
    auth: {
      required: 'Please log in to continue',
      invalid: 'Invalid credentials',
      expired: 'Session expired',
    },
    booking: {
      conflict: 'Time slot is no longer available',
      insufficient: 'Insufficient funds',
      limit: 'Booking limit reached',
    },
    payment: {
      failed: 'Payment failed',
      declined: 'Card declined',
      expired: 'Payment session expired',
    },
  },
};
