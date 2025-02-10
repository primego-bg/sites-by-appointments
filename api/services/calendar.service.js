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
    getAvailableTimeSlotsForService: async (businessId, timeSlotsDuration, teamupSubCalendarId=undefined) => {
        try {
            const business = await DbService.getById(COLLECTIONS.BUSINESSES, businessId);
            if(!business) return null;
            const businessMaximumDaysInFuture = business.maximumDaysInFuture;
            const businessMinimumTimeSlots = business.minimumTimeSlotsInFuture;
            const businessSlotTime = business.slotTime;

            const calendar = await DbService.getOne(COLLECTIONS.CALENDARS, { businessId: new mongoose.Types.ObjectId(businessId) });
            if(!calendar) return null;

            const employee = await DbService.getOne(COLLECTIONS.EMPLOYEES,  { '$or': [{teamupSubCalendarId: teamupSubCalendarId}, {teamupSubCalendarId: parseInt(teamupSubCalendarId, 10)}] } );
            if(!employee) return null;

            const location = await DbService.getOne(COLLECTIONS.LOCATIONS, { employees: { '$in': [employee._id, new mongoose.Types.ObjectId(employee._id)]}});
            if(!location) return null;

            const workingHours = location.workingHours;
            if(!workingHours) return null;

            const momentTimezone = calendar.timezone;

            // get events from calendars
            // TODO: events shall be got from now on
            const events = !teamupSubCalendarId
                ? await DbService.getMany(COLLECTIONS.EVENTS, { calendarId: new mongoose.Types.ObjectId(calendar._id) })
                : await DbService.getMany(COLLECTIONS.EVENTS, { calendarId: new mongoose.Types.ObjectId(calendar._id), teamupSubCalendarIds: { '$in': [teamupSubCalendarId, parseInt(teamupSubCalendarId, 10)] } });

            const availableTimeSlots = [];
            const today = moment().tz(momentTimezone).toISOString();

            // get all available time slots
            // iterate through each day from today to todayPlusMaxDays
            
            for (let i = 0; i < businessMaximumDaysInFuture; i++) {
                const currentDate = moment(today).add(i, 'days').tz(momentTimezone).toISOString();
                const currentDay = moment(currentDate).tz(momentTimezone).format('dddd').toLowerCase();
            
                // Calculate the cutoff time for the current date
                const minimumTimeAllowed = moment(today)
                    .add(businessMinimumTimeSlots * businessSlotTime, 'minutes') // Add minimum time slots in the future
                    .tz(momentTimezone).toISOString();
            
                let isBusinessOpen = false;
                let businessOpenTime = null;
                let businessCloseTime = null;
            
                for (let j = 0; j < workingHours.length; j++) {
                    if (workingHours[j].day === currentDay) {
                        if (workingHours[j].open === undefined || workingHours[j].close === undefined) break;
                        isBusinessOpen = true;
                        businessOpenTime = moment(currentDate).set({
                            hour: parseInt(workingHours[j].open.split(':')[0]),
                            minute: parseInt(workingHours[j].open.split(':')[1]),
                        }).tz(momentTimezone).toISOString();
                        businessCloseTime = moment(currentDate).set({
                            hour: parseInt(workingHours[j].close.split(':')[0]),
                            minute: parseInt(workingHours[j].close.split(':')[1]),
                        }).tz(momentTimezone).toISOString();
                        break;
                    }
                }
            
                // Skip the day if the business is not open
                if (!isBusinessOpen) continue;
            
                // Ensure the business open time respects the minimum cutoff
                while (moment(businessOpenTime).isBefore(minimumTimeAllowed)) {
                    businessOpenTime = moment(businessOpenTime).add(timeSlotsDuration, 'minutes').tz(momentTimezone).toISOString();
                }
            
                // Generate time slots for the current day
                let currentTime = moment(businessOpenTime).toISOString();
                while (moment(currentTime).isBefore(businessCloseTime)) {
                    const endTime = moment(currentTime).add(timeSlotsDuration, 'minutes').tz(momentTimezone).toISOString();
                    if (moment(endTime).isAfter(businessCloseTime)) break;
            
                    let isTimeSlotAvailable = true;
                    if (events) {
                        for (let j = 0; j < events.length; j++) {
                            const event = events[j];
                            const eventStartDt = moment(event.start).tz(momentTimezone).seconds(0).milliseconds(0).toISOString();
                            const eventEndDt = moment(event.end).tz(momentTimezone).seconds(0).milliseconds(0).toISOString();
            
                            if (
                                !(
                                    moment(currentTime).isSame(eventEndDt, 'minute') || 
                                    moment(endTime).isSame(eventStartDt, 'minute')
                                ) &&
                                moment(currentTime).isBefore(eventEndDt) && 
                                moment(endTime).isAfter(eventStartDt)
                            ) {
                                isTimeSlotAvailable = false;
                                break;
                            }

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
            
                    currentTime = moment(currentTime).add(timeSlotsDuration, 'minutes').tz(momentTimezone).toISOString();
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

            const momentTimezone = calendar.timezone;
            startDt = moment(startDt).tz(momentTimezone).seconds(0).milliseconds(0).toISOString();
            endDt = moment(endDt).tz(momentTimezone).seconds(0).milliseconds(0).toISOString();

            const timeSlotsDuration = moment(endDt).diff(moment(startDt), 'minutes');
            const availableTimeSlots = await CalendarService.getAvailableTimeSlotsForService(calendar.businessId, timeSlotsDuration, teamupSubCalendarId);
            if(!availableTimeSlots || availableTimeSlots.length == 0) return null;

            let isTimeSlotValid = false;
            for(let i = 0; i < availableTimeSlots.length; i++) {
            if(startDt === availableTimeSlots[i].start && endDt === availableTimeSlots[i].end) {
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