"use client";

import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ThemeSelector } from "../provider/theme-selector";
import { ModeToggle } from "../provider/mode-toggle";
import { useMqtt } from "@/contexts/mqtt-context";
import { SwitchBadge } from "../ui/switch-badge";
import { Clock } from "../ui/clock";
import { useDevice } from "@/contexts/device-context";

interface BreadcrumbStep {
    label: string;
    href?: string;
}

interface DashboardHeaderProps {
    breadcrumbs: BreadcrumbStep[];
}

export function DashboardHeader({ breadcrumbs }: DashboardHeaderProps) {
    const { activeDevice } = useDevice();
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
                <div className="flex items-center gap-4 sm:gap-6">
                    <SwitchBadge status={!activeDevice ? "none" : (isOnline ? "online" : "offline")} />
                    {/* Clock & Date */}
                    <Clock />

                    {/* Theme & Mode Toggles */}
                    <div className="flex items-center gap-2">
                        <ThemeSelector />
                        <ModeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
}