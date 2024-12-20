const DATABASE_MODELS = {
    CALENDAR: "Calendar",
    EVENT: "Event"
}

const COLLECTIONS = {
    CALENDARS: "calendars",
    EVENTS: "events"
}

const HTTP_STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
}

const DEFAULT_ERROR_MESSAGE = "Internal server error";

module.exports = {
    DATABASE_MODELS,
    COLLECTIONS,
    HTTP_STATUS_CODES,
    DEFAULT_ERROR_MESSAGE
}