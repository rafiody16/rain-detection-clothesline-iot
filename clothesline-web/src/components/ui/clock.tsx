import { useDateTime } from "@/hooks/use-date-time";

export const Clock = () => {
    const { time, isMounted } = useDateTime();
    return (
        <>
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
        </>
    );
}