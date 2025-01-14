const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const DbService = require('../services/db.service');

const { businessPostValidation } = require('../validation/hapi');
const { businessPutValidation } = require('../validation/hapi');

const ResponseError = require('../errors/responseError');

const { DEFAULT_ERROR_MESSAGE, HTTP_STATUS_CODES, COLLECTIONS } = require('../global');
const { adminAuthenticate } = require('../services/authentication.service');
const { Business } = require('../db//models/business.model');

router.post('/', adminAuthenticate, async (req, res, next) => {
    const { error } = businessPostValidation(req.body);
    if (error) {
        return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));
    }
    try
    {

        const newBusiness = new Business(req.body);
        await DbService.create(COLLECTIONS.BUSINESSES, newBusiness);

        return res.sendStatus(HTTP_STATUS_CODES.CREATED);
    }
    catch (error)
    {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE. error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/:id', async (req, res, next) => { 
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) 
    {
        return next(new ResponseError('errors.invalid_id', HTTP_STATUS_CODES.BAD_REQUEST));
    }
    try
    {

        const businessId = new mongoose.Types.ObjectId(req.params.id);
        const business = await DbService.getById(COLLECTIONS.BUSINESSES, businessId);

        if (!business || business.status === 'deleted') 
        {
            return next(new ResponseError('errors.not_found', HTTP_STATUS_CODES.NOT_FOUND));
        }
        if(business.status !== 'active') {
            return next(new ResponseError('errors.inactive', HTTP_STATUS_CODES.CONFLICT));
        }

        //TODO: shall get all business info relevant to the frontend

        return res.status(HTTP_STATUS_CODES.OK).send({
            business: business
        });
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

    const { error } = businessPutValidation(req.body);
    if (error) 
    {
        return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));
    }

    try
    {
        

        const businessId = new mongoose.Types.ObjectId(req.params.id);
        const business = await DbService.getById(COLLECTIONS.BUSINESSES, businessId);

        if (!business || business.status === 'deleted') 
        {
            return next(new ResponseError('Business not found', HTTP_STATUS_CODES.NOT_FOUND));
        }
        if(business.status !== 'active') {
            return next(new ResponseError('Business is not active', HTTP_STATUS_CODES.CONFLICT));
        }

        await DbService.update(COLLECTIONS.BUSINESSES, { _id: businessId }, req.body);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    }
    catch (error)
    {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE. error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;