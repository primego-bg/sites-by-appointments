const { default: mongoose } = require('mongoose');
const { COLLECTIONS } = require('../global');
const DbService = require('./db.service');

const CalendarService = {
    updateLastSynchronized: async (calendarId) => {
        try {
            const calendar = await DbService.getById(COLLECTIONS.CALENDARS, calendarId);
            if(!calendar) return null;
            await DbService.update(COLLECTIONS.CALENDARS, 
                { _id: new mongoose.Types.ObjectId(calendarId)}, 
                { lastSynchronized: new Date().toISOString() });
            return true;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    checkAvailability: async (calendarId, startDt, endDt) => {
        try {
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

            startDt = new Date(startDt);
            endDt = new Date(endDt);

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

                if(businessWorkingHours[i].day === startDt.toLocaleString('en-us', { weekday: 'long' }).toLowerCase()) {
                    // check if business is closed
                    if(businessWorkingHours[i].open === undefined || businessWorkingHours[i].close === undefined) return false;
                    // check if startDt is within business working hours
                    const businessStartDt = new Date(startDt);
                    businessStartDt.setHours(parseInt(businessWorkingHours[i].open.split(':')[0]));
                    businessStartDt.setMinutes(parseInt(businessWorkingHours[i].open.split(':')[1]));
                    if(startDt >= businessStartDt) {
                        isStartDtWithinBusinessWorkingHours = true;
                    }
                }
                
                if(businessWorkingHours[i].day === endDt.toLocaleString('en-us', { weekday: 'long' }).toLowerCase()) {
                    // check if business is closed
                    if(businessWorkingHours[i].open === undefined || businessWorkingHours[i].close === undefined) return false;
                    // check if endDt is within business working hours
                    const businessEndDt = new Date(endDt);
                    businessEndDt.setHours(parseInt(businessWorkingHours[i].close.split(':')[0]));
                    businessEndDt.setMinutes(parseInt(businessWorkingHours[i].close.split(':')[1]));
                    if(endDt <= businessEndDt) {
                        isEndDtWithinBusinessWorkingHours = true;
                    }
                }
            }

            if(!isStartDtWithinBusinessWorkingHours || !isEndDtWithinBusinessWorkingHours) return false;

            // check if event startDt and endDt are within maximum days in future
            const today = new Date();
            const todayPlusMaxDays = new Date(today);
            todayPlusMaxDays.setDate(today.getDate() + businessMaximumDaysInFuture);
            if(startDt > todayPlusMaxDays || endDt > todayPlusMaxDays) return false;

            // check if event startDt and endDt are within minimum time slots
            const startDtPlusMinTimeSlots = new Date(startDt);
            startDtPlusMinTimeSlots.setMinutes(startDt.getMinutes() + businessMinimumTimeSlots * businessSlotTime);
            if(endDt < startDtPlusMinTimeSlots) return false;

            // get events from calendars
            const events = await DbService.getMany(COLLECTIONS.EVENTS, { calendarId: new mongoose.Types.ObjectId(calendarId) });
            if(events) {
                // check if event startDt and endDt are within existing events
                for(let i = 0; i < events.length; i++) {
                    const event = events[i];
                    const eventStartDt = new Date(event.start);
                    const eventEndDt = new Date(event.end);
                    if((startDt >= eventStartDt && startDt <= eventEndDt) || (endDt >= eventStartDt && endDt <= eventEndDt)) return false;
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
            const events = !teamupSubCalendarId
                ? await DbService.getMany(COLLECTIONS.EVENTS, { calendarId: new mongoose.Types.ObjectId(calendar._id) })
                : await DbService.getMany(COLLECTIONS.EVENTS, { calendarId: new mongoose.Types.ObjectId(calendar._id), teamupSubCalendarIds: teamupSubCalendarId });
            
            const availableTimeSlots = [];
            const today = new Date();
            const todayPlusMaxDays = new Date(today);
            todayPlusMaxDays.setDate(today.getDate() + businessMaximumDaysInFuture);

            // get all available time slots
            // iterate through each day from today to todayPlusMaxDays
            
            for(let i = 0; i < businessMaximumDaysInFuture; i++) {
                const currentDate = new Date(today);
                currentDate.setDate(today.getDate() + i);
                const currentDay = currentDate.toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
                let isBusinessOpen = false;
                let businessOpenTime = null;
                let businessCloseTime = null;
                for(let j = 0; j < businessWorkingHours.length; j++) {
                    if(businessWorkingHours[j].day === currentDay) {
                        if(businessWorkingHours[j].open === undefined || businessWorkingHours[j].close === undefined) break;
                        isBusinessOpen = true;
                        businessOpenTime = new Date(currentDate);
                        businessOpenTime.setHours(parseInt(businessWorkingHours[j].open.split(':')[0]));
                        businessOpenTime.setMinutes(parseInt(businessWorkingHours[j].open.split(':')[1]));
                        businessCloseTime = new Date(currentDate);
                        businessCloseTime.setHours(parseInt(businessWorkingHours[j].close.split(':')[0]));
                        businessCloseTime.setMinutes(parseInt(businessWorkingHours[j].close.split(':')[1]));
                        break;
                    }
                }
                if(!isBusinessOpen) break;

                // get all time slots for the current day
                let currentTime = new Date(businessOpenTime);
                while(currentTime < businessCloseTime) {
                    const endTime = new Date(currentTime);
                    endTime.setMinutes(currentTime.getMinutes() + timeSlotsDuration);
                    let isTimeSlotAvailable = true;
                    if(events) {
                        for(let j = 0; j < events.length; j++) {
                            const event = events[j];
                            const eventStartDt = new Date(event.start);
                            const eventEndDt = new Date(event.end);
                            if((currentTime >= eventStartDt && currentTime <= eventEndDt) || (endTime >= eventStartDt && endTime <= eventEndDt)) {
                                isTimeSlotAvailable = false;
                                break;
                            }
                        }
                    }
                    if(isTimeSlotAvailable) {
                        availableTimeSlots.push({
                            start: currentTime.toISOString(),
                            end: endTime.toISOString()
                        });
                    }
                    currentTime.setMinutes(currentTime.getMinutes() + businessSlotTime);
                }
            }

        } catch (error) {
            console.error(error);
            return null;
        }
    },
}

module.exports = CalendarService;