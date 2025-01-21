const express = require('express');
const app = express();
const cors = require('cors');
const mongo = require("./db/mongo");
const indexRoute = require('./routes/index.route');
const errorHandler = require('./errors/errorHandler');
const dotenv = require('dotenv');
const TeamupService = require('./services/teamup.service');
const CalendarService = require('./services/calendar.service');
const CryptoService = require('./services/crypto.service');
const EmailService = require('./services/email.service');

dotenv.config();

app
    .use(cors())
    .use(express.json({
        limit: '10mb'
    }))
    .use(express.urlencoded({ extended: true, limit: '10mb' }))
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
    //EmailService.sendEmail("67901559235c38f677a13c5c", "vencidim04@gmail.com", "Потвърждение на час", "Това е съобщение за потвърждение на час");
})();
