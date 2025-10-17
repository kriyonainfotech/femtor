const express = require('express');
const router = express.Router();
const courseController = require('../controller/courseController');
const { protect } = require('../middleware/authMiddleware');

router.post(
    '/create-course',
    // protect, 
    courseController.createCourse
);

router.post(
    '/:courseId/lessons',
    // protect, 
    courseController.addLessonToCourse
);

// You would add other course-related routes here, for example:
// router.post('/', protect, courseController.createCourse);
router.get('/get-all-courses', protect, courseController.getAllCourses);
router.get('/get-course/:id', courseController.getCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/delete-course/:id', courseController.deleteCourse);
router.get('/get-all-lessons/:id', protect, courseController.getLessonsByCourseId);

module.exports = router;
