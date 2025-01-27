import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { bg } from "react-day-picker/locale";

export function Calendar(params: any) {
    const [unavailableDates, setUnavailableDates] = useState<Array<Date>>([]);

    const calendarStartDate = new Date();
    const calendarEndDate = new Date(new Date().setDate(new Date().getDate() + params.business.maximumDaysInFuture));

    const disabledDays = {
        before: new Date(),
        after: new Date(new Date().setDate(new Date().getDate() + params.business.maximumDaysInFuture))
    };

    useEffect(() => {
        handleUnavailableDatesByTimeSlots();
    }, []);

    const handleUnavailableDatesByTimeSlots = () => {
        const timeSlots = params.timeSlots;
        
        let unavailableDates = [];
        for (let i = 0; i <= params.business.maximumDaysInFuture; i++) {
            const date = new Date(new Date().setDate(new Date().getDate() + i));
            const dateString = date.toISOString().split('T')[0];
            let isUnavailable = true;
            for(let slot of timeSlots) {
                if(slot.start.startsWith(dateString)) {
                    isUnavailable = false;
                    break;
                }
            }
            if(isUnavailable) unavailableDates.push(date);
        }

        unavailableDates = unavailableDates.map(date => new Date(date.toISOString().split('T')[0]));

        setUnavailableDates(unavailableDates);
    }

    return (
        <DayPicker
            mode="single"
            locale={bg}
            selected={params.selected}
            onSelect={(date: any) => {
                const pickedDateString = date.toISOString().split("T")[0];
                params.setSelected(pickedDateString)
                params.setStartDt(null);
                params.setEndDt(null);
            }}
            startMonth={calendarStartDate}
            endMonth={calendarEndDate}
            disabled={[disabledDays, ...unavailableDates]}
            timeZone={params.business.calendar.timezone}
        />
    );
}
