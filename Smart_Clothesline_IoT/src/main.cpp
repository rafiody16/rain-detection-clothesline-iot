#include <Arduino.h> // Wajib ada di PlatformIO
#include <ESP32Servo.h>
#include <DHT.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiManager.h>
#include <Preferences.h>
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
// DEVICE ID (Unique per ESP32, based on MAC Address)
// =====================
String deviceId;

// =====================
// MQTT Config
// =====================
const char *mqtt_server = "3.107.238.64";

WiFiClient espClient;
PubSubClient client(espClient);

// MQTT Topics (namespaced by device ID)
String topicData;
String topicStatus;
String topicKontrol;
String topicPair;
String topicWifiReset;

// Deklarasi Fungsi (Prototyping agar tidak error di VS Code)
void setLeds(bool dalam, bool proses, bool luar);

// =====================
// Generate Device ID from MAC Address
// =====================
String getDeviceId()
{
  uint8_t mac[6];
  WiFi.macAddress(mac);
  char id[13];
  snprintf(id, sizeof(id), "%02X%02X%02X%02X%02X%02X",
           mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  return String(id);
}

// =====================
// Setup MQTT Topics with Device ID namespace
// =====================
void setupTopics()
{
  topicData = "jemuran/" + deviceId + "/data";
  topicStatus = "jemuran/" + deviceId + "/status";
  topicKontrol = "jemuran/" + deviceId + "/kontrol";
  topicPair = "jemuran/" + deviceId + "/pair";
  topicWifiReset = "jemuran/" + deviceId + "/wifi-reset";
}

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

  String topicStr = String(topic);

  Serial.print("Pesan Web masuk di topik [");
  Serial.print(topic);
  Serial.println("]: " + pesan);

  // === KONTROL (MASUK/KELUAR/AUTO/MANUAL) ===
  if (topicStr == topicKontrol)
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
        client.publish(topicStatus.c_str(), "DEBUG: MASUK (Manual Web)");
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
        client.publish(topicStatus.c_str(), "DEBUG: KELUAR (Manual Web)");
      }
    }
    else if (pesan == "AUTO")
    {
      Serial.println("Web Perintah: MODE OTOMATIS AKTIF");
      modeAuto = true;
      client.publish(topicStatus.c_str(), "DEBUG: MODE AUTO");
    }
    else if (pesan == "MANUAL")
    {
      Serial.println("Web Perintah: MODE MANUAL AKTIF");
      modeAuto = false;
      client.publish(topicStatus.c_str(), "DEBUG: MODE MANUAL");
    }
  }

  // === PAIRING: Respond to PING with device info ===
  else if (topicStr == topicPair)
  {
    if (pesan == "PING")
    {
      Serial.println("Pairing PING received, sending PONG...");
      String response = "{\"deviceId\":\"" + deviceId + "\",\"pong\":true,\"ip\":\"" + WiFi.localIP().toString() + "\"}";
      client.publish(topicPair.c_str(), response.c_str());
    }
  }

  // === WIFI RESET: Reset WiFi credentials and restart in AP mode ===
  else if (topicStr == topicWifiReset)
  {
    if (pesan == "RESET")
    {
      Serial.println("WiFi Reset command received! Restarting in AP mode...");
      client.publish(topicStatus.c_str(), "INFO: WiFi Reset - Restarting in AP mode...");
      delay(1000);
      WiFiManager wm;
      wm.resetSettings();
      ESP.restart();
    }
  }
}

// =====================
// Fungsi Koneksi WiFiManager (with device-specific AP name)
// =====================
void setupWiFi()
{
  Serial.println("Memulai WiFiManager...");
  WiFiManager wifiManager;

  // Use last 6 characters of device ID for AP name
  String apName = "Clothesline_" + deviceId.substring(6);
  Serial.println("AP Name: " + apName);

  if (!wifiManager.autoConnect(apName.c_str()))
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
    // Use device ID as MQTT client ID to avoid conflicts with multiple devices
    String clientId = "ESP32-" + deviceId;
    if (client.connect(clientId.c_str(), topicStatus.c_str(), 1, true, "Offline"))
    {
      Serial.println("Connected!");
      client.publish(topicStatus.c_str(), "Online", true);
      client.publish(topicStatus.c_str(), "INFO: ESP32 Connected to MQTT Broker");
      // Subscribe to device-specific topics
      client.subscribe(topicKontrol.c_str());
      client.subscribe(topicPair.c_str());
      client.subscribe(topicWifiReset.c_str());
    }
    else
    {
      Serial.print("Gagal rc=");
      Serial.println(client.state());
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

  // Generate unique device ID from MAC address
  deviceId = getDeviceId();
  setupTopics();

  Serial.println("==============================");
  Serial.println("SMART CLOTHESLINE IoT");
  Serial.println("Device ID: " + deviceId);
  Serial.println("==============================");

  setupWiFi();

  client.setServer(mqtt_server, 1883);
  client.setBufferSize(512); // Increase buffer for longer topic names
  client.setCallback(callback);

  Serial.println("Menstabilkan daya sebelum menyalakan Servo...");
  delay(2000);

  servoJemuran.attach(SERVO_PIN);
  servoJemuran.write(BERHENTI);
  statusDiLuar = false;
  reconnectMQTT();

  Serial.println("SISTEM JEMURAN PINTAR - READY DENGAN WEB KONTROL");
  Serial.println("Listening on topics:");
  Serial.println("  Data: " + topicData);
  Serial.println("  Status: " + topicStatus);
  Serial.println("  Kontrol: " + topicKontrol);
  Serial.println("  Pair: " + topicPair);
  Serial.println("  WiFi Reset: " + topicWifiReset);
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
    client.publish(topicStatus.c_str(), "ERROR: Gagal membaca sensor DHT!");
    return;
  }
  if (nilaiLDR == 0)
  {
    Serial.println("Gagal membaca sensor LDR!");
    client.publish(topicStatus.c_str(), "ERROR: Gagal membaca sensor LDR!");
    return;
  }
  if (intensitasAir == 0)
  {
    Serial.println("Gagal membaca sensor hujan!");
    client.publish(topicStatus.c_str(), "ERROR: Gagal membaca sensor hujan!");
    return;
  }

  bool gelap = (nilaiLDR > BATAS_GELAP);
  bool sedangHujan = (intensitasAir < BATAS_HUJAN);
  bool cuacaBuruk = sedangHujan || gelap || (lembab > BATAS_LEMBAB) || (suhu < BATAS_SUHU);

  char msg[256];
  snprintf(msg, sizeof(msg),
           "{\"suhu\":%.1f,\"lembab\":%.1f,\"ldr\":%d,\"intensitasAir\":%d,\"cuacaBuruk\":%d,\"mode\":\"%s\",\"statusDiLuar\":%d,\"deviceId\":\"%s\"}",
           suhu, lembab, nilaiLDR, intensitasAir, cuacaBuruk ? 1 : 0, modeAuto ? "AUTO" : "MANUAL", statusDiLuar ? 1 : 0, deviceId.c_str());
  client.publish(topicData.c_str(), msg);

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
        client.publish(topicStatus.c_str(), "EVENT: PROSES MASUK (Auto)");
      }
      setLeds(true, false, false);
      client.publish(topicStatus.c_str(), "EVENT: MASUK (Auto)");
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
        client.publish(topicStatus.c_str(), "EVENT: PROSES KELUAR (Auto)");
      }
      setLeds(false, false, true);
      client.publish(topicStatus.c_str(), "EVENT: KELUAR (Auto)");
    }
  }

  delay(3000);
}