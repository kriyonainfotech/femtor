const express = require("express");
const router = express.Router();

router.use('/users', require('./userRoutes'));
// router.use('/coaches', require('./coachRoutes'));
router.use("/coach", require("./coachRoutes"))
router.use('/categories', require('./categoryRoutes'));

module.exports = router;
