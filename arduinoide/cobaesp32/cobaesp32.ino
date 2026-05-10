#include <ESP32Servo.h>
#include <DHT.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

#define DHTPIN 27
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Servo
#define SERVO_PIN 4
Servo servoJemuran;

// LED indikator
#define R   26
#define G   32
#define B   33

// Sensor
#define LDR_PIN      34
#define RAIN_DIGITAL 23
const float BATAS_LEMBAB = 80.0;
const float BATAS_SUHU   = 16.0;
const int   BATAS_GELAP  = 3000;
const int   POS_DALAM    = 0;
const int   POS_LUAR     = 180;

// =====================
// MQTT & WiFi Config
// =====================
const char* ssid        = "Broody";
const char* password    = "arema1987";
const char* mqtt_server = "3.107.238.64"; // ← ganti IP EC2 kamu

WiFiClient espClient;
PubSubClient client(espClient);

// =====================
// Fungsi Koneksi
// =====================
void setupWiFi() {
  Serial.print("Connecting WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected! IP: " + WiFi.localIP().toString());
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting MQTT...");
    if (client.connect("ESP32-Jemuran")) {
      Serial.println("Connected!");
    } else {
      Serial.print("Gagal rc=");
      Serial.println(client.state());
      delay(3000);
    }
  }
}

void setLeds(bool dalam, bool proses, bool luar) {
  digitalWrite(R, dalam  ? HIGH : LOW);
  digitalWrite(G, proses ? HIGH : LOW);
  digitalWrite(B, luar   ? HIGH : LOW);
}

void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
  Serial.begin(115200);
  delay(1000);
  dht.begin();

  pinMode(RAIN_DIGITAL, INPUT);
  
  // Ganti pin R ke pin yang mendukung OUTPUT, misalnya 26
  pinMode(26, OUTPUT); 
  pinMode(G, OUTPUT);
  pinMode(B, OUTPUT);
  setLeds(true, false, false);

  // 1. KONEK WIFI & MQTT DULUAN
  setupWiFi();
  client.setServer(mqtt_server, 1883);

  // 2. KASIH JEDA WAKTU 2 DETIK AGAR ARUS DARI USB STABIL LAGI
  Serial.println("Menstabilkan daya sebelum menyalakan Servo...");
  delay(2000); 

  // 3. BARU NYALAKAN SERVO
  servoJemuran.attach(SERVO_PIN);
  servoJemuran.write(POS_DALAM);

  Serial.println("SISTEM JEMURAN PINTAR - MQTT ENABLED");
}

void loop() {
  if (!client.connected()) reconnectMQTT();
  client.loop();

  // Baca sensor
  float suhu   = dht.readTemperature();
  float lembab = dht.readHumidity();
  int   nilaiLDR     = digitalRead(LDR_PIN);
  bool  sedangHujan  = (digitalRead(RAIN_DIGITAL) == HIGH);
  bool  gelap        = (nilaiLDR > BATAS_GELAP);
  bool  cuacaBuruk   = sedangHujan || gelap || (lembab > BATAS_LEMBAB) || (suhu < BATAS_SUHU);

  // Log serial
  Serial.printf("Suhu: %.1f C | Lembab: %.1f %% | LDR: %d | Hujan: %s | CuacaBuruk: %s\n",
    suhu, lembab, nilaiLDR,
    sedangHujan ? "YA" : "TIDAK",
    cuacaBuruk  ? "YA" : "TIDAK"
  );

  // =====================
  // Publish ke MQTT
  // =====================
  char msg[128];

  // Kirim tiap sensor ke topic masing-masing
  snprintf(msg, sizeof(msg), "%.1f", suhu);
  client.publish("jemuran/suhu", msg);

  snprintf(msg, sizeof(msg), "%.1f", lembab);
  client.publish("jemuran/lembab", msg);

  snprintf(msg, sizeof(msg), "%d", nilaiLDR);
  client.publish("jemuran/ldr", msg);

  client.publish("jemuran/hujan",      sedangHujan ? "1" : "0");
  client.publish("jemuran/cuacaBuruk", cuacaBuruk  ? "1" : "0");

  // Kirim semua sekaligus dalam format JSON
  snprintf(msg, sizeof(msg),
    "{\"suhu\":%.1f,\"lembab\":%.1f,\"ldr\":%d,\"hujan\":%d,\"cuacaBuruk\":%d}",
    suhu, lembab, nilaiLDR,
    sedangHujan ? 1 : 0,
    cuacaBuruk  ? 1 : 0
  );
  client.publish("jemuran/data", msg);

  // Keputusan servo
  if (cuacaBuruk) {
    servoJemuran.write(POS_DALAM);
    setLeds(true, false, true);
    client.publish("jemuran/status", "MASUK");
    Serial.println("Aksi: MASUK");
  } else {
    servoJemuran.write(POS_LUAR);
    setLeds(false, true, false);
    client.publish("jemuran/status", "KELUAR");
    Serial.println("Aksi: KELUAR");
  }

  delay(1000);
}
