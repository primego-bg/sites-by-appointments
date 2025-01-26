const rootUrlApi = "http://192.168.0.185:2451";

async function getBusiness(topLevelDomain: string) {
    if(!topLevelDomain) {
        throw new Error('Invalid top level domain');
    }

    let url = null;
    if(process.env.ENVIRONMENT === 'production') {
        url = `${rootUrlApi}/business/${topLevelDomain}`;
    }
    else{
        url = `${rootUrlApi}/business/kerelski.com`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
  
      const json = await response.json();
      console.log(json);

        return json;
    } catch (error: any) {
      console.error(error.message);
    }
}

async function getAvailableTimeSlots(calendarId: string, employeeId: string, serviceId: string) {
  if (!calendarId || !employeeId || !serviceId) {
      throw new Error('Invalid input parameters');
  }

  const url = `${rootUrlApi}/available?calendarId=${calendarId}&employeeId=${employeeId}&serviceId=${serviceId}`;

  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
      }

      const availableTimeSlots = await response.json();
      console.log(availableTimeSlots);
      return availableTimeSlots;
  } catch (error: any) {
      console.error(error.message);
      throw new Error('Failed to fetch available time slots');
  }
}

async function postEvent(eventData: {
  calendarId: string;
  teamupSubCalendarId: string;
  serviceId: string;
  startDt: string;
  endDt: string;
  name: string;
  email: string;
}) {
  if (!eventData.calendarId || !eventData.serviceId || !eventData.startDt || !eventData.endDt || !eventData.name || !eventData.email) {
      throw new Error('Invalid event data');
  }

  const url = `${rootUrlApi}/`;

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
      });

      if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
      }

      const createdEvent = await response.json();
      console.log(createdEvent);
      return createdEvent;
  } catch (error: any) {
      console.error(error.message);
      throw new Error('Failed to create event');
  }
}

export { getBusiness, getAvailableTimeSlots, postEvent };

/*
2 vida greshki - sistemni i user(intput)
sistemni - vadqt se s tostera
input - vadqt se kato text nad/pot inputa 
pravqt se promisi sys ili bez danni v reject
ako vs e ok resolve s result
*/
