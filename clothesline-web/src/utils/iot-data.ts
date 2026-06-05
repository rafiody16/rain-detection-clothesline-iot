export type CommandPayload = "AUTO" | "MANUAL" | "TIMER" | "MASUK" | "KELUAR";

export interface IoTData {
    timestamp: string;
    rawTimestamp: string;
    timestampValue: number;
    suhu: number;
    lembab: number;
    ldr: number;
    intensitasAir: number;
    mode: string;
    status: boolean;
    kondisi: string;
}

export const normalizeIoTData = (item: any): IoTData => {
    const dateObj = item.timestamp ? new Date(item.timestamp) : new Date();
    const timeValue = dateObj.getTime();

    const displayTime = dateObj.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    return {
        timestamp: displayTime,
        rawTimestamp: item.timestamp ?? "",
        timestampValue: timeValue,
        suhu: item.suhu ?? item.temperature ?? 0,
        lembab: item.lembab ?? item.humidity ?? 0,
        ldr: item.ldr ?? item.light ?? 0,
        intensitasAir: item.intensitasAir ?? 0,
        mode: item.mode ?? "UNKNOWN",
        status: item.statusDiLuar !== undefined
            ? item.statusDiLuar === 0
            : item.cuacaBuruk === 1,
        kondisi: item.kondisi ?? "Mendeteksi...",
    };
};