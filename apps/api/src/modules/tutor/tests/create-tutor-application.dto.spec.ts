import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateTutorApplicationDto } from '../dto/create-tutor-application.dto';

describe('CreateTutorApplicationDto', () => {
  let dto: CreateTutorApplicationDto;

  beforeEach(() => {
    dto = plainToInstance(CreateTutorApplicationDto, {
      name: 'Test Tutor',
      title: 'Senior Teacher',
      introduction: 'Test introduction with sufficient length for validation',
      languages: ['en', 'zh'],
      education: [
        {
          degree: 'Bachelor',
          school: 'Test University',
          major: 'Education',
          graduationYear: 2020,
        },
      ],
      certificates: [
        {
          name: 'TEFL',
          issuer: 'Test Institute',
          date: new Date(),
          file: 'certificate.pdf',
        },
      ],
      experience: [
        {
          title: 'Teacher',
          company: 'Test School',
          startDate: new Date(),
          description: 'Teaching experience',
        },
      ],
      pricing: {
        regular: { price: 100, duration: 60 },
        trial: { price: 50, duration: 30 },
        group: {
          price: 80,
          duration: 60,
          minStudents: 2,
          maxStudents: 6,
        },
      },
      availability: {
        workingDays: [1, 2, 3, 4, 5],
        workingHours: { start: '09:00', end: '18:00' },
      },
      subjects: ['math', 'physics'],
    });
  });

  describe('name validation', () => {
    it('should pass with valid name', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with empty name', async () => {
      dto.name = '';
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail with name too short', async () => {
      dto.name = 'A';
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('minLength');
    });
  });

  describe('education validation', () => {
    it('should pass with valid education', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with empty education array', async () => {
      dto.education = [];
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('arrayMinSize');
    });

    it('should fail with invalid graduation year', async () => {
      dto.education[0].graduationYear = 1800;
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail with future graduation year', async () => {
      dto.education[0].graduationYear = new Date().getFullYear() + 1;
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('max');
    });
  });

  describe('pricing validation', () => {
    it('should pass with valid pricing', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with negative price', async () => {
      dto.pricing.regular.price = -100;
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail with invalid duration', async () => {
      dto.pricing.regular.duration = 15; // Less than minimum 30 minutes
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail with invalid group size', async () => {
      dto.pricing.group.minStudents = 1; // Less than minimum 2 students
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail when max students less than min students', async () => {
      dto.pricing.group.maxStudents = 1;
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });

  describe('availability validation', () => {
    it('should pass with valid availability', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with empty working days', async () => {
      dto.availability.workingDays = [];
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('arrayMinSize');
    });

    it('should fail with invalid working day', async () => {
      dto.availability.workingDays = [7]; // Invalid day number
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should fail with invalid time format', async () => {
      dto.availability.workingHours.start = 'invalid';
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('matches');
    });
  });

  describe('experience validation', () => {
    it('should pass with valid experience', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass with optional end date', async () => {
      delete dto.experience[0].endDate;
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with empty experience array', async () => {
      dto.experience = [];
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('arrayMinSize');
    });

    it('should fail with missing required fields', async () => {
      dto.experience[0].title = '';
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('certificates validation', () => {
    it('should pass with valid certificates', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass with empty certificates array', async () => {
      dto.certificates = [];
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid file extension', async () => {
      dto.certificates[0].file = 'certificate.exe';
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should fail with future certificate date', async () => {
      dto.certificates[0].date = new Date(Date.now() + 86400000); // Tomorrow
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('isDate');
    });
  });

  describe('subjects validation', () => {
    it('should pass with valid subjects', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with empty subjects array', async () => {
      dto.subjects = [];
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('arrayMinSize');
    });

    it('should fail with non-string subjects', async () => {
      (dto as any).subjects = [1, 2, 3];
      const errors = await validate(dto);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
