const express = require("express");
const router = express.Router();

router.use('/users', require('./userRoutes'));
// router.use('/coaches', require('./coachRoutes'));
router.use("/coach", require("./coachRoutes"));
router.use('/categories', require('./categoryRoutes'));
router.use('/courses', require('./courseRoutes'));
router.use('/videos', require('./videoRoutes'));

module.exports = router;
