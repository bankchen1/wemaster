import { fetcher } from '@/lib/fetcher';

export async function getTutorProfile() {
  return fetcher('/api/tutor-profiles/me');
}

export async function updateTutorProfile(data: any) {
  return fetcher('/api/tutor-profiles', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function searchTutors(params: {
  page?: number;
  limit?: number;
  subjects?: string[];
  languages?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  weekdays?: number[];
  timeStart?: string;
  timeEnd?: string;
}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  return fetcher(`/api/tutor-profiles/search?${searchParams.toString()}`);
}

export async function getTutorById(id: string) {
  return fetcher(`/api/tutor-profiles/${id}`);
}
