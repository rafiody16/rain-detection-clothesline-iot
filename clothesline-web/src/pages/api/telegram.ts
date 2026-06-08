import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method tidak diizinkan' });
    }

    const { message } = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        return res.status(500).json({ error: 'Kredensial Telegram belum di-set di .env' });
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
        }),
        });

        const data = await response.json();
        return res.status(200).json({ success: data.ok });
    } catch (error) {
        return res.status(500).json({ error: 'Gagal mengirim ke Telegram' });
    }
}