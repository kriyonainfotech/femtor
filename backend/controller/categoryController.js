const Category = require('../model/categoryModel');

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
    try {
        const { name, description, imageUrl } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required.' });
        }
        const categoryCount = await Category.countDocuments();

        const newCategory = await Category.create({
            name,
            description,
            imageUrl,
            index: categoryCount // auto-assign index based on current count
        });

        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ index: 1 });
        console.log(categories);
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.changeCategoryOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { direction } = req.body; // "up" or "down"

        // Get all categories sorted by index
        const categories = await Category.find().sort({ index: 1 });
        const currentIndex = categories.findIndex(c => c._id.toString() === id);

        if (currentIndex === -1) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Determine the new index position
        const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        // Prevent out-of-bounds errors
        if (swapIndex < 0 || swapIndex >= categories.length) {
            return res.status(400).json({ message: 'Cannot move further' });
        }

        const current = categories[currentIndex];
        const swap = categories[swapIndex];

        // Swap their indexes safely
        const temp = current.index;
        current.index = swap.index;
        swap.index = temp;

        await current.save();
        await swap.save();

        const updatedCategories = await Category.find().sort({ index: 1 });

        res.status(200).json({
            message: `Moved category ${direction}`,
            categories: updatedCategories
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
