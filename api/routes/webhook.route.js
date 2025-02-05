const express = require('express');
const crypto = require('crypto');
const DbService = require('../services/db.service');
const { COLLECTIONS } = require('../global');
const { Event } = require('../db/models/Event.model');
const { default: mongoose } = require('mongoose');
const TeamupService = require('../services/teamup.service');
const CalendarService = require('../services/calendar.service');
const router = express.Router();

router.post('/event', async (req, res, next) => {
    const webhookSecret = 'C6nKjhS5fj9rQhcQ5hppEht44ARc2z7n559SdJt97uMZTBYJ9mejLkvGNEqXZbAAzZrc58hLQz2RQzBGePib7p5eCJaVrjysoPHAUfvvA3HJ22BZGFrf911C6skFSFYr';
    const signature = req.headers['teamup-signature'];
    const payload = JSON.stringify(req.body);

    const hash = crypto.createHmac('sha256', webhookSecret)
                       .update(payload)
                       .digest('hex');

    if (hash === signature) {
        const dispatch = req.body.dispatch;

        if(dispatch && dispatch.length > 0) {
            for(let item of dispatch) {
                const trigger = item.trigger;
                const eventId = item.event.id;
                const event = item.event;

                const subcalendar_ids = event.subcalendar_ids;
                const employee = await DbService.getOne(COLLECTIONS.EMPLOYEES, { teamupSubCalendarId: {"$in" : [subcalendar_ids[0], subcalendar_ids[0].toString()]} });
                if(!employee) return res.status(404).send('Employee not found');

                const businessId = employee.businessId;
                const business = await DbService.getById(COLLECTIONS.BUSINESSES, businessId);
                if(!business) return res.status(404).send('Business not found');

                const calendar = await DbService.getOne(COLLECTIONS.CALENDARS, { businessId });
                if(!calendar) return res.status(404).send('Calendar not found');
    
                if(trigger == 'event.removed') {
                    if(!event.rrule) {
                        await DbService.delete(COLLECTIONS.EVENTS, { teamupEventId: eventId });
                    } else {
                        try {
                            await CalendarService.syncCalendar(calendar._id);
                        } catch (error) {
                            console.error(error);
                        }
                    }
                    return res.status(200).send('Event received');
                }
    
                const newEvent = new Event({
                    calendarId: new mongoose.Types.ObjectId(calendar._id),
                    teamupSubCalendarIds: event.subcalendar_ids,
                    allDay: event.all_day,
                    rrule: event.rrule,
                    teamupEventId: eventId,
                    start: event.start_dt,
                    end: event.end_dt
                });

    
                if(trigger == 'event.created') {
                    if(!event.rrule) {
                        await DbService.create(COLLECTIONS.EVENTS, newEvent);
                    }
                    else {
                        try {
                            await CalendarService.syncCalendar(calendar._id);
                        } catch (error) {
                            console.error(error);
                        }
                    }
                } else if(trigger == 'event.modified') {
                    if(!event.rrule) {
                        await DbService.delete(COLLECTIONS.EVENTS, { teamupEventId: eventId });
                        await DbService.create(COLLECTIONS.EVENTS, newEvent);
                    } else {
                        try {
                            await CalendarService.syncCalendar(calendar._id);
                        } catch (error) {
                            console.error(error);
                        }
                    }
                }
            }
        }
        
        res.status(200).send('Event received');
    } else {
        res.status(401).send('Invalid signature');
    }
});

module.exports = router;