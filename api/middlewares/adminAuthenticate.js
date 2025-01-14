const { HTTP_STATUS_CODES } = require("../global");

const adminAuthenticate = (req, res, next) => {
    if(!req.headers['ADMIN_TOKEN'] || !req.headers['ADMIN_TOKEN'] === process.env.ADMIN_TOKEN) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).send("Unauthorized");
    }
    next();
}