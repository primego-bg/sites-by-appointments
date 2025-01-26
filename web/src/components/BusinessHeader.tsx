import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"

export const BusinessHeader = (props: any) => {
    return (
        <div className="w-full h-20 flex items-center justify-between px-4">
            <div className="flex items-center">
            <img src={props.business.logo} alt="Лого" className="h-8" />
            </div>
            <Sheet>
            <SheetTrigger asChild>
                <button className="hamburger-icon">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
            <SheetContent className="w-[400px] sm:w-[540px]" side="left">
                <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                    {/* Add your menu items here */}
                </SheetDescription>
                </SheetHeader>
            </SheetContent>
            </Sheet>
        </div>
    )
  }