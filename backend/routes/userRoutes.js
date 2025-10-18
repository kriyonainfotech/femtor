const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const upload = require('../utils/s3Uploader');

// The `upload.single('profilePicture')` middleware handles the file upload.
// 'profilePicture' is the field name the client must use in the form-data.
router.post('/create-user', upload.single('profilePicture'), userController.createUser);
router.post('/admin-create', upload.single('profilePicture'), userController.createUserByAdmin);
router.get('/get-users', userController.getAllUsers);
router.get('/get-user/:id', userController.getUserById);
router.put('/update-user/:id', upload.single('profilePicture'), userController.updateUser)
router.delete('/delete-user/:id', userController.deleteUser);
router.post('/login-admin', userController.loginUser);
router.post('/register-user', userController.registerUser);


module.exports = router;
