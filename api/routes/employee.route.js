const express = require('express');
const router = express.Router();

const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE } = require('../global');

const DbService = require('../services/db.service');

const adminAuthenticate = require('../middlewares/adminAuthenticate');
const { employeePostValidation } = require('../validation/hapi');
const { Employee } = require('../db/models/Employee.model');

router.post('/', adminAuthenticate, async (req, res, next) => {
    const { error } = employeePostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const businessId = new mongoose.Types.ObjectId(req.body.businessId);
        const business = await DbService.getById(COLLECTIONS.BUSINESSES, businessId);
        if (!business || business.status === 'deleted') return next(new ResponseError('Business not found', HTTP_STATUS_CODES.NOT_FOUND));
        if (business.status !== 'active') return next(new ResponseError('Business is not active', HTTP_STATUS_CODES.BAD_REQUEST));

        for(const serviceId of req.body.services) {
            const service = await DbService.getById(COLLECTIONS.SERVICES, new mongoose.Types.ObjectId(serviceId));
            if (!service || service.status === 'deleted') return next(new ResponseError('Service not found', HTTP_STATUS_CODES.NOT_FOUND));
            if (service.status !== 'active') return next(new ResponseError(`Service ${service.name} is not active`, HTTP_STATUS_CODES.BAD_REQUEST));
            if(service.businessId.toString() !== businessId.toString()) return next(new ResponseError(`Service ${service.name} does not belong to business`, HTTP_STATUS_CODES.BAD_REQUEST));
        }

        const employeeObject = new Employee(req.body);
        await DbService.create(COLLECTIONS.EMPLOYEES, employeeObject);
        
        return res.sendStatus(HTTP_STATUS_CODES.CREATED);    
    } catch(err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/:id', async (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) 
        return next(new ResponseError('errors.invalid_id', HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const employeeId = new mongoose.Types.ObjectId(req.params.id);
        const employee = await DbService.getById(COLLECTIONS.EMPLOYEES, employeeId);
        if (!employee || employee.status === 'deleted') return next(new ResponseError('errors.not_found', HTTP_STATUS_CODES.NOT_FOUND));
        if (employee.status !== 'active') return next(new ResponseError('errors.inactive', HTTP_STATUS_CODES.CONFLICT));

        const business = await DbService.getById(COLLECTIONS.BUSINESSES, new mongoose.Types.ObjectId(employee.businessId));
        if (!business || business.status === 'deleted') return next(new ResponseError('errors.not_found', HTTP_STATUS_CODES.NOT_FOUND));
        if (business.status !== 'active') return next(new ResponseError('errors.inactive', HTTP_STATUS_CODES.CONFLICT));

        return res.status(HTTP_STATUS_CODES.OK).send(employee);
    } catch(err) {
        return next(new ResponseError('errors.internal_server_error', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

// can change teamupSubcalendarId, services, status
router.put('/:id', adminAuthenticate, async (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) 
        return next(new ResponseError('Invalid employee id', HTTP_STATUS_CODES.BAD_REQUEST));

    const { error } = employeePutValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const employeeId = new mongoose.Types.ObjectId(req.params.id);
        const employee = await DbService.getById(COLLECTIONS.EMPLOYEES, employeeId);
        if (!employee || employee.status === 'deleted') return next(new ResponseError('Employee not found', HTTP_STATUS_CODES.NOT_FOUND));

        for(const serviceId of req.body.services) {
            const service = await DbService.getById(COLLECTIONS.SERVICES, new mongoose.Types.ObjectId(serviceId));
            if (!service || service.status === 'deleted') return next(new ResponseError('Service not found', HTTP_STATUS_CODES.NOT_FOUND));
            if (service.status !== 'active') return next(new ResponseError(`Service ${service.name} is not active`, HTTP_STATUS_CODES.BAD_REQUEST));
            if(service.businessId.toString() !== businessId.toString()) return next(new ResponseError(`Service ${service.name} does not belong to business`, HTTP_STATUS_CODES.BAD_REQUEST));
        }

        await DbService.update(COLLECTIONS.EMPLOYEES, { _id: employeeId }, req.body);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch(err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;