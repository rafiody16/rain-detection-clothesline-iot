import mqtt, { MqttClient } from "mqtt";

export const connectMQTT = (onMessage?: (topic: string, message: string) => void): MqttClient | null => {
    const url = process.env.NEXT_PUBLIC_MQTT_API_URL;

    if (!url) return null;

    const client = mqtt.connect(url);

    client.on('connect', () => {
        client.subscribe(['jemuran/status', 'jemuran/data']);
        console.log("Connected to MQTT Broker");
    });

    if (onMessage) {
        client.on('message', (topic, payload) => onMessage(topic, payload.toString()));
    }

    client.on('error', (err) => {
        console.error("MQTT Connection Error:", err);
    });

    return client;
}