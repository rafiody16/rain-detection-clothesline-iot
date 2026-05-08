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
            url += `?orderBy="timestamp"&limitToLast=50`;
        }

        const response = await fetch(url);
        if (!response.ok) return res.status(500).json({ error: "Fetch failed" });

        const data = await response.json();
        if (!data) return res.status(200).json([]);

        // Konversi object Firebase ke Array
        const sensor = Object.entries(data).map(([id, value]) => ({
            id,
            ...(value as object)
        }));

        res.status(200).json(sensor);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
}