import axios from './axios';

export const fetchTeacherProfile = async () => {
    const response = await axios.get('/teacher/profile');
    return response.data;
};

export const fetchTeacherCourses = async () => {
    const response = await axios.get('/teacher/courses');
    return response.data;
};

export const createCourse = async (courseData) => {
    const response = await axios.post('/courses', courseData);
    return response.data;
};

export const addSection = async (courseId, sectionData) => {
    const response = await axios.put(`/courses/${courseId}/sections`, sectionData);
    return response.data;
};

export const addLecture = async (courseId, sectionId, lectureData) => {
    const response = await axios.put(`/courses/${courseId}/sections/${sectionId}/lectures`, lectureData);
    return response.data;
};
