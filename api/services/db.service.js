const mongoose = require('mongoose');
const db = mongoose.connection;
const { COLLECTIONS, HTTP_STATUS_CODES, PERSONAL_TRAINER_STATUSES } = require('../global');

const ResponseError = require('../errors/responseError');

const validateCollection = (collection, reject) => {
    if (!Object.keys(COLLECTIONS).some(function (property) { return COLLECTIONS[property] === collection })) {
        reject(new ResponseError(`Invalid collection`, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
}

const DbService = {
    getOne: function (collection, filter) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).findOne(filter).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    },

    getMany: function (collection, filter) {
        return new Promise(async (resolve, reject) => {
            validateCollection(collection, reject);
            let results = [];
            try {
                db.collection(collection).find(filter, async function (err, cursor) {
                    if (err) return reject(new ResponseError(err.message || HTTP_STATUS_CODES.INTERNAL_SERVER));
                    await cursor.forEach(result => {
                        results.push(result);
                    })
                    resolve(results);
                });
            } catch (error) {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    },

    getManyWithDistinct: function (collection, filter, distinct) {
        return new Promise(async (resolve, reject) => {
            validateCollection(collection, reject);
            let results = [];
            try {
                db.collection(collection).distinct(distinct, filter, async function (err, cursor) {
                    if (err) return reject(new ResponseError(err.message || HTTP_STATUS_CODES.INTERNAL_SERVER));
                    await cursor.forEach(result => {
                        results.push(result);
                    })
                    resolve(results);
                });
            } catch (error) {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    },

    getById: function (collection, id) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).findOne({ _id: new mongoose.Types.ObjectId(id) }).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    },

    create: function (collection, data) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).insertOne(data).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    },

    update: function (collection, filter, data) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).findOneAndUpdate(filter, { "$set": data }).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    },

    updateWithInc: function (collection, filter, data) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).findOneAndUpdate(filter, { "$inc": data }).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    },

    updateMany: function (collection, filter, data) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).updateMany(filter, { "$set": data }).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    },

    pushUpdate: function (collection, filter, data) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).findOneAndUpdate(filter, { "$push": data }).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    },

    pullUpdate: function (collection, filter, data) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).findOneAndUpdate(filter, { "$pull": data }).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    },

    delete: function (collection, filter) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).findOneAndDelete(filter).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    },



    getWithFilterAndProduct: function (collection, filter, product) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            let results = [];
            db.collection(collection).find(filter, product, async function (err, cursor) {
                if (err) return reject(new ResponseError(err.message || HTTP_STATUS_CODES.INTERNAL_SERVER));
                await cursor.forEach(result => {
                    results.push(result);
                })
                resolve(results);
            });
        });
    },

    getManyWithSortAndLimit: function (collection, filter, sort, limit) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            let results = [];
            db.collection(collection).find(filter, { sort, limit }, async function (err, cursor) {
                if (err) return reject(new ResponseError(err.message || HTTP_STATUS_CODES.INTERNAL_SERVER));
                await cursor.forEach(result => {
                    results.push(result);
                })
                resolve(results);
            })
        })
    },

    getManyWithLimit: function (collection, filter, limit) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).find(filter).limit(limit).toArray(function (err, cursor) {
                if (err) return reject(new ResponseError(err.message || HTTP_STATUS_CODES.INTERNAL_SERVER));
                resolve(cursor);
            });
        })
    },

    getManyWithSort: function (collection, filter, sort) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).find(filter).sort(sort).toArray(function (err, cursor) {
                if (err) {
                    return reject(new ResponseError(err.message || HTTP_STATUS_CODES.INTERNAL_SERVER));
                }
                resolve(cursor);
            });
        })
    },

    lookUpAndMergeCoachesNames: function (toCollection, fromCollection, _id, userId, asField, name) {
        return new Promise((resolve, reject) => {
            validateCollection(fromCollection, reject);
            db.collection(toCollection).aggregate([
                {
                    $match:
                    {
                        $or:
                            [{ firstName: { $regex: name, $options: "i" } },
                            { lastName: { $regex: name, $options: "i" } }]
                    },

                },
                {
                    $lookup:
                    {
                        from: fromCollection,
                        as: asField,
                        let: { id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$$id", "$userId"] },
                                    status: PERSONAL_TRAINER_STATUSES.ACTIVE
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind:
                        { path: "$trainer", preserveNullAndEmptyArrays: false }
                }
            ]).toArray(function (err, cursor) {
                if (err) return reject(new ResponseError(err.message || HTTP_STATUS_CODES.INTERNAL_SERVER));
                resolve(cursor);
            });
        })
    },

    updateWithIncrement: function (collection, filter, data) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).findOneAndUpdate(filter, { "$inc": data }).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    }
}

module.exports = DbService;

