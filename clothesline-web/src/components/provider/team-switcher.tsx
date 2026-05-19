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

  // Handle remove device dengan konfirmasi
  const handleRemoveDevice = (deviceId: string) => {
    if (confirm("Are you sure you want to remove this device?")) {
      removeDevice(deviceId)
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
                className="gap-2 p-2 cursor-pointer"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <Cpu className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{device.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{device.deviceId}</span>
                </div>
                {/* Checkmark indicator for active device */}
                {activeDevice?.deviceId === device.deviceId && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-green-500" />
                )}
                {/* Button Hapus Device */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation() // Mencegah trigger pemilihan device
                    handleRemoveDevice(device.deviceId)
                  }}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <Trash2 className="size-4" />
                </button>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
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