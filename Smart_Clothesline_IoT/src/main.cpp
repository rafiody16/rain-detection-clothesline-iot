#include <Arduino.h> // Wajib ada di PlatformIO
#include <ESP32Servo.h>
#include <DHT.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiManager.h>
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

#define DHTPIN 27
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Servo
#define SERVO_PIN 15
Servo servoJemuran;

// LED indikator
#define R 12
#define G 32
#define B 33

// Sensor
#define LDR_PIN 34
#define RAIN_ANALOG 35

const float BATAS_LEMBAB = 80.0;
const float BATAS_SUHU = 25.0;
const int BATAS_GELAP = 2500;
const int BATAS_HUJAN = 3600;

// =====================
// KONFIGURASI SERVO 360
// =====================
const int PUTAR_MASUK = 0;
const int PUTAR_KELUAR = 180;
const int BERHENTI = 90;
const int DURASI_PUTAR = 3000;

bool statusDiLuar = false;
bool modeAuto = true;

// =====================
// MQTT Config
// =====================
const char* mqtt_server = "3.107.238.64";
// const char *mqtt_server = "broker.emqx.io";

WiFiClient espClient;
PubSubClient client(espClient);

// Deklarasi Fungsi (Prototyping agar tidak error di VS Code)
void setLeds(bool dalam, bool proses, bool luar);

// =====================
// Fungsi Terima Perintah dari Web (Callback)
  // =====================
  void callback(char *topic, byte *payload, unsigned int length)
{
  String pesan = "";
  for (unsigned int i = 0; i < length; i++)
  {
    pesan += (char)payload[i];
  }

  Serial.print("Pesan Web masuk di topik [");
  Serial.print(topic);
  Serial.println("]: " + pesan);

  if (String(topic) == "jemuran/kontrol")
  {
    if (pesan == "MASUK")
    {
      modeAuto = false;
      if (statusDiLuar == true)
      {
        Serial.println("Web Perintah: Menarik jemuran MASUK...");
        setLeds(false, true, false);
        servoJemuran.write(PUTAR_MASUK);
        delay(DURASI_PUTAR);
        servoJemuran.write(BERHENTI);
        statusDiLuar = false;
        setLeds(true, false, false);
        client.publish("jemuran/status", "DEBUG: MASUK (Manual Web)");
      }
    }
    else if (pesan == "KELUAR")
    {
      modeAuto = false;
      if (statusDiLuar == false)
      {
        Serial.println("Web Perintah: Mendorong jemuran KELUAR...");
        setLeds(false, true, false);
        servoJemuran.write(PUTAR_KELUAR);
        delay(DURASI_PUTAR);
        servoJemuran.write(BERHENTI);
        statusDiLuar = true;
        setLeds(false, false, true);
        client.publish("jemuran/status", "DEBUG: KELUAR (Manual Web)");
      }
    }
    else if (pesan == "AUTO")
    {
      Serial.println("Web Perintah: MODE OTOMATIS AKTIF");
      modeAuto = true;
      client.publish("jemuran/status", "DEBUG: MODE AUTO");
    }
    else if (pesan == "MANUAL")
    {
      Serial.println("Web Perintah: MODE MANUAL AKTIF");
      modeAuto = false;
      client.publish("jemuran/status", "DEBUG: MODE MANUAL");
    }
  }
}

// =====================
// Fungsi Koneksi WiFiManager
// =====================
void setupWiFi()
{
  Serial.println("Memulai WiFiManager...");
  WiFiManager wifiManager;

  if (!wifiManager.autoConnect("Jemuran_Pintar"))
  {
    Serial.println("Gagal connect dan hit timeout");
    delay(3000);
    ESP.restart();
    delay(5000);
  }
  Serial.println("\nWiFi Connected! IP: " + WiFi.localIP().toString());
}

void reconnectMQTT()
{
  while (!client.connected())
  {
    Serial.print("Connecting MQTT...");
    if (client.connect("ESP32-Jemuran", "jemuran/status", 1, true, "Offline"))
    {
      Serial.println("Connected!");
      client.publish("jemuran/status", "Online", true);
      client.publish("jemuran/status", "INFO: ESP32 Connected to MQTT Broker");
      client.subscribe("jemuran/kontrol");
    }
    else
    {
      Serial.print("Gagal rc=");
      Serial.println(client.state());
      client.publish("jemuran/status", "ERROR: Gagal connect ke MQTT Broker, coba lagi...");
      delay(3000);
    }
  }
}

void setLeds(bool dalam, bool proses, bool luar)
{
  digitalWrite(R, dalam ? HIGH : LOW);
  digitalWrite(G, proses ? HIGH : LOW);
  digitalWrite(B, luar ? HIGH : LOW);
}

int bacaSensorStabil(int pin)
{
  long totalNilai = 0;
  int jumlahSampel = 15;
  for (int i = 0; i < jumlahSampel; i++)
  {
    totalNilai += analogRead(pin);
    delay(10);
  }
  return totalNilai / jumlahSampel;
}

void setup()
{
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
  Serial.begin(115200);
  delay(1000);
  dht.begin();

  pinMode(RAIN_ANALOG, INPUT);
  pinMode(R, OUTPUT);
  pinMode(G, OUTPUT);
  pinMode(B, OUTPUT);

  setLeds(true, false, false);

  setupWiFi();

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  Serial.println("Menstabilkan daya sebelum menyalakan Servo...");
  delay(2000);

  servoJemuran.attach(SERVO_PIN);
  servoJemuran.write(BERHENTI);
  statusDiLuar = false;
  reconnectMQTT();

  Serial.println("SISTEM JEMURAN PINTAR - READY DENGAN WEB KONTROL");
}

void loop()
{
  if (!client.connected())
    reconnectMQTT();
  client.loop();

  float suhu = dht.readTemperature();
  float lembab = dht.readHumidity();
  int nilaiLDR = bacaSensorStabil(LDR_PIN);
  int intensitasAir = bacaSensorStabil(RAIN_ANALOG);

  // Cek apakah sensor berhasil dibaca
  if (isnan(suhu) || isnan(lembab))
  {
    Serial.println("Gagal membaca sensor DHT!");
    client.publish("jemuran/status", "ERROR: Gagal membaca sensor DHT!");
    return;
  }
  if (nilaiLDR == 0)
  {
    Serial.println("Gagal membaca sensor LDR!");
    client.publish("jemuran/status", "ERROR: Gagal membaca sensor LDR!");
    return;
  }
  if (intensitasAir == 0)
  {
    Serial.println("Gagal membaca sensor hujan!");
    client.publish("jemuran/status", "ERROR: Gagal membaca sensor hujan!");
    return;
  }

  bool gelap = (nilaiLDR > BATAS_GELAP);
  bool sedangHujan = (intensitasAir < BATAS_HUJAN);
  bool cuacaBuruk = sedangHujan || gelap || (lembab > BATAS_LEMBAB) || (suhu < BATAS_SUHU);

  char msg[200];
  snprintf(msg, sizeof(msg),
           "{\"suhu\":%.1f,\"lembab\":%.1f,\"ldr\":%d,\"intensitasAir\":%d,\"cuacaBuruk\":%d,\"mode\":\"%s\",\"statusDiLuar\":%d}",
           suhu, lembab, nilaiLDR, intensitasAir, cuacaBuruk ? 1 : 0, modeAuto ? "AUTO" : "MANUAL", statusDiLuar ? 1 : 0);
  client.publish("jemuran/data", msg);

  if (modeAuto)
  {
    if (cuacaBuruk)
    {
      if (statusDiLuar == true)
      {
        Serial.println("Aksi Auto: Menarik jemuran MASUK...");
        setLeds(false, true, false);
        servoJemuran.write(PUTAR_MASUK);
        delay(DURASI_PUTAR);
        servoJemuran.write(BERHENTI);
        statusDiLuar = false;
        client.publish("jemuran/status", "EVENT: PROSES MASUK (Auto)");  
      }
      setLeds(true, false, false);
      client.publish("jemuran/status", "EVENT: MASUK (Auto)");
    }
    else
    {
      if (statusDiLuar == false)
      {
        Serial.println("Aksi Auto: Mendorong jemuran KELUAR...");
        setLeds(true, true, false);
        servoJemuran.write(PUTAR_KELUAR);
        delay(DURASI_PUTAR);
        servoJemuran.write(BERHENTI);
        statusDiLuar = true;
        client.publish("jemuran/status", "EVENT: PROSES KELUAR (Auto)");
      }
      setLeds(false, false, true);
      client.publish("jemuran/status", "EVENT: KELUAR (Auto)");
    }
  }

  delay(3000);
}