import { NextApiRequest, NextApiResponse } from "next";

export default async function handler (
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const baseUrl = process.env.FIREBASE_DATABASE_URL;

        if (!baseUrl) {
            return res.status(500).json({ error: "Firebase database URL is not configured." });
        }

        const response = await fetch(`${baseUrl}/jemuran/sensor.json`);

        if (!response.ok) {
            return res.status(500).json({ error: "Failed to fetch IoT data from Firebase." });
        }

        const data = await response.json();
        const sensor = Object.entries(data).map(([id, value]) => ({
            id,
            ...(value as object)
        }));

        res.status(200).json(sensor);
    } catch (error) {
        console.error("Error fetching IoT data:", error);
        res.status(500).json({ error: "An error occurred while fetching IoT data." });
    }
}