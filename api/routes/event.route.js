const express = require('express');
const { HTTP_STATUS_CODES, DATABASE_MODELS } = require('../global');
const { default: mongoose } = require('mongoose');
const router = express.Router();
const DbService = require('../services/db.service');

router.get('/:projectId', async (req, res, next) => {
    try {
        if(!mongoose.Types.ObjectId.isValid(req.params.calendarId)) {
            return next(new ResponseError("Invalid calendar ID", HTTP_STATUS_CODES.BAD_REQUEST));
        }

        let end = new Date(req.query?.end);
        
        if(isNaN(end)) return next(new ResponseError("Invalid end date", HTTP_STATUS_CODES.BAD_REQUEST));

        const calendar = await DbService.getOne(DATABASE_MODELS.CALENDAR, { projectId: new mongoose.Types.ObjectId(req.params.projectId) });
        if(!calendar) return next(new ResponseError("Calendar not found", HTTP_STATUS_CODES.NOT_FOUND));

        const events = await DbService.getWithFilterAndProduct(DATABASE_MODELS.EVENT, 
            { 
                calendarId: new mongoose.Types.ObjectId(req.params.calendarId),
                end: { $lte: end ?? new Date().setDate(new Date().getDate() + calendar.maximumDaysInFuture) } 
            }
        );

        return res.status(HTTP_STATUS_CODES.OK).send(events);

    } catch(err) {
        return next(new ResponseError(err.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

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