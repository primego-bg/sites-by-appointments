const rootUrlApi = "http://172.20.10.6:2451";

const errorMessages: { [key: string]: string } = {
    "errors.inactive": "Resource not available",
    "errors.not_found": "Resource not found",
    "errors.internal_server_error": "Internal server error",
    "errors.invalid_id": "Resource with invalid id",
    "errors.invalid_service": "Invalid service for employee",
    "errors.invalid_business": "Business mismatch",
    "errors.invalid_duration": "Invalid service/event duration",
    "errors.invalid_time_slot_or_unavailable": "Invalid event or unavailable time slot",
    "errors.teamup_event_creation_failed": "Failed to create event",
};

async function handleResponse(response: Response) {
    if (!response.ok) {
        let errorMessage = `${response.status}`;
        try {
            const errorData = await response.json(); // Parse the JSON response
            if (errorData?.error && errorMessages[errorData.error]) {
                errorMessage = errorMessages[errorData.error]; // Map the error to a friendly message
            } else if (response.status == 400 && errorData?.error) {
                errorMessage = errorData.error;
            }
        } catch {
            // If response is not JSON, fall back to default message
        }
        throw new Error(errorMessage);
    }
    return response.json();
}

async function getBusiness(topLevelDomain: string) {
    if (!topLevelDomain) {
        throw new Error("Invalid top-level domain");
    }

    const url =
        process.env.ENVIRONMENT === "production"
            ? `${rootUrlApi}/business/${topLevelDomain}`
            : `${rootUrlApi}/business/kerelski.com`;

    const response = await fetch(url);
    return handleResponse(response);
}

async function getAvailableTimeSlots(calendarId: string, employeeId: string, serviceId: string) {
    if (!calendarId || !employeeId || !serviceId) {
        throw new Error("Invalid input fields");
    }

    const url = `${rootUrlApi}/event/available?calendarId=${calendarId}&employeeId=${employeeId}&serviceId=${serviceId}`;

    const response = await fetch(url);
    return handleResponse(response);
}

async function postEvent(eventData: {
    calendarId: string;
    employeeId: string;
    serviceId: string;
    startDt: string;
    endDt: string;
    name: string;
    email: string;
    phone: string;
}) {
    if (!eventData.calendarId || !eventData.serviceId || !eventData.employeeId || !eventData.startDt || !eventData.endDt || !eventData.name || !eventData.email || !eventData.phone) {
        throw new Error("Invalid event data");
    }

    const url = `${rootUrlApi}/event`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
    });

    return handleResponse(response);
}

export { getBusiness, getAvailableTimeSlots, postEvent };
