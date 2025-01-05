import { api } from './api';

export async function getTutors(params: any) {
  const response = await api.get('/tutors', { params });
  return response.data;
}

export async function getTutorById(id: string) {
  const response = await api.get(`/tutors/${id}`);
  return response.data;
}

export async function addFavorite(tutorId: string) {
  const response = await api.post(`/tutors/favorites/${tutorId}`);
  return response.data;
}

export async function removeFavorite(tutorId: string) {
  const response = await api.delete(`/tutors/favorites/${tutorId}`);
  return response.data;
}

export async function getFavorites(page = 1, limit = 10) {
  const response = await api.get('/tutors/favorites', {
    params: { page, limit },
  });
  return response.data;
}

export async function checkIsFavorite(tutorId: string) {
  const response = await api.get(`/tutors/favorites/${tutorId}/is-favorite`);
  return response.data;
}

export async function getTutorSchedule(tutorId: string, startDate: Date, endDate: Date) {
  const response = await api.get(`/tutors/${tutorId}/schedule`, {
    params: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  });
  return response.data;
}

export async function getTutorReviews(tutorId: string, page = 1, limit = 10) {
  const response = await api.get(`/tutors/${tutorId}/reviews`, {
    params: { page, limit },
  });
  return response.data;
}

export async function getPopularTutors(limit = 10) {
  const response = await api.get('/tutors/popular', {
    params: { limit },
  });
  return response.data;
}

export async function getRecommendedTutors(limit = 10) {
  const response = await api.get('/tutors/recommended', {
    params: { limit },
  });
  return response.data;
}

export async function getTutorsBySubject(
  subjectId: string,
  filters = {},
  page = 1,
  limit = 10
) {
  const response = await api.get(`/subjects/${subjectId}/tutors`, {
    params: {
      ...filters,
      page,
      limit,
    },
  });
  return response.data;
}
