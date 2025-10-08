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
            

            // OPTIMIZATION 1: Pre-process events once - convert to timestamps and index by day
            const eventsByDay = {};
            if (events && events.length > 0) {
                for (const event of events) {
                    const eventStart = moment(event.start).tz(momentTimezone).seconds(0).milliseconds(0);
                    const eventEnd = moment(event.end).tz(momentTimezone).seconds(0).milliseconds(0);
                    const startTs = eventStart.valueOf();
                    const endTs = eventEnd.valueOf();
                    
                    // Index event by all days it spans
                    const daysSpanned = Math.ceil(eventEnd.diff(eventStart, 'days', true)) + 1;
                    for (let d = 0; d < daysSpanned; d++) {
                        const dayKey = eventStart.clone().add(d, 'days').format('YYYY-MM-DD');
                        if (!eventsByDay[dayKey]) eventsByDay[dayKey] = [];
                        eventsByDay[dayKey].push({ startTs, endTs });
                    }
                }
            }

            // OPTIMIZATION 2: Create working hours lookup map
            const workingHoursMap = {};
            for (const wh of workingHours) {
                if (wh.open !== undefined && wh.close !== undefined) {
                    workingHoursMap[wh.day] = {
                        openHour: parseInt(wh.open.split(':')[0]),
                        openMinute: parseInt(wh.open.split(':')[1]),
                        closeHour: parseInt(wh.close.split(':')[0]),
                        closeMinute: parseInt(wh.close.split(':')[1])
                    };
                }
            }

            const availableTimeSlots = [];
            const today = moment().tz(momentTimezone);
            const minimumTimeAllowedTs = today.clone()
                .add(businessMinimumTimeSlots * businessSlotTime, 'minutes')
                .valueOf();

            // get all available time slots
            // iterate through each day from today to todayPlusMaxDays
            
            for (let i = 0; i < businessMaximumDaysInFuture; i++) {
                const currentDate = today.clone().add(i, 'days').startOf('day');
                const currentDay = currentDate.format('dddd').toLowerCase();
                const dayKey = currentDate.format('YYYY-MM-DD');
            
                // OPTIMIZATION 3: Direct lookup instead of loop
                const dayHours = workingHoursMap[currentDay];
                if (!dayHours) continue; // Skip if business is not open this day
                
                // Set business hours for the day
                const businessOpenTime = currentDate.clone().set({
                    hour: dayHours.openHour,
                    minute: dayHours.openMinute,
                    second: 0,
                    millisecond: 0
                });
                
                const businessCloseTime = currentDate.clone().set({
                    hour: dayHours.closeHour,
                    minute: dayHours.closeMinute,
                    second: 0,
                    millisecond: 0
                });
            
                // OPTIMIZATION 4: Calculate slots to skip directly instead of loop
                let currentTime = businessOpenTime.clone();
                if (currentTime.valueOf() < minimumTimeAllowedTs) {
                    const diffMinutes = Math.ceil((minimumTimeAllowedTs - currentTime.valueOf()) / 60000);
                    const slotsToSkip = Math.ceil(diffMinutes / timeSlotsDuration);
                    currentTime.add(slotsToSkip * timeSlotsDuration, 'minutes');
                }
                
                // OPTIMIZATION 5: Get only events for this specific day
                const dayEvents = eventsByDay[dayKey] || [];
                const businessCloseTs = businessCloseTime.valueOf();
            
                // Generate time slots for the current day
                while (currentTime.valueOf() < businessCloseTs) {
                    const endTime = currentTime.clone().add(timeSlotsDuration, 'minutes');
                    const endTimeTs = endTime.valueOf();
                    
                    if (endTimeTs > businessCloseTs) break;
                    
                    const currentTimeTs = currentTime.valueOf();
            
                    // OPTIMIZATION 6: Check only relevant day events with simplified timestamp comparison
                    let isTimeSlotAvailable = true;
                    for (const event of dayEvents) {
                        // Slots are adjacent (touching) if slot_end == event_start OR slot_start == event_end
                        const touching = (endTimeTs === event.startTs) || (currentTimeTs === event.endTs);
                        
                        if (!touching) {
                            // Check for overlap: slot starts before event ends AND slot ends after event starts
                            if (currentTimeTs < event.endTs && endTimeTs > event.startTs) {
                                isTimeSlotAvailable = false;
                                break;
                            }
                        }
                    }
            
                    if (isTimeSlotAvailable) {
                        availableTimeSlots.push({
                            start: currentTime.toISOString(),
                            end: endTime.toISOString(),
                        });
                    }
            
                    currentTime.add(timeSlotsDuration, 'minutes');
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