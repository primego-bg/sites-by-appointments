const express = require("express");
const mongoose = require("mongoose");
const { COLLECTIONS, HTTP_STATUS_CODES, DEFAULT_ERROR_MESSAGE } = require("../global");
const ResponseError = require("../errors/responseError");
const DbService = require("../services/db.service");

const router = express.Router();

router.get('/:employeeId', async (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.employeeId)) 
        return next(new ResponseError('errors.invalid_id', HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const notices = await DbService.getMany(COLLECTIONS.NOTICES, { employeeId: new mongoose.Types.ObjectId(req.params.employeeId) });
        return res.status(HTTP_STATUS_CODES.OK).send(notices);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;