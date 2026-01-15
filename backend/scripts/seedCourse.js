import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';
import Course from '../src/models/Course.js';
import { ROLES, COURSE_STATUS } from '../src/config/roles.js';

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const sampleCourse = {
  name: "Web Development Masterminds - CodeHelp",
  slug: "web-development-masterminds-codehelp",
  category: "Web Development",
  subtitle: "Become a Full Stack Web Developer with Love Babbar",
  description: "A comprehensive MERN stack web development course designed to take you from zero to hero. Learn HTML, CSS, JavaScript, React, Node.js, Express, and MongoDB by building 15+ industry-grade projects including a mega project.",
  provider: "CodeHelp",
  price: 0,
  thumbnail: "https://codehelp.s3.ap-south-1.amazonaws.com/Web_Dev_670f900d8d.jpg", // Using a likely placeholder or generic image if exact not known, but trying to be specific
  videoPreview: "https://www.youtube.com/embed/l1EssrLxt7E",
  stats: {
    difficulty: "Beginner",
    totalHours: 150, 
    rating: 4.9,
    reviews: 5000,
    parts: 5
  },
  whatYouLearn: [
    "HTML5 & CSS3 in depth",
    "Modern JavaScript (ES6+)",
    "React.js form scratch to advanced",
    "Redux & State Management",
    "Node.js & Express.js Backend",
    "MongoDB Database",
    "Authentication & Authorization",
    "Deployment & Hosting"
  ],
  parts: [
    {
      title: "Module 1: HTML Basics",
      order: 1,
      lectures: [
        { title: "Introduction to Web Development", videoUrl: "https://www.youtube.com/embed/l1EssrLxt7E", duration: "15:00", status: "unlocked", order: 1 },
        { title: "HTML Skeleton & Tags", videoUrl: "https://www.youtube.com/embed/sample1", duration: "20:00", status: "unlocked", order: 2 },
        { title: "HTML Forms & Tables", videoUrl: "https://www.youtube.com/embed/sample2", duration: "25:00", status: "locked", order: 3 }
      ]
    },
    {
      title: "Module 2: CSS & Styling",
      order: 2,
      lectures: [
        { title: "CSS Selectors & Properties", videoUrl: "https://www.youtube.com/embed/sample3", duration: "30:00", status: "locked", order: 1 },
        { title: "Flexbox Architecture", videoUrl: "https://www.youtube.com/embed/sample4", duration: "45:00", status: "locked", order: 2 },
        { title: "Grid Layouts", videoUrl: "https://www.youtube.com/embed/sample5", duration: "40:00", status: "locked", order: 3 },
        { title: "Tailwind CSS Introduction", videoUrl: "https://www.youtube.com/embed/sample6", duration: "50:00", status: "locked", order: 4 }
      ]
    },
    {
      title: "Module 3: JavaScript Mastery",
      order: 3,
      lectures: [
        { title: "JS Basics & Variables", videoUrl: "https://www.youtube.com/embed/sample7", duration: "35:00", status: "locked", order: 1 },
        { title: "DOM Manipulation", videoUrl: "https://www.youtube.com/embed/sample8", duration: "55:00", status: "locked", order: 2 },
        { title: "Async JS (Promises, Async/Await)", videoUrl: "https://www.youtube.com/embed/sample9", duration: "60:00", status: "locked", order: 3 }
      ]
    },
    {
      title: "Module 4: React.js",
      order: 4,
      lectures: [
        { title: "React Fundamentals", videoUrl: "https://www.youtube.com/embed/sample10", duration: "45:00", status: "locked", order: 1 },
        { title: "Hooks (useState, useEffect)", videoUrl: "https://www.youtube.com/embed/sample11", duration: "50:00", status: "locked", order: 2 },
        { title: "Context API & Redux", videoUrl: "https://www.youtube.com/embed/sample12", duration: "70:00", status: "locked", order: 3 }
      ]
    },
    {
      title: "Module 5: Backend & MERN Full Stack",
      order: 5,
      lectures: [
        { title: "Node.js & Express Setup", videoUrl: "https://www.youtube.com/embed/sample13", duration: "40:00", status: "locked", order: 1 },
        { title: "MongoDB & Mongoose", videoUrl: "https://www.youtube.com/embed/sample14", duration: "55:00", status: "locked", order: 2 },
        { title: "Authentication (JWT)", videoUrl: "https://www.youtube.com/embed/sample15", duration: "65:00", status: "locked", order: 3 },
        { title: "Mega Project: Building Course Platform", videoUrl: "https://www.youtube.com/embed/sample16", duration: "120:00", status: "locked", order: 4 }
      ]
    }
  ],
  status: COURSE_STATUS.APPROVED
};


const seedCourse = async () => {
  try {
    // 1. Connect to Database
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 2. Find or Create Teacher
    let instructor = await User.findOne({ email: 'lovebabbar@codehelp.com' });
    if (!instructor) {
      console.log('Teacher not found, creating new teacher...');
      instructor = await User.create({
        name: 'Love Babbar',
        email: 'lovebabbar@codehelp.com',
        password: 'password123', // In a real app, this should be hashed, but User model pre-save hook handles it? Yes.
        phone: '1234567890',
        role: ROLES.TEACHER
      });
      console.log('Teacher created:', instructor._id);
    } else {
        console.log('Using existing teacher:', instructor._id);
    }

    // 3. Create Course
    // Check if course already exists to avoid duplicates
    const existingCourse = await Course.findOne({ slug: sampleCourse.slug });
    if (existingCourse) {
      console.log('Course already exists. Removing old one...');
      await Course.deleteOne({ _id: existingCourse._id });
    }

    const courseData = {
      ...sampleCourse,
      instructor: instructor._id
    };

    const course = await Course.create(courseData);
    console.log('Course added successfully:', course.name);

    // 4. Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding course:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedCourse();
