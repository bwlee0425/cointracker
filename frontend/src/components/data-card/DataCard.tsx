import React from 'react';
import { cn } from "@/lib/utils";

interface DataCardProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    className?: string;
}

export const DataCard: React.FC<DataCardProps> = ({ children, title, description, className }) => {
    return (
        <div className={cn(
            "bg-[#232b39] rounded-xl shadow-md p-6 min-h-[180px] flex flex-col justify-between border-none w-full max-w-full",
            className
        )}>
            <div className="mb-3">
                <div className="text-xl font-bold text-white mb-1 leading-tight">{title}</div>
                {description && <div className="text-base text-gray-400 mb-2">{description}</div>}
            </div>
            <div className="flex-1 flex flex-col justify-center items-start w-full">
                {children}
            </div>
        </div>
    );
};
