import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { date } = req.query; // Ambil parameter tanggal dari URL
        const baseUrl = process.env.FIREBASE_DATABASE_URL;

        if (!baseUrl) {
            return res.status(500).json({ error: "Firebase URL not configured." });
        }

        let url = `${baseUrl}/jemuran/sensor.json`;

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
            ...(value as any)
        }));

        // Cari entri terbaru berdasarkan field `timestamp` jika tersedia
        let latest: any = null;
        try {
            const withTs = sensor
                .map((s) => ({ ...s, _ts: s.timestamp ? new Date(s.timestamp).getTime() : 0 }))
                .sort((a, b) => b._ts - a._ts);
            if (withTs.length > 0 && withTs[0]._ts > 0) {
                const top = withTs[0];
                latest = {
                    id: top.id,
                    servo: top.servo ?? null,
                    mode: top.mode ?? null,
                    timestamp: top.timestamp ?? null,
                    lastActionAt: top.timestamp ?? null,
                    lastActionMinutes: top._ts > 0 ? Math.floor((Date.now() - top._ts) / 60000) : null,
                };
            }
        } catch (e) {
            // ignore parsing errors, latest will remain null
        }

        res.status(200).json({ sensor, latest });
    } catch {
        res.status(500).json({ error: "Server Error" });
    }
}