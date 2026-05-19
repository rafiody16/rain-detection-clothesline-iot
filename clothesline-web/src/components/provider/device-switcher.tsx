"use client"

import * as React from "react"
import { useDevice } from "@/contexts/device-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  ChevronsUpDownIcon,
  PlusIcon,
  Cpu,
  Trash2
} from "lucide-react"
import { toast } from "sonner"

export function DeviceSwitcher() {
  const { isMobile } = useSidebar()
  const {
    devices,
    activeDevice,
    setActiveDevice,
    removeDevice,
    setShowAddWizard,
  } = useDevice()

  // If no devices yet, show add button
  if (devices.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={() => setShowAddWizard(true)}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg border-2 border-dashed border-sidebar-foreground/30 bg-transparent">
              <PlusIcon className="size-4 text-sidebar-foreground/50" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Add Device</span>
              <span className="truncate text-xs text-muted-foreground">
                Connect your first device
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const handleRemove = async (e: React.MouseEvent, deviceId: string) => {
    e.stopPropagation()
    const confirm = window.confirm(
      "Are you sure you want to remove this device?"
    )
    if (!confirm) return

    const success = await removeDevice(deviceId)
    if (success) {
      toast.success("Device removed")
    } else {
      toast.error("Failed to remove device")
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Cpu className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeDevice?.name || "Select Device"}
                </span>
                <span className="truncate text-xs font-mono text-muted-foreground">
                  {activeDevice
                    ? `ID: ${activeDevice.deviceId.substring(0, 4)}...${activeDevice.deviceId.substring(8)}`
                    : "No device selected"}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              My Devices
            </DropdownMenuLabel>
            {devices.map((device, index) => (
              <DropdownMenuItem
                key={device.deviceId}
                onClick={() => setActiveDevice(device)}
                className="gap-2 p-2 group cursor-pointer"
              >
                <div className="flex size-6 items-center justify-center rounded-md border shrink-0">
                  <Cpu className="size-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm">{device.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {device.deviceId}
                  </div>
                </div>

                {activeDevice?.deviceId === device.deviceId && (
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                )}

                <div
                  onClick={(e) => handleRemove(e, device.deviceId)}
                  className="hidden group-hover:flex p-1.5 text-red-500 rounded-md hover:bg-red-100 dark:hover:bg-red-950/50 shrink-0 ml-auto"
                  title="Remove Device"
                >
                  <Trash2 className="size-3.5" />
                </div>

                <DropdownMenuShortcut className="group-hover:hidden">
                  ⌘{index + 1}
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => setShowAddWizard(true)}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <PlusIcon className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Add Device
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
