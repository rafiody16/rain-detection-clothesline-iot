import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { date, deviceId } = req.query; // Ambil parameter dari URL
        const baseUrl = process.env.FIREBASE_DATABASE_URL;

        if (!baseUrl) {
            return res.status(500).json({ error: "Firebase URL not configured." });
        }

        // Build path based on whether deviceId is provided
        // New: /jemuran/{deviceId}/sensor.json
        // Legacy fallback: /jemuran/sensor.json
        const sensorPath = deviceId
            ? `/jemuran/${deviceId}/sensor.json`
            : `/jemuran/sensor.json`;

        let url = `${baseUrl}${sensorPath}`;

        // Jika ada filter tanggal, gunakan query Firebase REST API
        if (date) {
            const start = `${date} 00:00:00`;
            const end = `${date} 23:59:59`;
            url += `?orderBy="timestamp"&startAt="${start}"&endAt="${end}"`;
        } else {
            // Jika tidak ada tanggal, batasi ambil 50 data terbaru saja agar tidak berat
            url += `?orderBy="timestamp"`;
        }

        const response = await fetch(url);
        if (!response.ok) return res.status(500).json({ error: "Fetch failed" });

        const data = await response.json();
        if (!data) return res.status(200).json([]);

        // Konversi object Firebase ke Array
        const sensor = Object.entries(data).map(([id, value]) => ({
            id,
            ...(value as object)
        })).filter((item: any) => item.timestamp);

        res.status(200).json(sensor);
    } catch {
        res.status(500).json({ error: "Server Error" });
    }
}