const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A category must have a name.'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    imageUrl: {
        type: String, // Optional: URL for a category icon or image
    },
    index: {
        type: Number,
        required: true,
        default: 0
    },
}, {
    timestamps: true,
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
