const express = require('express');
const { getEvents } = require('../services/teamup.service');
const { HTTP_STATUS_CODES } = require('../global');
const router = express.Router();

router.get('/', async (req, res, next) => {
    try 
    {
        const events = await getEvents();
        
        return res.status(HTTP_STATUS_CODES.OK).send({ events });
    } 
    catch (err) 
    {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;