import { Tutor, Course, Review, Subject } from '../types';

export const subjects: Subject[] = [
  {
    id: 'math',
    name: 'Mathematics',
    category: 'Academic',
    icon: '🔢',
    level: 'all',
  },
  {
    id: 'english',
    name: 'English',
    category: 'Languages',
    icon: '🗣️',
    level: 'all',
  },
  {
    id: 'physics',
    name: 'Physics',
    category: 'Academic',
    icon: '⚡',
    level: 'all',
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    category: 'Academic',
    icon: '🧪',
    level: 'all',
  },
  {
    id: 'programming',
    name: 'Programming',
    category: 'Professional',
    icon: '💻',
    level: 'all',
  },
];

export const featuredTutors: Tutor[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'Dr. Sarah Johnson',
    avatar: '/avatars/tutor1.jpg',
    headline: 'PhD in Mathematics from MIT',
    bio: 'Experienced mathematics tutor with over 10 years of teaching experience...',
    hourlyRate: 50,
    rating: 4.9,
    totalReviews: 128,
    totalStudents: 450,
    totalLessons: 1250,
    subjects: [subjects[0], subjects[2]],
    education: [
      {
        id: 'edu1',
        institution: 'MIT',
        degree: 'PhD',
        field: 'Mathematics',
        startYear: 2015,
        endYear: 2020,
        verified: true,
      },
    ],
    experience: [
      {
        id: 'exp1',
        title: 'Mathematics Professor',
        company: 'Stanford University',
        location: 'California, USA',
        current: true,
        startDate: '2020-09-01',
        description: 'Teaching advanced mathematics courses...',
      },
    ],
    availability: [
      {
        id: 'av1',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'America/Los_Angeles',
      },
    ],
    languages: [
      {
        code: 'en',
        name: 'English',
        level: 'native',
      },
    ],
    verificationStatus: 'verified',
    featured: true,
  },
  // Add more featured tutors...
];

export const popularCourses: Course[] = [
  {
    id: 'course1',
    tutorId: '1',
    title: 'Advanced Calculus Mastery',
    description: 'Master calculus concepts with practical applications...',
    subject: subjects[0],
    level: 'advanced',
    duration: 60,
    price: 45,
    currency: 'USD',
    maxStudents: 1,
    schedule: [
      {
        id: 'sch1',
        startTime: '2025-01-10T09:00:00Z',
        endTime: '2025-01-10T10:00:00Z',
        recurring: true,
        frequency: 'weekly',
        availableSlots: 1,
      },
    ],
    materials: [
      {
        id: 'mat1',
        title: 'Calculus Fundamentals',
        type: 'pdf',
        url: '/materials/calculus-basics.pdf',
        size: 2500000,
      },
    ],
    objectives: [
      'Understand advanced calculus concepts',
      'Solve complex mathematical problems',
      'Apply calculus in real-world scenarios',
    ],
    requirements: [
      'Basic calculus knowledge',
      'Understanding of algebra',
    ],
    status: 'published',
  },
  // Add more popular courses...
];

export const testimonials: Review[] = [
  {
    id: 'review1',
    studentId: 'student1',
    tutorId: '1',
    courseId: 'course1',
    bookingId: 'booking1',
    rating: 5,
    content: 'Dr. Johnson is an exceptional teacher! Her clear explanations and patience helped me ace my calculus exam.',
    createdAt: '2024-12-20T15:30:00Z',
    updatedAt: '2024-12-20T15:30:00Z',
  },
  // Add more testimonials...
];

export const statistics = {
  totalStudents: '50K+',
  totalTutors: '1000+',
  averageRating: '4.9',
  totalSubjects: '100+',
  successRate: '95%',
  satisfactionRate: '98%',
};

// Add more mock data as needed...
