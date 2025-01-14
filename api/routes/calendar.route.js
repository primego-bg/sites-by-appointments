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
    try
    {
        const { error } = calendarPostValidation(req.body);
        if (error) 
        {
            return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));
        }

        const existingCalendar = await DbService.getOne(Calendar.collection.name, { businessId: req.body.businessId });
        if (existingCalendar) {
            return res.status(HTTP_STATUS_CODES.CONFLICT).send('Calendar already exists for this business');
        }

        const newCalendar = await DbService.create(Calendar.collection.name, req.body);
        await DbService.create(COLLECTIONS.CALENDARS, newCalendar);

        return res.status(HTTP_STATUS_CODES.CREATED).json({
            newCalendar
        });
    }
    catch (error)
    {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/:id', async (req, res, next) => {
    try
    {
        if(!mongoose.Types.ObjectId.isValid(req.params.id)) 
        {
            return next(new ResponseError('errors.invalid_id', HTTP_STATUS_CODES.BAD_REQUEST));
        }

        const calendarId = new mongoose.Types.ObjectId(req.params.id);
        const calendar = await DbService.getById(COLLECTIONS.CALENDARS, calendarId);

        if (!calendar || calendar.status === 'deleted') 
        {
            return next(new ResponseError('errors.internal_server_error', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
        }

        return res.status(HTTP_STATUS_CODES.OK).json(calendar);
    }
    catch (error)
    {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put('/:id', adminAuthenticate, async (req, res, next) => {
    try
    {
        if(!mongoose.Types.ObjectId.isValid(req.params.id)) 
        {
            return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));
        }

        const calendarId = new mongoose.Types.ObjectId(req.params.id);
        const calendar = await DbService.getById(COLLECTIONS.CALENDARS, calendarId);

        if (!calendar || calendar.status === 'deleted') 
        {
            return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
        }

        const { error } = calendarPutValidation(req.body);
        if (error) 
        {
            return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));
        }

        const updatedCalendar = await DbService.update(COLLECTIONS.CALENDARS, calendarId, req.body);

        return res.status(HTTP_STATUS_CODES.OK).send({
            updatedCalendar: updatedCalendar
        });
    }
    catch (error)
    {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});