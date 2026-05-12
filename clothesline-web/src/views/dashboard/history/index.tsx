"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { CalendarIcon, CloudRainIcon, History, Sun } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Pagination,
  PaginationContent,
  PaginationInput,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type HistoryPageProps = {
  logs: any[];
  isLoading?: boolean;
  date?: Date | undefined;
  onDateChange?: (date: Date | undefined) => void;
};

export default function HistoryPage({ logs, isLoading, date, onDateChange }: HistoryPageProps) {
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [inputPage, setInputPage] = useState("1");

  // console.log("Initial logs prop:", logs);

  const processedLogs = useMemo(() => {
    let result = [...logs];
    // console.log("Raw logs before processing:", result);

    if (date) {
      const targetDate = format(date, "yyyy-MM-dd");
      result = result.filter(log => log.timestamp.startsWith(targetDate));
    }

    return result.sort((a, b) => {
      if (a.timestamp === "-") return 1;
      if (b.timestamp === "-") return -1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [logs, date]);
  // console.log("Processed Logs:", processedLogs);

  const totalPages = Math.ceil(processedLogs.length / itemsPerPage);

  const currentPage = useMemo(() => {
    const n = parseInt(inputPage, 10);
    if (!Number.isFinite(n) || n < 1) return 1;
    if (n > totalPages && totalPages > 0) return totalPages;
    return n;
  }, [inputPage, totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = processedLogs.slice(startIndex, startIndex + itemsPerPage);



  const handleDateChange = (newDate: Date | undefined) => {
    onDateChange?.(newDate);
    setInputPage("1");
  };

  const commitPageChange = (val: string) => {
  const n = parseInt(val, 10);
  // Validasi: harus angka, >= 1, dan <= total halaman
  if (!Number.isFinite(n) || n < 1 || n > totalPages) {
    setInputPage(currentPage.toString()); // Balikin ke angka bener kalau ngaco
  } else {
    setInputPage(n.toString()); // Update ke halaman baru
  }
};
  return (
    <>
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg shrink-0">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Historical Data
                </h1>
                <p className="text-sm text-muted-foreground">
                  View past records of sensor readings and servo actions.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full md:w-auto">
              <span className="text-xs font-semibold uppercase text-muted-foreground ml-1">
                Filter Tanggal
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      handleDateChange(newDate);
                    }}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Card>
            <CardContent>
              <div className="hidden md:block rounded-md border">
                <Table className="w-full text-sm text-left">
                  <TableHeader className="bg-accent dark:bg-accent/50">
                    <TableRow>
                      <TableHead className="font-bold text-center">Timestamp</TableHead>
                      <TableHead className="font-bold text-center">Temperature</TableHead>
                      <TableHead className="font-bold text-center">Humidity</TableHead>
                      <TableHead className="font-bold text-center">Light (Lux)</TableHead>
                      <TableHead className="font-bold text-center">Rain Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                          Loading historical data...
                        </TableCell>
                      </TableRow>
                    ) :
                      processedLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                            No historical data available.
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentLogs.map((log, index) => (
                          <TableRow key={log.id || `${log.timestamp}-${index}`} className="border-b hover:bg-muted/50">
                            <TableCell className="px-6 py-4 font-medium text-center">{log.timestamp.includes(' ') ? log.timestamp.split(' ')[1] : log.timestamp}</TableCell>
                            <TableCell className="px-6 py-4 text-center">{log.temperature} °C</TableCell>
                            <TableCell className="px-6 py-4 text-center">{log.humidity} %</TableCell>
                            <TableCell className="px-6 py-4 text-center">{log.light} lux</TableCell>
                            <TableCell className="px-6 py-4 text-center">
                              {log.rain ? (
                                <Badge variant={"outline"} className="text-blue-500 font-medium">
                                  <CloudRainIcon data-icon="inline-start" className="w-4 h-4 mr-1" />
                                  Rain Detected
                                </Badge>
                              ) : (
                                <Badge variant={"outline"} className="text-yellow-500 font-medium">
                                  <Sun data-icon="inline-start" className="w-4 h-4 mr-1" />
                                  No Rain
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col md:hidden">
                {isLoading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
                    Loading records...
                  </div>
                ) : processedLogs.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground italic">
                    No data found for this date.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {currentLogs.map((log, index) => (
                      <div
                        key={log.id || `${log.timestamp}-${index}`}
                        className="py-4 flex items-center justify-between group active:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold tracking-tight">
                              {log.timestamp.includes(' ') ? log.timestamp.split(' ')[1] : log.timestamp}
                            </span>
                            {log.rain ? (
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                            {log.rain ? "Rainy" : "Clear Sky"}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{log.temperature}°C</span>
                            <span className="text-[9px] text-muted-foreground uppercase">Temp</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{log.humidity}%</span>
                            <span className="text-[9px] text-muted-foreground uppercase">Hum</span>
                          </div>
                          <div className="flex flex-col min-w-[40px]">
                            <span className="text-sm font-medium">{log.light}</span>
                            <span className="text-[9px] text-muted-foreground uppercase">Lux</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <Field orientation="horizontal" className="w-fit">
                  <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(v) => {
                      setItemsPerPage(Number(v)); 
                      setInputPage("1"); 
                    }}
                  >
                    <SelectTrigger className="w-20" id="select-rows-per-page">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectGroup>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Go to page</span>
      <PaginationInput
        key={currentPage}
        defaultValue={currentPage}
        onKeyDown={(e) => {
      if (e.key === "Enter") {
        commitPageChange(e.currentTarget.value);
      }
    }}
        onBlur={(e) => commitPageChange(e.currentTarget.value)}
        className="h-8 w-14" 
      />
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        of {totalPages || 1}
      </span>
    </div>
                  <Pagination className="mx-0 w-auto">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setInputPage((currentPage - 1).toString());
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setInputPage((currentPage + 1).toString());
                          }}
                          className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </>
  );
}
