const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const DbService = require('../services/db.service');

const { businessPostValidation } = require('../validation/hapi');
const { businessPutValidation } = require('../validation/hapi');

const ResponseError = require('../errors/responseError');

const { DEFAULT_ERROR_MESSAGE, HTTP_STATUS_CODES, COLLECTIONS } = require('../global');
const { Business } = require('../db//models/Business.model');
const adminAuthenticate = require('../middlewares/adminAuthenticate');
const CryptoService = require('../services/crypto.service');

router.post('/', adminAuthenticate, async (req, res, next) => {
    const { error } = businessPostValidation(req.body);
    if (error) {
        return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));
    }
    try
    {
        const existingBusiness = await DbService.getOne(COLLECTIONS.BUSINESSES, { website: req.body.website });
        if(existingBusiness) return next(new ResponseError('Business already exists', HTTP_STATUS_CODES.CONFLICT));

        const newBusiness = new Business(req.body);
        if(req.body.senderPassword) newBusiness.senderPassword = CryptoService.hash(req.body.senderPassword);

        await DbService.create(COLLECTIONS.BUSINESSES, newBusiness);

        return res.sendStatus(HTTP_STATUS_CODES.CREATED);
    }
    catch (error)
    {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE. error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/:tld', async (req, res, next) => { 
    try
    {
        const business = await DbService.getOne(COLLECTIONS.BUSINESSES, { website: { "$regex": req.params.tld, "$options": 'i' } });

        if (!business || business.status === 'deleted') return next(new ResponseError('errors.not_found', HTTP_STATUS_CODES.NOT_FOUND));
        
        if(business.status !== 'active') return next(new ResponseError('errors.inactive', HTTP_STATUS_CODES.CONFLICT));

        const businessInfo = {
            name: business.name,
            description: business.description,
            logo: business.logo,
            website: business.website,
            phone: business.phone,
            email: business.email,
            socialMedia: business.socialMedia,
            workingHours: business.workingHours,
            availableCalendar: true,
            maximumDaysInFuture: business.maximumDaysInFuture,
            status: business.status,
            privacyPolicyURL: business.privacyPolicyURL
        };

        const services = await DbService.getMany(COLLECTIONS.SERVICES, { businessId: new mongoose.Types.ObjectId(business._id), status: 'active' });
        businessInfo.services = services;

        const locations = await DbService.getMany(COLLECTIONS.LOCATIONS, { businessId: new mongoose.Types.ObjectId(business._id), status: 'active' });
        businessInfo.locations = locations;

        const employees = await DbService.getMany(COLLECTIONS.EMPLOYEES, { businessId: new mongoose.Types.ObjectId(business._id), status: 'active' });
        businessInfo.employees = employees;

        const calendar = await DbService.getOne(COLLECTIONS.CALENDARS, { businessId: new mongoose.Types.ObjectId(business._id) });
        if(!calendar || calendar.status !== 'active') businessInfo.availableCalendar = false;
        businessInfo.calendar = calendar;

        return res.status(HTTP_STATUS_CODES.OK).send({
            business: businessInfo
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