// Mock course data
export const courses = [
  {
    id: 1,
    slug: 'complete-frontend-react',
    category: 'SOT > DCS > Web Development',
    name: 'Complete Front end with React',
    subtitle: 'This course is part of -> Full Stack Web Development',
    description: 'Master modern web development with React and build stunning interactive applications.',
    instructor: {
      name: 'Dr. John Smith',
      designation: 'Senior Professor',
      department: 'Computer Science Department',
      bio: 'Expert in web development with 15+ years of teaching experience.',
      avatar: null
    },
    provider: 'Tech Academy',
    price: 4999,
    thumbnail: null,
    videoPreview: null,
    stats: {
      parts: 12,
      rating: 4.5,
      reviews: 1250,
      difficulty: 'Intermediate',
      totalHours: 45,
      shareable: true
    },
    whatYouLearn: [
      'Master AI-Powered Software Development at Scale',
      'Learn to understand Google Code like a tech lead and among multiple senior developers',
      'Master AI-Powered Software Development at Scale',
      'Learn to understand Google Code like a tech lead and among multiple senior developers'
    ],
    parts: [
      {
        id: 1,
        title: 'PART-1',
        lectures: [
          { id: 1, title: 'Lecture 1', status: 'play', duration: '15:30' },
          { id: 2, title: 'Lecture 1', status: 'play', duration: '20:15' },
          { id: 3, title: 'Lecture 1', status: 'lock', duration: '18:45' },
          { id: 4, title: 'Lecture 1', status: 'lock', duration: '25:00' },
          { id: 5, title: 'Lecture 1', status: 'lock', duration: '12:30' },
          { id: 6, title: 'Lecture 1', status: 'lock', duration: '30:00' }
        ],
        resources: true
      },
      {
        id: 2,
        title: 'PART-2',
        lectures: [],
        resources: true
      },
      {
        id: 3,
        title: 'PART-3',
        lectures: [],
        resources: true
      },
      {
        id: 4,
        title: 'PART-4',
        lectures: [],
        resources: true
      }
    ],
    similarCourses: [2, 3, 4]
  },
  {
    id: 2,
    slug: 'nodejs-backend-development',
    category: 'SOT > DCS > Backend Development',
    name: 'Complete Backend with Node.js',
    subtitle: 'This course is part of -> Full Stack Web Development',
    description: 'Learn server-side development with Node.js, Express, and MongoDB.',
    instructor: {
      name: 'Prof. Sarah Johnson',
      designation: 'Associate Professor',
      department: 'Computer Science Department',
      bio: 'Specialized in backend systems and databases.',
      avatar: null
    },
    provider: 'Code Institute',
    price: 5499,
    thumbnail: null,
    videoPreview: null,
    stats: {
      parts: 10,
      rating: 4.7,
      reviews: 980,
      difficulty: 'Advanced',
      totalHours: 38,
      shareable: true
    },
    whatYouLearn: [
      'Build scalable REST APIs with Node.js and Express',
      'Master MongoDB and database design',
      'Implement authentication and authorization',
      'Deploy applications to cloud platforms'
    ],
    parts: [
      {
        id: 1,
        title: 'PART-1',
        lectures: [
          { id: 1, title: 'Lecture 1', status: 'play', duration: '15:30' }
        ],
        resources: true
      }
    ],
    similarCourses: [1, 3, 4]
  },
  {
    id: 3,
    slug: 'python-machine-learning',
    category: 'SOT > AI/ML > Machine Learning',
    name: 'Machine Learning with Python',
    subtitle: 'This course is part of -> AI & Data Science Track',
    description: 'Dive into machine learning algorithms and build predictive models using Python.',
    instructor: {
      name: 'Dr. Emily Chen',
      designation: 'Professor',
      department: 'AI & Data Science Department',
      bio: 'Research focus on ML algorithms and applications.',
      avatar: null
    },
    provider: 'AI Academy',
    price: 6999,
    thumbnail: null,
    videoPreview: null,
    stats: {
      parts: 15,
      rating: 4.8,
      reviews: 2100,
      difficulty: 'Intermediate',
      totalHours: 52,
      shareable: true
    },
    whatYouLearn: [
      'Understand core ML algorithms',
      'Build predictive models with scikit-learn',
      'Implement neural networks with TensorFlow',
      'Work with real-world datasets'
    ],
    parts: [
      {
        id: 1,
        title: 'PART-1',
        lectures: [
          { id: 1, title: 'Lecture 1', status: 'play', duration: '15:30' }
        ],
        resources: true
      }
    ],
    similarCourses: [1, 2, 4]
  },
  {
    id: 4,
    slug: 'mobile-app-flutter',
    category: 'SOT > DCS > Mobile Development',
    name: 'Mobile Apps with Flutter',
    subtitle: 'This course is part of -> Cross-Platform Development',
    description: 'Create beautiful cross-platform mobile applications with Flutter and Dart.',
    instructor: {
      name: 'Mr. Ahmed Patel',
      designation: 'Senior Lecturer',
      department: 'Mobile Development Lab',
      bio: 'Industry expert with multiple published apps.',
      avatar: null
    },
    provider: 'Mobile Mastery',
    price: 5999,
    thumbnail: null,
    videoPreview: null,
    stats: {
      parts: 14,
      rating: 4.6,
      reviews: 1450,
      difficulty: 'Beginner',
      totalHours: 40,
      shareable: true
    },
    whatYouLearn: [
      'Master Flutter framework and Dart language',
      'Build responsive mobile UIs',
      'Integrate APIs and databases',
      'Publish apps to App Store and Play Store'
    ],
    parts: [
      {
        id: 1,
        title: 'PART-1',
        lectures: [
          { id: 1, title: 'Lecture 1', status: 'play', duration: '15:30' }
        ],
        resources: true
      }
    ],
    similarCourses: [1, 2, 3]
  }
];

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
