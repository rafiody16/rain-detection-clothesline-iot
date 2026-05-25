"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  Activity,
  Settings2,
  CloudRain,
  Settings,
  PlayCircle,
  BarChart3,
  LayoutDashboard
} from "lucide-react"

import { NavMain } from "@/components/layouts/nav-main"
import { NavUser } from "@/components/layouts/nav-user"
import { TeamSwitcher } from "@/components/provider/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// IoT Project Data
const data = {
  user: {
    name: "Admin User",
    email: "admin@smartline.iot",
    avatar: "", // Empty so shadcn fallback triggers
  },
  teams: [
    {
      name: "SmartLine",
      logo: CloudRain,
      plan: "IoT Project",
    }
  ],
  navMain: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
        },
        {
          title: "Historical Data",
          url: "/dashboard/history",
        }
      ],
    },
    {
      title: "Control Panel",
      url: "/dashboard/control",
      icon: PlayCircle,
      items: [
        {
          title: "Servo Mode",
          url: "/dashboard/control",
        },
        {
          title: "Timer Schedule",
          url: "/dashboard/control#timer",
        }
      ],
    },
    {
      title: "Configuration",
      url: "/dashboard/settings",
      icon: Settings2,
      items: [
        {
          title: "Thresholds",
          url: "/dashboard/settings",
        },
        {
          title: "System Alerts",
          url: "/dashboard/settings#alerts",
        }
      ],
    },
    {
      title: "Sensors",
      url: "/dashboard/sensors",
      icon: Activity,
    },
    {
      title: "System Logs",
      url: "/dashboard/logs/system",
      icon: Settings,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()

  const user = session?.user ? {
    name: session.user.name || (session.user as any).fullname || "User",
    email: session.user.email || "",
    avatar: session.user.image || "",
  } : data.user

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
