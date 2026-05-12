"use client"

import * as React from "react"
import { Check, Palette } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useColorTheme, AVAILABLE_THEMES } from "@/contexts/color-theme-context"

export function ThemeSelector() {
  const { colorTheme, setColorTheme } = useColorTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Select Color Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {AVAILABLE_THEMES.map((theme) => (
          <DropdownMenuItem 
            key={theme.id} 
            onClick={() => setColorTheme(theme.id)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-3 w-full">
              <div className={`h-4 w-4 rounded-full flex-shrink-0 ${theme.colorClass}`} />
              <span className="text-sm font-medium">{theme.label}</span>
              {colorTheme === theme.id && (
                <Check className="ml-auto h-4 w-4 text-zinc-500" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
