'use client';

import { useAddDealContext } from '@/contexts/addDealContext';
import { useEffect, useState } from 'react';
import { fetchOptions } from '@/services/optionsService';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";  

interface SelectProps {
    label: string;
    id: string;
    description?: string;
    required?: boolean;
    errorMsg?: string;
}

export default function SelectC({
    label,
    id,
    required,
    description,
    errorMsg,
}: SelectProps) {
    const { updateNewDealDetails, newDealData } = useAddDealContext();
    const [options, setOptions] = useState<string[]>([]);

    useEffect(() => {
        const getOptions = async () => {
            const data = ['Option 1', 'Option 2', 'Option 3'];
            setOptions(data);
        };
        getOptions();
    }, []);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateNewDealDetails({ [e.target.name]: e.target.value });
    };

    return (
        <div>
            <label className="block text-lg" htmlFor={id}>
                {label}
                {description && (
                    <span className="text-sm text-slate-200 block mb-1">
                        {description}
                    </span>
                )}
            </label>
            <Select>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
            </SelectContent>
            </Select>
        </div>
    );
}