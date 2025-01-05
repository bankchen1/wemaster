import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { MultiSelect } from '@/components/ui/multi-select';

const tutorFormSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  subjects: z.array(z.string()).min(1, 'Select at least one subject'),
  education: z.string().min(10, 'Please provide your educational background'),
  experience: z.string().min(50, 'Please provide your teaching experience'),
  hourlyRate: z.number().min(10, 'Minimum hourly rate is $10'),
  availability: z.array(z.object({
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })),
  teachingStyle: z.string().min(50, 'Please describe your teaching style'),
  certificates: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.number(),
  })),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  profileImage: z.string().optional(),
  introVideo: z.string().optional(),
});

const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Computer Science',
  'Economics',
  'Business',
  'Art',
  'Music',
];

const languages = [
  'English',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Japanese',
  'Korean',
  'Russian',
  'Arabic',
];

const weekDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function TutorOnboardingForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<z.infer<typeof tutorFormSchema>>({
    resolver: zodResolver(tutorFormSchema),
    defaultValues: {
      subjects: [],
      languages: [],
      availability: [],
      certificates: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof tutorFormSchema>) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/tutors/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to submit tutor application');
      }

      toast({
        title: 'Application Submitted',
        description: 'Your tutor application has been submitted successfully!',
      });

      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit tutor application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'video') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="john@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+1 (123) 456-7890" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subjects"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subjects</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={subjects.map(subject => ({
                          label: subject,
                          value: subject,
                        }))}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select subjects..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>
        )}

        {/* Step 2: Qualifications */}
        {currentStep === 2 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Qualifications</h2>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Educational Background</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe your educational background..."
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teaching Experience</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe your teaching experience..."
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="certificates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificates</FormLabel>
                    <FormControl>
                      {/* Add certificate input fields */}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>
        )}

        {/* Step 3: Availability & Preferences */}
        {currentStep === 3 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Availability & Preferences</h2>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability</FormLabel>
                    <FormControl>
                      {/* Add availability schedule builder */}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Languages</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={languages.map(lang => ({
                          label: lang,
                          value: lang,
                        }))}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select languages..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(step => step - 1)}
            >
              Previous
            </Button>
          )}
          
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={() => setCurrentStep(step => step + 1)}
            >
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
