const { default: mongoose } = require('mongoose');
const { COLLECTIONS } = require('../global');
const DbService = require('./db.service');
const TeamupService = require('./teamup.service');
const { Event } = require('../db/models/Event.model');
const moment = require('moment-timezone');

const CalendarService = {
    syncAllCalendars: async () => {
        try {
            const calendars = await DbService.getMany(COLLECTIONS.CALENDARS, {});
            for(let calendar of calendars) {
                await DbService.update(COLLECTIONS.CALENDARS, { _id: new mongoose.Types.ObjectId(calendar._id) }, { status: "inactive" });

                let usedIds = [];

                const lastSyncDate = calendar.lastSynchronized 
                    ? new Date(new Date(calendar.lastSynchronized).getTime()).toISOString() 
                    : new Date(Date.now()).toISOString();

                const teamupEvents = await TeamupService.getInitialEvents(calendar.teamupSecretCalendarKey, calendar.teamupApiKey, lastSyncDate);
                if(teamupEvents) {
                    for(let teamupEvent of teamupEvents) {
                        usedIds.push(teamupEvent.id);
                        if(teamupEvent.rrule) {
                            await DbService.deleteMany(COLLECTIONS.EVENTS, { teamupEventId: { $regex: `^${teamupEvent.id}` } });
                        } else {
                            await DbService.deleteMany(COLLECTIONS.EVENTS, { teamupEventId: teamupEvent.id });
                        }
    
                        if(teamupEvent.deleted_dt) continue;
    
                        const newEvent = new Event({
                            calendarId: new mongoose.Types.ObjectId(calendar._id),
                            teamupSubCalendarIds: teamupEvent.subcalendar_ids,
                            allDay: teamupEvent.all_day,
                            rrule: teamupEvent.rrule,
                            teamupEventId: teamupEvent.id,
                            start: moment(teamupEvent.start_dt).seconds(0).milliseconds(0).toISOString(),
                            end: moment(teamupEvent.end_dt).seconds(0).milliseconds(0).toISOString()
                        });
                        await DbService.create(COLLECTIONS.EVENTS, newEvent);
                    }
                } 

                await DbService.deleteMany(COLLECTIONS.EVENTS, {
                    calendarId: new mongoose.Types.ObjectId(calendar._id),
                    teamupEventId: { $nin: usedIds }
                });

                await DbService.update(COLLECTIONS.CALENDARS, { _id: new mongoose.Types.ObjectId(calendar._id) }, { lastSynchronized: new Date().toISOString(), status: "active" });
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    syncCalendar: async (calendarId) => {
        try {
            const calendar = await DbService.getById(COLLECTIONS.CALENDARS, calendarId);
            if(!calendar) return null;
            await DbService.update(COLLECTIONS.CALENDARS, { _id: new mongoose.Types.ObjectId(calendar._id) }, { status: "inactive" });

            let usedIds = [];

            const lastSyncDate = calendar.lastSynchronized 
                ? new Date(new Date(calendar.lastSynchronized).getTime()).toISOString() 
                : new Date(Date.now()).toISOString();

            const teamupEvents = await TeamupService.getInitialEvents(calendar.teamupSecretCalendarKey, calendar.teamupApiKey, lastSyncDate);
            if(teamupEvents) {
                for(let teamupEvent of teamupEvents) {
                    usedIds.push(teamupEvent.id);
                    if(teamupEvent.rrule) {
                        await DbService.deleteMany(COLLECTIONS.EVENTS, { teamupEventId: { $regex: `^${teamupEvent.id}` } });
                    } else {
                        await DbService.deleteMany(COLLECTIONS.EVENTS, { teamupEventId: teamupEvent.id });
                    }

                    if(teamupEvent.deleted_dt) continue;

                    const newEvent = new Event({
                        calendarId: new mongoose.Types.ObjectId(calendar._id),
                        teamupSubCalendarIds: teamupEvent.subcalendar_ids,
                        allDay: teamupEvent.all_day,
                        rrule: teamupEvent.rrule,
                        teamupEventId: teamupEvent.id,
                        start: moment(teamupEvent.start_dt).seconds(0).milliseconds(0).toISOString(),
                        end: moment(teamupEvent.end_dt).seconds(0).milliseconds(0).toISOString()
                    });
                    await DbService.create(COLLECTIONS.EVENTS, newEvent);
                }
            } 

            await DbService.deleteMany(COLLECTIONS.EVENTS, {
                calendarId: new mongoose.Types.ObjectId(calendar._id),
                teamupEventId: { $nin: usedIds }
            });

            await DbService.update(COLLECTIONS.CALENDARS, { _id: new mongoose.Types.ObjectId(calendar._id) }, { lastSynchronized: new Date().toISOString(), status: "active" });
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    checkAvailability: async (calendarId, startDt, endDt, subCalendarId=null) => {
        try {
            // startDt and endDt are ISO strings

            const calendar = await DbService.getById(COLLECTIONS.CALENDARS, calendarId);
            if(!calendar) return null;
            // check availability based on event model records, business working hours, maximum days in future and minimum time slots
            // calendar is always synchronized
            
            // get business working hours
            const business = await DbService.getById(COLLECTIONS.BUSINESSES, calendar.businessId);
            if(!business) return null;
            const businessWorkingHours = business.workingHours;
            const businessMaximumDaysInFuture = business.maximumDaysInFuture;
            const businessMinimumTimeSlots = business.minimumTimeSlotsInFuture;
            const businessSlotTime = business.slotTime;
            const momentTimezone = calendar.timezone;

            startDt = moment(startDt).seconds(0).milliseconds(0).toISOString();
            endDt = moment(endDt).seconds(0).milliseconds(0).toISOString();

            // check if event startDt (ISO string) and endDt (ISO string) are within business working hours
            // the businessWorkingHours is an array that consists of objects with day, open and close properties
            // these are only the times in a given day when the business is open so this means that the business is closed by default
            // if the business is open on a given day, the open and close properties will have the time in 24-hour format
            // more than one objects with the same day property can exist in the array
            // the open and close properties are strings in the format "HH:mm"
            // now check
            let isStartDtWithinBusinessWorkingHours = false;
            let isEndDtWithinBusinessWorkingHours = false;

            for(let i = 0; i < businessWorkingHours.length; i++) {
                const localizedStartDt = moment(startDt).tz(momentTimezone);
                const localizedEndDt = moment(endDt).tz(momentTimezone);

                if(businessWorkingHours[i].day === localizedStartDt.format('dddd').toLowerCase()) {
                    // check if business is closed
                    if(businessWorkingHours[i].open === undefined || businessWorkingHours[i].close === undefined) return false;
                    // check if startDt is within business working hours
                    const businessStartDt = moment(localizedStartDt).set({
                        hour: parseInt(businessWorkingHours[i].open.split(':')[0]),
                        minute: parseInt(businessWorkingHours[i].open.split(':')[1])
                    }).toISOString();
                    if(localizedStartDt.isSameOrAfter(businessStartDt)) {
                        isStartDtWithinBusinessWorkingHours = true;
                    }
                }

                if(businessWorkingHours[i].day === localizedEndDt.format('dddd').toLowerCase()) {
                    // check if business is closed
                    if(businessWorkingHours[i].open === undefined || businessWorkingHours[i].close === undefined) return false;
                    // check if endDt is within business working hours
                    const businessEndDt = moment(localizedEndDt).set({
                        hour: parseInt(businessWorkingHours[i].close.split(':')[0]),
                        minute: parseInt(businessWorkingHours[i].close.split(':')[1])
                    }).toISOString();
                    if(localizedEndDt.isSameOrBefore(businessEndDt)) {
                        isEndDtWithinBusinessWorkingHours = true;
                    }
                }
            }

            if(!isStartDtWithinBusinessWorkingHours || !isEndDtWithinBusinessWorkingHours) return false;

            // check if event startDt and endDt are within maximum days in future
            const today = moment().tz(momentTimezone).toISOString();
            const todayPlusMaxDays = moment(today).add(businessMaximumDaysInFuture, 'days').toISOString();
            if(moment(startDt).isAfter(todayPlusMaxDays) || moment(endDt).isAfter(todayPlusMaxDays)) return false;

            // check if event startDt and endDt are within minimum time slots
            const startDtPlusMinTimeSlots = moment(startDt).tz(momentTimezone).add(businessMinimumTimeSlots * businessSlotTime, 'minutes').toISOString();
            if(moment(endDt).tz(momentTimezone).isBefore(startDtPlusMinTimeSlots)) return false;

            // get events from calendars
            const query = { calendarId: new mongoose.Types.ObjectId(calendarId) };
            if (subCalendarId) {
                query.teamupSubCalendarIds = { '$in': [subCalendarId] };
            }
            const events = await DbService.getMany(COLLECTIONS.EVENTS, query);
            if(events) {
                // check if event startDt and endDt are within existing events
                for(let i = 0; i < events.length; i++) {
                    const event = events[i];
                    const eventStartDt = moment(event.start).tz(momentTimezone).seconds(0).milliseconds(0).toISOString();
                    const eventEndDt = moment(event.end).tz(momentTimezone).seconds(0).milliseconds(0).toISOString();
                    if((moment(startDt).isBetween(eventStartDt, eventEndDt, null, '[)') || moment(endDt).isBetween(eventStartDt, eventEndDt, null, '(]'))) {
                        return false;
                    }
                }
            }

            return true;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    getAvailableTimeSlotsForService: async (businessId, timeSlotsDuration, teamupSubCalendarId=undefined) => {
        try {
            const business = await DbService.getById(COLLECTIONS.BUSINESSES, businessId);
            if(!business) return null;
            const businessWorkingHours = business.workingHours;
            const businessMaximumDaysInFuture = business.maximumDaysInFuture;
            const businessMinimumTimeSlots = business.minimumTimeSlotsInFuture;
            const businessSlotTime = business.slotTime;

            const calendar = await DbService.getOne(COLLECTIONS.CALENDARS, { businessId: new mongoose.Types.ObjectId(businessId) });
            if(!calendar) return null;

            // get events from calendars
            // TODO: events shall be got from now on
            const events = !teamupSubCalendarId
                ? await DbService.getMany(COLLECTIONS.EVENTS, { calendarId: new mongoose.Types.ObjectId(calendar._id) })
                : await DbService.getMany(COLLECTIONS.EVENTS, { calendarId: new mongoose.Types.ObjectId(calendar._id), teamupSubCalendarIds: { '$in': [teamupSubCalendarId] } });
            
            const availableTimeSlots = [];
            const today = moment().tz(calendar.timezone).toISOString();

            // get all available time slots
            // iterate through each day from today to todayPlusMaxDays
            
            for (let i = 0; i < businessMaximumDaysInFuture; i++) {
                const currentDate = moment(today).add(i, 'days').toISOString();
                const currentDay = moment(currentDate).format('dddd').toLowerCase();
            
                // Calculate the cutoff time for the current date
                const minimumTimeAllowed = moment(today)
                    .add(businessMinimumTimeSlots * businessSlotTime, 'minutes') // Add minimum time slots in the future
                    .toISOString();
            
                let isBusinessOpen = false;
                let businessOpenTime = null;
                let businessCloseTime = null;
            
                for (let j = 0; j < businessWorkingHours.length; j++) {
                    if (businessWorkingHours[j].day === currentDay) {
                        if (businessWorkingHours[j].open === undefined || businessWorkingHours[j].close === undefined) break;
                        isBusinessOpen = true;
                        businessOpenTime = moment(currentDate).set({
                            hour: parseInt(businessWorkingHours[j].open.split(':')[0]),
                            minute: parseInt(businessWorkingHours[j].open.split(':')[1]),
                        }).toISOString();
                        businessCloseTime = moment(currentDate).set({
                            hour: parseInt(businessWorkingHours[j].close.split(':')[0]),
                            minute: parseInt(businessWorkingHours[j].close.split(':')[1]),
                        }).toISOString();
                        break;
                    }
                }
            
                // Skip the day if the business is not open
                if (!isBusinessOpen) continue;
            
                // Ensure the business open time respects the minimum cutoff
                if (moment(businessOpenTime).isBefore(minimumTimeAllowed)) {
                    businessOpenTime = minimumTimeAllowed;
                }
            
                // Generate time slots for the current day
                let currentTime = moment(businessOpenTime).toISOString();
                while (moment(currentTime).isBefore(businessCloseTime)) {
                    const endTime = moment(currentTime).add(timeSlotsDuration, 'minutes').toISOString();
                    if (moment(endTime).isAfter(businessCloseTime)) break;
            
                    let isTimeSlotAvailable = true;
                    if (events) {
                        for (let j = 0; j < events.length; j++) {
                            const event = events[j];
                            const eventStartDt = moment(event.start).tz(calendar.timezone).seconds(0).milliseconds(0).toISOString();
                            const eventEndDt = moment(event.end).tz(calendar.timezone).seconds(0).milliseconds(0).toISOString();
            
                            if (
                                !(moment(currentTime).isSame(eventEndDt, 'minute') || moment(endTime).isSame(eventStartDt, 'minute'))
                            ) {
                                if (
                                    moment(currentTime).isBetween(eventStartDt, eventEndDt, null, '[)') ||
                                    moment(endTime).isBetween(eventStartDt, eventEndDt, null, '(]')
                                ) {
                                    isTimeSlotAvailable = false;
                                    break;
                                }
                            }
                        }
                    }
            
                    if (isTimeSlotAvailable) {
                        availableTimeSlots.push({
                            start: moment(currentTime).seconds(0).milliseconds(0).toISOString(),
                            end: moment(endTime).seconds(0).milliseconds(0).toISOString(),
                        });
                    }
            
                    currentTime = moment(currentTime).add(businessSlotTime, 'minutes').toISOString();
                }
            }            
            return availableTimeSlots;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    checkTimeSlotValidityAndAvailability: async (calendarId, startDt, endDt, teamupSubCalendarId=null) => {
        try {
            // startDt and endDt are ISO strings

            const calendar = await DbService.getById(COLLECTIONS.CALENDARS, calendarId);
            if(!calendar) return null;

            // get business
            const business = await DbService.getById(COLLECTIONS.BUSINESSES, calendar.businessId);
            if(!business) return null;

            // get availableTimeSlots and check if startDt and endDt match any of the available time slots
            // the duration is endDt - startDt in minutes / business.slotTime
            const businessSlotTime = business.slotTime;
            const timeSlotsDuration = moment(endDt).diff(moment(startDt), 'minutes') / businessSlotTime;
            const availableTimeSlots = await CalendarService.getAvailableTimeSlotsForService(calendar.businessId, timeSlotsDuration, teamupSubCalendarId);
            if(!availableTimeSlots) return null;

            let isTimeSlotValid = false;
            for(let i = 0; i < availableTimeSlots.length; i++) {
                if(moment(startDt).seconds(0).milliseconds(0).toISOString() === availableTimeSlots[i].start && moment(endDt).seconds(0).milliseconds(0).toISOString() === availableTimeSlots[i].end) {
                    isTimeSlotValid = true;
                    break;
                }
            }

            return isTimeSlotValid;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}

module.exports = CalendarService;