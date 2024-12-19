const express = require("express");
const router = express.Router();

const eventRoute = require("./event.route")

router.use("/event", eventRoute);

module.exports = router;