const express = require('express');
const router = express.Router();
const {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
    changeCategoryOrder,
} = require('../controller/categoryController');
// const { protect, admin } = require('../middleware/authMiddleware');

// router.route('/')
//     .get(getAllCategories) // Publicly accessible to show categories in the app
//     .post(protect, admin, createCategory); // Protected for creation

// router.route('/:id')
//     .put(protect, admin, updateCategory)
//     .delete(protect, admin, deleteCategory);

router.post('/create-category', createCategory)
router.get('/', getAllCategories)
router.put('/:id/order', changeCategoryOrder)
router.delete('/delete-category/:id', deleteCategory)
router.put('/update-category/:id', updateCategory)
router.get('/get-all-categories', getAllCategories)

module.exports = router;
