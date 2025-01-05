import { fetcher } from '@/lib/fetcher';
import { ApplicationStatus } from '@/types/tutor';

export async function getTutorApplications() {
  return fetcher('/api/admin/tutor-applications');
}

export async function reviewTutorApplication(
  id: string,
  data: {
    status: ApplicationStatus;
    notes: string;
  }
) {
  return fetcher(`/api/admin/tutor-applications/${id}/review`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getTutorApplicationStats() {
  return fetcher('/api/admin/tutor-applications/stats');
}
