const express = require("express");
const router = express.Router();

const eventRoute = require("./event.route");
const businessRoute = require('./business.route');
const calendarRoute = require('./calendar.route');
const employeeRoute = require('./employee.route');
const locationRoute = require('./location.route');
const serviceRoute = require('./service.route');

router.use("/event", eventRoute);
router.use("/business", businessRoute);
router.use("/calendar", calendarRoute);
router.use("/employee", employeeRoute);
router.use("/location", locationRoute);
router.use("/service", serviceRoute);

module.exports = router;