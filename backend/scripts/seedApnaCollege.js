import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';
import Course from '../src/models/Course.js';
import { ROLES, COURSE_STATUS } from '../src/config/roles.js';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedCourse = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Create Teacher User (Shradha Khapra - Apna College)
    const teacherEmail = 'shradha@apnacollege.com';
    let teacher = await User.findOne({ email: teacherEmail });

    if (!teacher) {
      teacher = await User.create({
        name: 'Shradha Khapra',
        email: teacherEmail,
        password: 'password123', // Will be hashed
        phone: '9876543211',
        role: ROLES.TEACHER
      });
      console.log('Teacher created:', teacher.name);
    } else {
      console.log('Teacher already exists:', teacher.name);
    }

    // 2. Create Course (Apna College Delta Batch)
    const courseSlug = 'full-stack-web-development-delta-batch';
    const courseData = {
      name: 'Full Stack Web Development (Delta Batch)',
      slug: courseSlug,
      category: 'Web Development',
      subtitle: 'Complete Web Development Course from Basics to Advanced',
      description: 'Become a full-stack developer with the Delta Batch. Learn HTML, CSS, JavaScript, React, Node.js, MongoDB, and more. This course is designed to take you from a beginner to a job-ready developer.',
      instructor: teacher._id,
      provider: 'Apna College',
      price: 0, // Free
      thumbnail: 'https://i.ytimg.com/vi/l1EssrLxt7E/maxresdefault.jpg', // Placeholder or real thumbnail
      videoPreview: 'https://www.youtube.com/embed/l1EssrLxt7E', // Intro video
      stats: {
        difficulty: 'Beginner',
        totalHours: 40,
        rating: 4.9,
        reviews: 5000,
        parts: 0 // Will be updated automatically
      },
      whatYouLearn: [
        'Complete HTML5 & CSS3',
        'Modern JavaScript (ES6+)',
        'React.js & Redux',
        'Node.js & Express.js',
        'MongoDB & Mongoose',
        'Git & GitHub',
        'Deployment & Hosting',
        'Build Real World Projects'
      ],
      status: 'approved', // Ensure it's visible based on new code logic
      parts: [
        {
          title: 'Module 1: HTML Validation & Forms',
          order: 1,
          lectures: [
            {
              title: 'Introduction to Web Development',
              videoUrl: 'https://www.youtube.com/embed/l1EssrLxt7E', // Example URL
              duration: '10:00',
              status: 'unlocked',
              order: 1
            },
            {
              title: 'HTML Basics',
              videoUrl: 'https://www.youtube.com/embed/HcOc7P5BMi4',
              duration: '25:00',
              status: 'locked',
              order: 2
            }
          ]
        },
        {
          title: 'Module 2: CSS Styling',
          order: 2,
          lectures: [
             {
              title: 'CSS Selectors',
              videoUrl: 'https://www.youtube.com/embed/ESnrn1kAD4E',
              duration: '30:00',
              status: 'locked',
              order: 1
            },
            {
              title: 'Flexbox & Grid',
              videoUrl: 'https://www.youtube.com/embed/ghIxrhjMd00', // Example
              duration: '45:00',
              status: 'locked',
              order: 2
            }
          ]
        },
        {
          title: 'Module 3: JavaScript',
          order: 3,
          lectures: [
            {
                title: 'JS Variables & Data Types',
                videoUrl: 'https://www.youtube.com/embed/VlPiVmYuoq0',
                duration: '40:00',
                status: 'locked',
                order: 1
            }
          ]
        }
      ]
    };

    // Check if course exists
    let course = await Course.findOne({ slug: courseSlug });
    if (course) {
        console.log('Course already exists. Updating...');
        // Update fields
        Object.assign(course, courseData);
        await course.save();
        console.log('Course updated!');
    } else {
        course = await Course.create(courseData);
        console.log('Course created:', course.name);
    }

    process.exit();
  } catch (error) {
    console.error('Error seeding course:', error);
    process.exit(1);
  }
};

seedCourse();
