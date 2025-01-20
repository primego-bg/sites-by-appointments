const { HTTP_STATUS_CODES } = require("../global");

const adminAuthenticate = (req, res, next) => {
    if(!req.headers['admin_password'] || req.headers['admin_password'] !== process.env.ADMIN_PASSWORD) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).send("Unauthorized");
    }
    next();
}

module.exports = adminAuthenticate;