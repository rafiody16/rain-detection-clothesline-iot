import { CloudRain, LucidePanelLeft, Menu, PanelLeft, PanelLeftClose, PanelLeftIcon, PanelLeftOpen, PanelRightOpen } from "lucide-react"
import { useSidebar } from "../ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

export default function SidebarToggle() {
    const { isMobile, state, toggleSidebar } = useSidebar()
    return (
        <div className="flex items-center justify-between w-full h-12 p-2 overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:overflow-visible">
            {/* Logo & Expand Toggle (Left side) */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        className="group/exp relative flex items-center gap-2 rounded-md transition-all duration-200 shrink-0 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:hover:bg-sidebar-accent group-data-[collapsible=icon]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:cursor-pointer"
                        onClick={() => state === "collapsed" && toggleSidebar()}
                    >
                        {/* Normal Logo */}
                        <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-sidebar-foreground transition-all duration-200 group-data-[collapsible=icon]:group-hover/exp:opacity-0 group-data-[collapsible=icon]:group-hover/exp:scale-50">
                            <CloudRain className="size-4" />
                        </div>
                        {/* Expand Icon */}
                        <div className="absolute inset-y-0 left-0 flex aspect-square size-8 items-center justify-center opacity-0 scale-50 rounded-lg transition-all duration-200 group-data-[collapsible=icon]:group-hover/exp:opacity-100 group-data-[collapsible=icon]:group-hover/exp:scale-100">
                            <PanelLeftOpen className="size-4" />
                        </div>
                        {/* Title */}
                        <span className="font-semibold truncate whitespace-nowrap transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
                            SmartLine
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right" align="center" hidden={state === "expanded"}>
                    Expand Sidebar
                </TooltipContent>
            </Tooltip>

            {/* Collapse Button (Right side) */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        onClick={(e) => { e.stopPropagation(); toggleSidebar(); }}
                        className="group/col flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:overflow-hidden cursor-pointer"
                    >
                        <LucidePanelLeft className="size-4 transition-all duration-200 group-hover/col:hidden" />
                        <PanelLeftClose className="size-4 hidden transition-all duration-200 group-hover/col:block" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right" align="center" hidden={isMobile || state === "collapsed"}>
                    Collapse Sidebar
                </TooltipContent>
            </Tooltip>
        </div>
    )
}