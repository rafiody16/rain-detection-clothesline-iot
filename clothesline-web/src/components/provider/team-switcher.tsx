"use client"

import * as React from "react"
import { useDevice } from "@/contexts/device-context" // 1. Import Device Context

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
import { ChevronsUpDownIcon, PlusIcon, Cpu, Trash2 } from "lucide-react" // 2. Gunakan icon Cpu
import { toast } from "sonner"
import { useMqtt } from "@/contexts/mqtt-context"

export function TeamSwitcher() {
  const { isMobile } = useSidebar()

  // 3. Panggil state dari device context, BUKAN dari props statis
  const {
    devices,
    activeDevice,
    setActiveDevice,
    setShowAddWizard,
    removeDevice
  } = useDevice()

  const { globalOnlineMap } = useMqtt();

  // Handle remove device dengan konfirmasi
  const handleRemove = async (
    e: React.MouseEvent,
    deviceId: string
  ) => {
    e.stopPropagation()

    const confirmed = window.confirm(
      "Are you sure you want to remove this device?"
    )
    if (!confirmed) return

    const success = await removeDevice(deviceId)
    if (success) {
      toast.success("Device removed")
    } else {
      toast.error("Failed to remove device")
    }
  }

  // 4. Jika user belum punya perangkat, tampilkan tombol Add besar
  if (!activeDevice && devices.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={() => setShowAddWizard(true)}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border border-dashed border-zinc-300 dark:border-zinc-700"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <PlusIcon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Add Device</span>
              <span className="truncate text-xs text-muted-foreground">Connect new clothesline</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
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
                <span className="truncate text-xs font-mono">
                  {activeDevice?.deviceId ? `ID: ${activeDevice.deviceId}` : ""}
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

            {/* 5. Looping daftar perangkat dari Firebase/Context */}
            {devices.map((device, index) => (
              <DropdownMenuItem
                key={device.deviceId}
                onClick={() => setActiveDevice(device)}
                className="group flex items-center justify-between gap-2 p-2 cursor-pointer"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-background">
                    <Cpu className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-medium truncate">{device.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground truncate">
                      {device.deviceId}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <div
                      className={
                        "w-2 h-2 rounded-full " +
                        (globalOnlineMap[device.deviceId] ? "bg-green-500" : "bg-gray-400")
                      }
                    />
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(e, device.deviceId);
                    }}
                    className="flex md:hidden md:group-hover:flex items-center justify-center rounded-md p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Remove Device"
                  >
                    <Trash2 className="size-4" />
                  </div>
                  <DropdownMenuShortcut className="hidden md:block md:group-hover:hidden ml-0">
                    ⌘{index + 1}
                  </DropdownMenuShortcut>

                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {/* 6. Tombol Add Device yang memanggil modal/wizard */}
            <DropdownMenuItem
              onClick={() => setShowAddWizard(true)}
              className="gap-2 p-2 cursor-pointer"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <PlusIcon className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add Device</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}