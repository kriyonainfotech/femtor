const Course = require("../model/courseModel"); // You will need to create this model
const Lesson = require("../model/lessonModel");
const AppError = require("../utils/app-error");
const mongoose = require("mongoose");
/**
 * Creates a new, empty Lesson document and associates it with an existing Course.
 * This is the API called when the user clicks the "Add Lesson" button.
 */
exports.addLessonToCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        console.log(`[API] Add lesson endpoint hit for courseId: ${courseId}`);

        // 1. Find the parent course to make sure it exists.
        const course = await Course.findById(courseId);
        if (!course) {
            return next(new AppError("No course found with that ID", 404));
        }

        // Optional: Add a security check to ensure the logged-in user owns this course.
        // if (course.owner.toString() !== req.user._id.toString()) {
        //     return next(new AppError("You are not authorized to modify this course", 403));
        // }

        // 2. Create the new Lesson document in the database.
        console.log("[DB] Creating a new empty lesson document...");
        const newLesson = await Lesson.create({
            title: `Lesson ${course.lessons.length + 1}`, // Give it a default title
            course: courseId, // Link it to the parent course
            video: null // The video will be linked later
        });
        console.log(`[DB] Successfully created new lesson with ID: ${newLesson._id}`);

        // 3. Add the new lesson's ID to the course's 'lessons' array.
        console.log(`[DB] Adding lesson reference to course ${courseId}...`);
        course.lessons.push(newLesson._id);
        await course.save();
        console.log("[DB] Course updated successfully.");

        // 4. Send the complete new lesson object back to the frontend.
        // The frontend needs this object (with its _id) to update its state.
        res.status(201).json({
            status: "success",
            data: newLesson
        });

    } catch (error) {
        console.error("[API] CRITICAL ERROR in addLessonToCourse:", error);
        next(new AppError("Failed to add new lesson to the course.", 500));
    }
};

exports.createCourse = async (req, res, next) => {
    try {
        console.log("[API] Create course endpoint hit.");
        const { title, description, thumbnailUrl, artistId, categoryId, price, certificate, status } = req.body;

        if (!title) {
            return next(new AppError("Course title is required to save a draft.", 400));
        }

        // --- THE FIX: Sanitize the input before creating ---
        // We create a new object and only add fields if they have a valid value.
        // Mongoose will fail if we pass an empty string "" to an ObjectId field.
        const courseData = {
            title,
            description,
            thumbnailUrl,
            price,
            certificate,
            status,
            // owner: req.user._id, // Assuming 'protect' middleware adds the user to req
            lessons: []
        };

        // Only add artistId and categoryId if they are not empty strings.
        if (artistId) {
            courseData.artistId = artistId;
        }
        if (categoryId) {
            courseData.categoryId = categoryId;
        }
        // ---------------------------------------------------

        const newCourse = await Course.create(courseData);

        console.log(`[DB] Successfully created new course with ID: ${newCourse._id}`);

        res.status(201).json({
            status: "success",
            data: newCourse
        });

    } catch (error) {
        console.error("[API] CRITICAL ERROR in createCourse:", error);
        next(new AppError("Failed to create the new course.", 500));
    }
};

exports.getCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log(req.params, 'req.params')
        console.log(`[API] Get course endpoint hit for courseId: ${id}`);

        const course = await Course.findById(id).populate('lessons');
        if (!course) {
            return next(new AppError("No course found with that ID", 404));
        }
        res.status(200).json({
            status: "success",
            data: course
        });
    } catch (error) {
        console.error("[API] CRITICAL ERROR in getCourse:", error);
        next(new AppError("Failed to fetch the course.", 500));
    }
};

exports.updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Only pick fields that are allowed to be updated
        const { title, description, thumbnailUrl, artistId, categoryId, price, certificate, status, lessons } = req.body;

        // --- THE FIX: DATA SANITIZATION ---
        const updateData = {
            title, description, thumbnailUrl, price, certificate, status, lessons
        };

        // 1. Only include artistId if it's a valid, non-empty ObjectId string.
        if (artistId && mongoose.Types.ObjectId.isValid(artistId)) {
            updateData.artistId = artistId;
        } else {
            // If it's empty "" or an invalid string like "artist1_id", set it to null.
            updateData.artistId = null;
        }

        // 2. Do the same for categoryId.
        if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
            updateData.categoryId = categoryId;
        } else {
            updateData.categoryId = null;
        }
        // ------------------------------------

        console.log("[DB] Attempting to find and update course with sanitized data...");
        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            { $set: updateData }, // Use $set for safer updates
            { new: true, runValidators: true } // `new: true` returns the updated doc
        ).populate('lessons');

        if (!updatedCourse) {
            return next(new AppError("No course found with that ID.", 404));
        }

        console.log(`[DB] Successfully updated course ${updatedCourse._id}`);

        res.status(200).json({
            status: "success",
            data: updatedCourse,
        });

    } catch (error) {
        console.error("[API] CRITICAL ERROR in updateCourse:", error);
        next(new AppError("Failed to update the course.", 500));
    }
};

exports.getAllCourses = async (req, res, next) => {
    try {
        const courses = await Course.find();

        const coursesWithLessons = await Promise.all(
            courses.map(async (course) => {
                const lessons = await Lesson.find({ course: course._id }); // or { courseId: course._id }
                return {
                    ...course.toObject(),
                    lessons
                };
            })
        );


        // console.log(`[API] Retrieved ${courses.length} courses from the database.`);
        res.status(200).json({
            status: "success",
            results: coursesWithLessons.length,
            data: coursesWithLessons
        });
    } catch (error) {
        console.log("[API] CRITICAL ERROR in getAllCourses:", error);
        next(new AppError("Failed to fetch courses.", 500));
    }
};

exports.deleteCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findByIdAndDelete(id);
        if (!course) {
            return next(new AppError("No course found with that ID", 404));
        }
        // Optionally, delete all lessons associated with this course
        await Lesson.deleteMany({ course: id });

        res.status(204).json({
            status: "success",
            data: null
        });
    } catch (error) {
        console.error("[API] CRITICAL ERROR in deleteCourse:", error);
        next(new AppError("Failed to delete the course.", 500));
    }
};

exports.getAllLessons = async (req, res, next) => {
    try {
        const lessons = await Lesson.find();
        res.status(200).json({
            status: "success",
            results: lessons.length,
            data: lessons
        });
    } catch (error) {
        console.error("[API] CRITICAL ERROR in getAllLessons:", error);
        next(new AppError("Failed to fetch lessons.", 500));
    }
};
/**
 * Get all lessons by course ID
 * GET /api/courses/:courseId/lessons
 */
exports.getLessonsByCourseId = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log(`[API] Get lessons for courseId: ${id}`);
        // Check if course exists (optional, but good for validation)
        const course = await Course.findById(id);
        if (!course) {
            return next(new AppError("No course found with that ID", 404));
        }
        // Find all lessons linked to this course
        const lessons = await Lesson.find({ course: id }).populate('video');
        res.status(200).json({
            status: "success",
            results: lessons.length,
            data: lessons
        });
    } catch (error) {
        console.error("[API] CRITICAL ERROR in getLessonsByCourseId:", error);
        next(new AppError("Failed to fetch lessons for this course.", 500));
    }
};
