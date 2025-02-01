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
    getInitialEvents: async (teamupSecretCalendarKey, teamupApiKey, startDate, resultsSchema=null) => {
        try {
            // example of results schema
            // const resultsSchema = (event) => {
            //     return {
            //         id: event.id,
            //         subcalendar_ids: event.subcalendar_ids,
            //         start_dt: event.start_dt,
            //         end_dt: event.end_dt,
            //     };
            // };

            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 3);
            const formattedEndDate = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`;
            const response = await axios.get(`https://api.teamup.com/${teamupSecretCalendarKey}/events?startDate=${startDate}&endDate=${formattedEndDate}`, {
                headers: {
                    'Teamup-Token': teamupApiKey
                }
            });

            if (!resultsSchema) {
                return response.data.events;
            }

            return response.data.events.map((event) => resultsSchema(event));
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    createEvent: async (teamupSecretCalendarKey, teamupApiKey, subcalendarIds, title, description, startDt, endDt, resultsSchema=null) => {
        try {
            // example of results schema
            // const resultsSchema = (event) => {
            //     return {
            //         id: event.id,
            //         subcalendar_ids: event.subcalendar_ids,
            //         start_dt: event.start_dt,
            //         end_dt: event.end_dt,
            //     };
            // };

            const response = await axios.post(`https://api.teamup.com/${teamupSecretCalendarKey}/events?inputFormat=html`, {
                subcalendar_ids: subcalendarIds,
                title,
                start_dt: startDt,
                end_dt: endDt,
                notes: description
            }, {
                headers: {
                    'Teamup-Token': teamupApiKey
                }
            });

            if (!resultsSchema) {
                return response.data.event;
            }

            return resultsSchema(response.data.event);
        } catch (error) {
            console.error(error.response.data.error);
            return null;
        }
    },
    getModifiedEvents: async (teamupSecretCalendarKey, teamupApiKey, lastSynchronizedDt) => {
        try {
            const response = await axios.get(`https://api.teamup.com/${teamupSecretCalendarKey}/events?modifiedSince=${lastSynchronizedDt}`, {
                headers: {
                    'Teamup-Token': teamupApiKey
                }
            });

            return response.data.events;
        } catch (error) {
            console.error(error.response.data.error);
            return null;
        }
    },
};

module.exports = TeamupService;