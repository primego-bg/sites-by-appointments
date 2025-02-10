const express = require('express');
const app = express();
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongo = require("./db/mongo");
const indexRoute = require('./routes/index.route');
const errorHandler = require('./errors/errorHandler');
const dotenv = require('dotenv');
const CalendarService = require('./services/calendar.service');
const EmailService = require('./services/email.service');
const CryptoService = require('./services/crypto.service');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});

dotenv.config();

app
    .use(cors())
    .use(express.json({
        limit: '10mb'
    }))
    .use(express.urlencoded({ extended: true, limit: '10mb' }))
    .use('/', limiter)
    .use("/", indexRoute)
    .use(errorHandler)

mongo.connect().then(() => {
    console.log("Connected to database");
});

const port = process.env.PORT;

app.listen(port, function () {
    console.log("API server listening on port " + port);
});

(async function init() { 
    CalendarService.syncAllCalendars();
    //console.log(CryptoService.hash(""));
    //EmailService.sendEmail("67901559235c38f677a13c5c", "vencidim04@gmail.com", "Потвърждение на час", "Това е съобщение за потвърждение на час");
})();
