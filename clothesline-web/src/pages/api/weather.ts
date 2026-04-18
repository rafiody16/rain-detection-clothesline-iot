import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Koordinat Malang
    const lat = req.query.lat || -7.58;
    const lon = req.query.lon || 111.5;
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,precipitation,cloudcover`)

    const data = await response.json()

    const now = new Date()
    const times = data.hourly.time

    let closestIndex = 0
    let minDiff = Infinity

    times.forEach((t: string, i: number) => {
        const apiTime = new Date(t)
        const diff = Math.abs(apiTime.getTime() - now.getTime())

        if (diff < minDiff) {
            minDiff = diff
            closestIndex = i
        }
    })

    const timeRaw = data.hourly.time[closestIndex]
    const dateObj = new Date(timeRaw)

    res.status(200).json([
        {
            time: dateObj.toLocaleString("id-ID", {
                dateStyle: "full",
                timeStyle: "short",
            }),
            temperature: data.hourly.temperature_2m[closestIndex],
            humidity: data.hourly.relative_humidity_2m[closestIndex],
            precipitation: data.hourly.precipitation[closestIndex],
            cloudcover: data.hourly.cloudcover[closestIndex],
        }
    ])
}