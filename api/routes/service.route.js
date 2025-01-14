const express = require('express');
const router = express.Router();

const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE } = require('../global');

const DbService = require('../services/db.service');
const adminAuthenticate = require('../middlewares/adminAuthenticate');
const { servicePostValidation, servicePutValidation } = require('../validation/hapi');
const { default: mongoose } = require('mongoose');
const { Service } = require('../db/models/Service.model');

router.post('/', adminAuthenticate, async (req, res, next) => {
    const { error } = servicePostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const businessId = new mongoose.Types.ObjectId(req.body.businessId);
        const business = await DbService.getById(COLLECTIONS.BUSINESSES, businessId);
        if (!business || business.status === 'deleted') return next(new ResponseError('Business not found', HTTP_STATUS_CODES.NOT_FOUND));
        if (business.status !== 'active') return next(new ResponseError('Business is not active', HTTP_STATUS_CODES.BAD_REQUEST));

        const serviceObject = new Service(req.body);
        await DbService.create(COLLECTIONS.SERVICES, serviceObject);
        
        return res.sendStatus(HTTP_STATUS_CODES.CREATED);
    } catch(err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/:id', async (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) 
        return next(new ResponseError('errors.invalid_id', HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const serviceId = new mongoose.Types.ObjectId(req.params.id);
        const service = await DbService.getById(COLLECTIONS.SERVICES, serviceId);
        if (!service || service.status === 'deleted') return next(new ResponseError('errors.not_found', HTTP_STATUS_CODES.NOT_FOUND));
        if (service.status !== 'active') return next(new ResponseError('errors.inactive', HTTP_STATUS_CODES.CONFLICT));

        const business = await DbService.getById(COLLECTIONS.BUSINESSES, new mongoose.Types.ObjectId(service.businessId));
        if (!business || business.status === 'deleted') return next(new ResponseError('errors.not_found', HTTP_STATUS_CODES.NOT_FOUND));
        if (business.status !== 'active') return next(new ResponseError('errors.inactive', HTTP_STATUS_CODES.CONFLICT));

        return res.status(HTTP_STATUS_CODES.OK).send(service);
    } catch(err) {
        return next(new ResponseError('errors.internal_server_error', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

// can change price, timeSlots, status
router.put('/:id', adminAuthenticate, async (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) 
        return next(new ResponseError('Invalid service id', HTTP_STATUS_CODES.BAD_REQUEST));

    const { error } = servicePutValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const serviceId = new mongoose.Types.ObjectId(req.params.id);
        const service = await DbService.getById(COLLECTIONS.SERVICES, serviceId);
        if (!service || service.status === 'deleted') return next(new ResponseError('Service not found', HTTP_STATUS_CODES.NOT_FOUND));

        const businessId = new mongoose.Types.ObjectId(req.body.businessId);
        const business = await DbService.getById(COLLECTIONS.BUSINESSES, businessId);
        if (!business || business.status === 'deleted') return next(new ResponseError('Business not found', HTTP_STATUS_CODES.NOT_FOUND));
        if (business.status !== 'active') return next(new ResponseError('Business is not active', HTTP_STATUS_CODES.BAD_REQUEST));

        await DbService.update(COLLECTIONS.SERVICES, { _id: serviceId }, req.body);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch(err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;