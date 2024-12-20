const express = require('express');
const { calendarPostValidation } = require('../validation/hapi');
const { HTTP_STATUS_CODES, DEFAULT_ERROR_MESSAGE } = require('../global');
const router = express.Router();

router.post('/', async (req, res, next) => {
    const {error} = calendarPostValidation(req.body);

    if(error)
    {
        return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));
    }

    try 
    {
        
    } 
    catch (error) 
    {
        return next(new ResponseError(error.message || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR || DEFAULT_ERROR_MESSAGE, error.status));
    }
});

module.exports = router;