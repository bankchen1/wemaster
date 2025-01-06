export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  level: number;
  order: number;
  isActive: boolean;
  children?: Subject[];
}

export interface SubjectCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  subjects: Subject[];
}

export interface TutorSubject {
  id: string;
  tutorId: string;
  subjectId: string;
  level: TeachingLevel;
  yearsOfExperience: number;
  hourlyRate: number;
  isVerified: boolean;
  certificates: Certificate[];
}

export enum TeachingLevel {
  PRIMARY = 'primary',
  JUNIOR = 'junior',
  SENIOR = 'senior',
  COLLEGE = 'college',
  PROFESSIONAL = 'professional'
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  fileUrl: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface SubjectRequirement {
  id: string;
  subjectId: string;
  level: TeachingLevel;
  minimumExperience: number;
  requiredCertificates: string[];
  description: string;
}
