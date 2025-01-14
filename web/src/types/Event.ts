export type Event = {
    startDate: Date,
    endDate: Date,
    title: string,
    description: string,
    location: string,
    id: number,
}

export interface EventContextProps {
    propertyForm: Event[] | null,
    updatePropertyForm: (property: Partial<Array<Event>>) => void,
}