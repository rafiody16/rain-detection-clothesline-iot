"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayCircle, Loader2, ArrowUpCircle, ArrowDownCircle, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner" 
import { Toaster } from "@/components/ui/sonner"

type ServoStatus = "extended" | "retracted" | "moving";
interface ControlPageProps {
  currentStatus: ServoStatus;
  onCommand: (command: "extend" | "retract") => Promise<void>;
}

export default function ControlPage({ currentStatus, onCommand }: ControlPageProps) {
  const [localStatus, setLocalStatus] = useState<ServoStatus>(currentStatus);

  useEffect(() => {
    setLocalStatus(currentStatus);
  }, [currentStatus]);

  const handleControl = async (command: "extend" | "retract") => {
    setLocalStatus("moving");
    try {
      await onCommand(command);
      toast.success(`Clothesline ${command === "extend" ? "extending" : "retracting"}...`);
    } catch (error) {
      setLocalStatus(currentStatus); 
      toast.error(`Failed to ${command} clothesline. Please try again.`);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Toaster position="top-center" richColors />
        
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Control Panel</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <ModeToggle />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dedicated Control Panel</h1>
              <p className="text-muted-foreground">Manage servo manually and set exact timer routines.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Manual Override
                  {localStatus === "moving" && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                </CardTitle>
                <CardDescription>Directly command the servo via API.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border">
                    <span className="text-sm font-medium">Current Position:</span>
                    <span className={`text-sm font-bold uppercase tracking-wider ${
                      localStatus === "extended" ? "text-green-500" : localStatus === "retracted" ? "text-amber-500" : "text-indigo-500"
                    }`}>
                      {localStatus}
                    </span>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      className="w-full bg-amber-500 hover:bg-amber-600" 
                      disabled={localStatus === "extended" || localStatus === "moving"}
                      onClick={() => handleControl("extend")}
                    >
                      <ArrowUpCircle className="mr-2 h-4 w-4" />
                      Extend
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      disabled={localStatus === "retracted" || localStatus === "moving"}
                      onClick={() => handleControl("retract")}
                    >
                      <ArrowDownCircle className="mr-2 h-4 w-4" />
                      Retract
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Quick Timer
                </CardTitle>
                <CardDescription>Set auto-retract schedule.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 4].map((hr) => (
                      <Button key={hr} variant="outline" size="sm" onClick={() => toast(`Timer set for ${hr} hours`)}>
                        {hr}h
                      </Button>
                    ))}
                 </div>
                 <Button variant="secondary" className="w-full">Custom Schedule</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}