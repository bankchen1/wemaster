import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { TutorApplication, ApplicationStatus } from '../tutor-application.entity';

describe('TutorApplication', () => {
  let application: TutorApplication;

  beforeEach(() => {
    application = plainToInstance(TutorApplication, {
      id: 'test-id',
      userId: 'test-user-id',
      name: 'Test Tutor',
      title: 'Senior Teacher',
      introduction: 'Test introduction',
      languages: ['en', 'zh'],
      education: [{
        degree: 'Bachelor',
        school: 'Test University',
        major: 'Education',
        graduationYear: 2020
      }],
      certificates: [{
        name: 'TEFL',
        issuer: 'Test Institute',
        date: new Date(),
        file: 'test.pdf'
      }],
      experience: [{
        title: 'Teacher',
        company: 'Test School',
        startDate: new Date(),
        description: 'Teaching experience'
      }],
      pricing: {
        regular: { price: 100, duration: 60 },
        trial: { price: 50, duration: 30 },
        group: {
          price: 80,
          duration: 60,
          minStudents: 2,
          maxStudents: 6
        }
      },
      availability: {
        workingDays: [1, 2, 3, 4, 5],
        workingHours: { start: '09:00', end: '18:00' }
      },
      subjects: ['math', 'physics'],
      status: ApplicationStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  it('should be valid with all required fields', async () => {
    const errors = await validate(application);
    expect(errors.length).toBe(0);
  });

  it('should be invalid without userId', async () => {
    application.userId = undefined;
    const errors = await validate(application);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('userId');
  });

  it('should be invalid with empty languages array', async () => {
    application.languages = [];
    const errors = await validate(application);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('languages');
  });

  it('should be invalid with empty subjects array', async () => {
    application.subjects = [];
    const errors = await validate(application);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('subjects');
  });

  it('should be invalid with invalid education data', async () => {
    application.education = [{
      degree: '',
      school: 'Test University',
      major: 'Education',
      graduationYear: 1800 // Invalid year
    }];
    const errors = await validate(application);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should be invalid with invalid pricing data', async () => {
    application.pricing = {
      regular: { price: -100, duration: 60 }, // Invalid negative price
      trial: { price: 50, duration: 30 },
      group: {
        price: 80,
        duration: 60,
        minStudents: 1, // Invalid min students
        maxStudents: 6
      }
    };
    const errors = await validate(application);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should be invalid with invalid availability data', async () => {
    application.availability = {
      workingDays: [7], // Invalid day number
      workingHours: { start: '25:00', end: '18:00' } // Invalid time
    };
    const errors = await validate(application);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should handle optional endDate in experience', async () => {
    application.experience = [{
      title: 'Teacher',
      company: 'Test School',
      startDate: new Date(),
      description: 'Teaching experience'
      // endDate is optional
    }];
    const errors = await validate(application);
    expect(errors.length).toBe(0);
  });

  it('should validate experience dates order', async () => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() - 86400000); // One day before start
    application.experience = [{
      title: 'Teacher',
      company: 'Test School',
      startDate,
      endDate,
      description: 'Teaching experience'
    }];
    const errors = await validate(application);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should validate certificate file extensions', async () => {
    application.certificates = [{
      name: 'TEFL',
      issuer: 'Test Institute',
      date: new Date(),
      file: 'test.exe' // Invalid file extension
    }];
    const errors = await validate(application);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should validate working hours format', async () => {
    application.availability.workingHours = {
      start: 'invalid',
      end: '18:00'
    };
    const errors = await validate(application);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should validate working days are unique', async () => {
    application.availability.workingDays = [1, 1, 2, 2]; // Duplicate days
    const errors = await validate(application);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should handle status transitions', () => {
    expect(application.status).toBe(ApplicationStatus.PENDING);
    
    // Valid transitions
    application.status = ApplicationStatus.APPROVED;
    expect(application.status).toBe(ApplicationStatus.APPROVED);
    
    application.status = ApplicationStatus.REJECTED;
    expect(application.status).toBe(ApplicationStatus.REJECTED);
    
    // Invalid transition (should throw error or be handled by business logic)
    expect(() => {
      application.status = 'invalid' as ApplicationStatus;
    }).toThrow();
  });
});
