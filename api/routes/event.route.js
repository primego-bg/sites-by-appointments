const express = require('express');
const { HTTP_STATUS_CODES, DATABASE_MODELS } = require('../global');
const { default: mongoose } = require('mongoose');
const router = express.Router();
const DbService = require('../services/db.service');

router.post('/', async (req, res, next) => {
    const { error } = eventPostValidation(req.body);
    if(error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const calendar = await DbService.getOne(DATABASE_MODELS.CALENDAR, { _id: new mongoose.Types.ObjectId(req.body.calendarId) });
        if(!calendar) return next(new ResponseError("Calendar not found", HTTP_STATUS_CODES.NOT_FOUND));

        const event = await DbService.create(DATABASE_MODELS.EVENT, req.body);
        return res.status(HTTP_STATUS_CODES.CREATED).send(event);

    } catch(err) {
        return next(new ResponseError(err.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;