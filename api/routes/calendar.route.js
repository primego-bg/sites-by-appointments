const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const DbService = require('../services/db.service');

const { calendarPostValidation } = require('../validation/hapi');
const { calendarPutValidation } = require('../validation/hapi');

const ResponseError = require('../errors/responseError');

const { DEFAULT_ERROR_MESSAGE, HTTP_STATUS_CODES, COLLECTIONS } = require('../global');
const { adminAuthenticate } = require('../services/authentication.service');
const {Calendar} = require('../db/models/Calendar.model');

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

        //TODO: get data for the calendar configuration from teamup's api

        const newCalendar = new Calendar(req.body);
        await DbService.create(COLLECTIONS.CALENDARS, newCalendar);

        return res.sendStatus(HTTP_STATUS_CODES.CREATED);
    }
    catch (error)
    {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

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