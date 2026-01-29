export const getCourseBySlug = (slug) => {
  return courses.find(course => course.slug === slug);
};

export const getCourseById = (id) => {
  return courses.find(course => course.id === id);
};

export const getSimilarCourses = (courseId) => {
  const course = getCourseById(courseId);
  if (!course) return [];
  return course.similarCourses.map(id => getCourseById(id)).filter(Boolean);
};
