const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        default: 'New Lesson'
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    // This creates the link. It stores the ID of a document from the "Video" collection.
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    // This links the lesson back to the course it belongs to.
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    }
}, { timestamps: true });

const Lesson = mongoose.model("Lesson", lessonSchema);

module.exports = Lesson;
