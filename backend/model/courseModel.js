const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A course must have a title.'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'A course must have a price.'],
    },
    // The artist/coach who created the course
    artistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
    // The category of the course
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Reference to the Category model you will create
        required: true,
    },
    thumbnailUrl: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Published', 'Draft'],
        default: 'Draft',
    },
    // This is the key part: An array of references to the Video model
    lessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
}, {
    timestamps: true,
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
