const express = require('express');
const router = express.Router();

const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE } = require('../global');

const DbService = require('../services/db.service');
const adminAuthenticate = require('../middlewares/adminAuthenticate');
const { locationPostValidation, locationPutValidation } = require('../validation/hapi');
const { default: mongoose } = require('mongoose');
const { Location } = require('../db/models/Location.model');

router.post('/', adminAuthenticate, async (req, res, next) => {
    const { error } = locationPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const businessId = new mongoose.Types.ObjectId(req.body.businessId);
        const business = await DbService.getById(COLLECTIONS.BUSINESSES, businessId);
        if (!business || business.status === 'deleted') return next(new ResponseError('Business not found', HTTP_STATUS_CODES.NOT_FOUND));
        if (business.status !== 'active') return next(new ResponseError('Business is not active', HTTP_STATUS_CODES.BAD_REQUEST));

        for (let employeeId of req.body.employees) {
            const employee = await DbService.getById(COLLECTIONS.EMPLOYEES, new mongoose.Types.ObjectId(employeeId));
            if (!employee || employee.status === 'deleted') return next(new ResponseError('Employee not found', HTTP_STATUS_CODES.NOT_FOUND));
            if (employee.status !== 'active') return next(new ResponseError(`Employee ${employee.name} is not active`, HTTP_STATUS_CODES.BAD_REQUEST));
            if(employee.businessId.toString() !== businessId.toString()) return next(new ResponseError(`Employee ${employee.name} does not belong to business`, HTTP_STATUS_CODES.BAD_REQUEST));
        }

        const locationObject = new Location(req.body);
        await DbService.create(COLLECTIONS.LOCATIONS, locationObject);
        
        return res.sendStatus(HTTP_STATUS_CODES.CREATED);    
    } catch(err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/:id', async (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) 
        return next(new ResponseError('errors.invalid_id', HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const locationId = new mongoose.Types.ObjectId(req.params.id);
        const location = await DbService.getById(COLLECTIONS.LOCATIONS, locationId);
        if (!location || location.status === 'deleted') return next(new ResponseError('errors.not_found', HTTP_STATUS_CODES.NOT_FOUND));
        if (location.status !== 'active') return next(new ResponseError('errors.inactive', HTTP_STATUS_CODES.CONFLICT));
        
        const business = await DbService.getById(COLLECTIONS.BUSINESSES, new mongoose.Types.ObjectId(location.businessId));
        if (!business || business.status === 'deleted') return next(new ResponseError('errors.not_found', HTTP_STATUS_CODES.NOT_FOUND));
        if (business.status !== 'active') return next(new ResponseError('errors.inactive', HTTP_STATUS_CODES.CONFLICT));

        return res.status(HTTP_STATUS_CODES.OK).send(location);
    } catch(err) {
        return next(new ResponseError('errors.internal_server_error', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

// can change name, employees, status
router.put('/:id', adminAuthenticate, async (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) 
        return next(new ResponseError('Invalid location id', HTTP_STATUS_CODES.BAD_REQUEST));

    const { error } = locationPutValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const locationId = new mongoose.Types.ObjectId(req.params.id);
        const location = await DbService.getById(COLLECTIONS.LOCATIONS, locationId);
        if (!location || location.status === 'deleted') return next(new ResponseError('Location not found', HTTP_STATUS_CODES.NOT_FOUND));
        if (location.status !== 'active') return next(new ResponseError('Location is not active', HTTP_STATUS_CODES.CONFLICT));

        const business = await DbService.getById(COLLECTIONS.BUSINESSES, new mongoose.Types.ObjectId(req.body.businessId));
        if (!business || business.status === 'deleted') return next(new ResponseError('Business not found', HTTP_STATUS_CODES.NOT_FOUND));
        if (business.status !== 'active') return next(new ResponseError('Business is not active', HTTP_STATUS_CODES.BAD_REQUEST));

        for (let employeeId of req.body.employees) {
            const employee = await DbService.getById(COLLECTIONS.EMPLOYEES, new mongoose.Types.ObjectId(employeeId));
            if (!employee || employee.status === 'deleted') return next(new ResponseError('Employee not found', HTTP_STATUS_CODES.NOT_FOUND));
            if (employee.status !== 'active') return next(new ResponseError(`Employee ${employee.name} is not active`, HTTP_STATUS_CODES.BAD_REQUEST));
            if(employee.businessId.toString() !== business._id.toString()) return next(new ResponseError(`Employee ${employee.name} does not belong to business`, HTTP_STATUS_CODES.BAD_REQUEST));
        }

        await DbService.update(COLLECTIONS.LOCATIONS, { _id: locationId }, req.body);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch(err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;