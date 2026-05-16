function LoaderRing({ text }: { text?: string }) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] gap-3">
            {/* Spinner murni CSS */}
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin dark:border-blue-900 dark:border-t-blue-400"></div>
            <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        </div>
    )
}

function LoaderBouncer({ text }: { text?: string }) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="flex gap-2 items-center justify-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        </div>
    )
}

function LoaderDot({ text }: { text?: string }) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="relative flex items-center justify-center w-14 h-14">
                {/* Gelombang luar yang memancar */}
                <div className="absolute inline-flex w-full h-full bg-blue-400 rounded-full opacity-75 animate-ping"></div>
                {/* Inti sinyal */}
                <div className="relative inline-flex w-6 h-6 bg-blue-500 rounded-full"></div>
            </div>
            <p className="text-sm font-medium text-muted-foreground animate-pulse">{text}</p>
        </div>
    )
}

export { LoaderRing, LoaderBouncer, LoaderDot }
