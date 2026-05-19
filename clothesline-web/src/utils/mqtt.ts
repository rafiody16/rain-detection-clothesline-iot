import mqtt, { MqttClient } from "mqtt";

export const connectMQTT = (
    deviceId: string | null,
    onMessage?: (topic: string, message: string) => void
): MqttClient | null => {
    const url = process.env.NEXT_PUBLIC_MQTT_API_URL;

    if (!url || !deviceId) return null;

    const client = mqtt.connect(url);

    client.on('connect', () => {
        // Subscribe to device-specific topics
        client.subscribe([
            `jemuran/${deviceId}/status`,
            `jemuran/${deviceId}/data`,
            `jemuran/${deviceId}/pair`,
        ]);
        console.log(`Connected to MQTT Broker (Device: ${deviceId})`);
    });

    if (onMessage) {
        client.on('message', (topic, payload) => onMessage(topic, payload.toString()));
    }

    client.on('error', (err) => {
        console.error("MQTT Connection Error:", err);
    });

    return client;
}