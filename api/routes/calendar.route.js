const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const DbService = require('../services/db.service');

const { calendarPostValidation } = require('../validation/hapi');
const { calendarPutValidation } = require('../validation/hapi');

const ResponseError = require('../errors/responseError');

const { DEFAULT_ERROR_MESSAGE, HTTP_STATUS_CODES, COLLECTIONS } = require('../global');
const {Calendar} = require('../db/models/Calendar.model');
const adminAuthenticate = require('../middlewares/adminAuthenticate');
const TeamupService = require('../services/teamup.service');
const { Event } = require('../db/models/Event.model');

router.post('/', adminAuthenticate, async (req, res, next) => {
    const { error } = calendarPostValidation(req.body);
    if (error) 
    {
        return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));
    }

    try
    {
        const existingCalendar = await DbService.getOne(COLLECTIONS.CALENDARS, { businessId: new mongoose.Types.ObjectId(req.body.businessId) });
        if (existingCalendar) {
            return next(new ResponseError('Calendar already set for this business', HTTP_STATUS_CODES.CONFLICT));
        }

        const result = await TeamupService.getCalendarConfiguration(req.body.teamupSecretCalendarKey, req.body.teamupApiKey);
        if(!result) return next(new ResponseError('Teamup calendar configuration retrieval failed', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));

        const newCalendar = new Calendar(req.body);
        await DbService.create(COLLECTIONS.CALENDARS, newCalendar);

        const events = await TeamupService.getInitialEvents(req.body.teamupSecretCalendarKey, req.body.teamupApiKey, new Date().toISOString());
        for(let event of events) {
            const newEvent = new Event({
                calendarId: newCalendar._id,
                teamupSubCalendarIds: event.subcalendar_ids,
                allDay: event.all_day,
                rrule: event.rrule,
                teamupEventId: event.id,
                start: event.start_dt,
                end: event.end_dt
            });

            await DbService.create(COLLECTIONS.EVENTS, newEvent);
        }

        await DbService.update(COLLECTIONS.CALENDARS, { _id: new mongoose.Types.ObjectId(newCalendar._id) }, { lastSynchronized: new Date() });

        return res.sendStatus(HTTP_STATUS_CODES.CREATED);
    }
    catch (error)
    {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post("/sync", async (req, res, next) => {
    console.log(new Date("2025-01-20T23:24:46.985+00:00").getTime());
    const results = await TeamupService.getModifiedEvents("kspp6eerhhtv6a2h8t", "5ae4cf471d2409b3ded388b38660835afdc31d1574ae4d7a71d0342ffc0eda5c", 1737323260);
    console.log(results);
    return res.sendStatus(HTTP_STATUS_CODES.OK);
})

router.get('/:id', async (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) 
    {
        return next(new ResponseError('errors.invalid_id', HTTP_STATUS_CODES.BAD_REQUEST));
    }
    try
    {

        const calendarId = new mongoose.Types.ObjectId(req.params.id);
        const calendar = await DbService.getById(COLLECTIONS.CALENDARS, calendarId);

        if (!calendar || calendar.status === 'deleted') 
        {
            return next(new ResponseError('errors.not_found', HTTP_STATUS_CODES.NOT_FOUND));
        }
        if(calendar.status !== 'active') 
        {
            return next(new ResponseError('errors.inactive', HTTP_STATUS_CODES.CONFLICT));
        }

        return res.status(HTTP_STATUS_CODES.OK).send(calendar);
    }
    catch (error)
    {
        return next(new ResponseError('errors.internal_server_error', error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put('/:id', adminAuthenticate, async (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) 
    {
        return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));
    }

    const { error } = calendarPutValidation(req.body);
    if (error) 
    {
        return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));
    }

    try
    {
        const calendarId = new mongoose.Types.ObjectId(req.params.id);
        const calendar = await DbService.getById(COLLECTIONS.CALENDARS, calendarId);

        if (!calendar || calendar.status === 'deleted') 
        {
            return next(new ResponseError('Calendar not found', HTTP_STATUS_CODES.NOT_FOUND));
        }
        if(calendar.status !== 'active') 
        {
            return next(new ResponseError('Calendar is inactive', HTTP_STATUS_CODES.CONFLICT));
        }

        await DbService.update(COLLECTIONS.CALENDARS, { _id: calendarId }, req.body);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    }
    catch (error)
    {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;