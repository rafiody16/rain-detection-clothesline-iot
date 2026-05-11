"use client";

import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar"; // Sesuaikan path
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ThemeSelector } from "./theme-selector"; // Sesuaikan path
import { ModeToggle } from "./mode-toggle"; // Sesuaikan path
import { useDateTime } from "@/hooks/use-date-time";
import { useMqtt } from "@/contexts/mqtt-context";

interface BreadcrumbStep {
    label: string;
    href?: string;
}

interface DashboardHeaderProps {
    breadcrumbs: BreadcrumbStep[];
}

export function DashboardHeader({ breadcrumbs }: DashboardHeaderProps) {
    const { time, isMounted } = useDateTime();
    const { isOnline } = useMqtt();
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between w-full px-4">
                {/* LEFT SIDE: Sidebar & Breadcrumbs */}
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={index}>
                                    <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                                        {index === breadcrumbs.length - 1 ? (
                                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {index < breadcrumbs.length - 1 && (
                                        <BreadcrumbSeparator className="hidden md:block" />
                                    )}
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* RIGHT SIDE: Status, Time, & Settings */}
                <div className="flex items-center gap-6">
                    {/* Status Online */}
                    <div className="flex items-center gap-2 pr-2 border-r border-zinc-200 dark:border-zinc-800 h-8">
                        <div className="flex items-center gap-2 sm:px-3 py-1 sm:bg-zinc-100 sm:dark:bg-zinc-900 rounded-full transition-colors duration-500">
                            <span className="relative flex h-2 w-2">
                                {isOnline && (
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-green-400`}></span>
                                )}
                                <span className={`relative inline-flex rounded-full h-2 w-2 transition-colors duration-500 ${isOnline ? "bg-green-500" : "bg-zinc-500"}`}></span>
                            </span>
                            <span className="hidden sm:flex text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                                {isOnline ? "Online" : "Offline"}
                            </span>
                        </div>
                    </div>

                    {/* Clock & Date */}
                    {isMounted && time ? (
                        <div className="flex flex-col items-end justify-center h-full">
                            <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 leading-tight tabular-nums">
                                <span className="sm:hidden">
                                    {time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                <span className="hidden sm:inline">
                                    {time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                </span>
                            </div>
                            <div className="text-[10px] text-zinc-900 dark:text-zinc-50 text-muted-foreground font-medium leading-tight tabular-nums">
                                <span className="sm:hidden">
                                    {time.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                                </span>
                                <span className="hidden sm:inline">
                                    {time.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-16 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
                    )}

                    <div className="flex items-center gap-2">
                        <ThemeSelector />
                        <ModeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
}