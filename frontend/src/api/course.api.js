import axios from './axios';

export const fetchPublicCourses = async () => {
  const response = await axios.get('/courses');
  return response.data;
};

export const fetchCourseBySlug = async (slug) => {
  const response = await axios.get(`/courses/${slug}`);
  return response.data;
};
