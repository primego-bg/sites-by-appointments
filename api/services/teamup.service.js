const axios = require('axios');

const TeamupService = {
    getCalendarConfiguration: async (calendarId) => {
        try {
            const response = await axios.get(`https://api.teamup.com/${calendarId}/config`, {
                headers: {
                    'Teamup-Token': process.env.TEAMUP_API_KEY
                }
            });

            return response.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    syncEvents: async (subcalendarId, startDate, endDate) => {
        try {
            const response = await axios.get(`https://api.teamup.com/${subcalendarId}/events?startDate=${startDate}&endDate=${endDate}`, {
                headers: {
                    'Teamup-Token': process.env.TEAMUP_API_KEY
                }
            });

            return response.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
};

module.exports = TeamupService;