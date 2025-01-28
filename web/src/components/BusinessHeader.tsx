import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
import Link from "next/link";

import { MdLocalPhone, MdEmail, MdLink  } from "react-icons/md";

export const BusinessHeader = (props: any) => {

    const business = props.business;

    const getIconComponent = (iconName: string) => {
        const IconComponent = require("react-icons/fa")[`Fa${iconName.charAt(0).toUpperCase()}${iconName.slice(1)}`];
        return IconComponent ? <IconComponent size={24} /> : null;
    };

    return (
        <div className="w-full h-10 flex items-center justify-between px-4 pt-8 pb-4">
            <div className="flex items-center">
                <img src={business.logo} alt="Лого" className="h-8" />
            </div>
            <Sheet>
                <SheetTrigger className="bg-zinc-100 shadow-lg rounded border border-zinc-300 p-1" asChild>
                    <button className="hamburger-icon">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#666666"
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16m-7 6h7"
                        />
                    </svg>
                    </button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px]">
                    <SheetHeader className="text-left">
                        <SheetTitle>{business.name}</SheetTitle>
                        {
                            business.description
                            ? <SheetDescription className="text-justify">{business.description}</SheetDescription>
                            : null
                        }
                    </SheetHeader>
                    <div className="flex w-full mt-6 space-x-4">
                        <Link
                        key={'phone'}
                        href={`tel:${business.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-1 items-center justify-center hover:bg-zinc-100 border border-zinc-300 p-6 rounded shadow-lg`}
                        >
                            <MdLocalPhone size={24} />
                        </Link>
                        <Link
                        key={'email'}
                        href={`mailto:${business.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-1 items-center justify-center hover:bg-zinc-100 border border-zinc-300 p-6 rounded shadow-lg`}
                        >
                            <MdEmail size={24} />
                        </Link>
                        <Link
                        key={'website'}
                        href={`${business.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-1 items-center justify-center hover:bg-zinc-100 border border-zinc-300 p-6 rounded shadow-lg`}
                        >
                            <MdLink size={24} />
                        </Link>
                    </div>
                    <div className="flex w-full mt-4 space-x-4">
                        {Object.entries(business.socialMedia).map(([key, url]: any) => (
                            <Link
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex flex-1 items-center justify-center hover:bg-zinc-100 border border-zinc-300 p-6 rounded shadow-lg`}
                            >
                                {getIconComponent(key)}
                            </Link>
                        ))}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
  }