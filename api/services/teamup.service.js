const axios = require('axios');

const TeamupService = {
    getCalendarConfiguration: async (teamupSecretCalendarKey, teamupApiKey) => {
        try {
            const response = await axios.get(`https://api.teamup.com/${teamupSecretCalendarKey}/configuration`, {
                headers: {
                    'Teamup-Token': teamupApiKey
                }
            });

            return response.data.configuration;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    getEvents: async (teamupSecretCalendarKey, teamupApiKey, startDate=null, endDate=null) => {
        try {
            const response = await axios.get(`https://api.teamup.com/${teamupSecretCalendarKey}/events?startDate=${startDate}&endDate=${endDate}`, {
                headers: {
                    'Teamup-Token': teamupApiKey
                }
            });

            return response.data.events;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    createEvent: async (teamupSecretCalendarKey, teamupApiKey, subcalendarIds, title, startDt, endDt, inputFormat, notes) => {
        try {
            const response = await axios.post(`https://api.teamup.com/${teamupSecretCalendarKey}/events`, {
                subcalendar_ids: subcalendarIds,
                title,
                start_dt: startDt,
                end_dt: endDt,
                input_format: inputFormat,
                notes
            }, {
                headers: {
                    'Teamup-Token': teamupApiKey
                }
            });

            return response.data.event;
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
    },

};

module.exports = TeamupService;