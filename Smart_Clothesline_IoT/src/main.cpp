#include <Arduino.h>
#include <ESP32Servo.h>
#include <DHT.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiManager.h>
#include <Preferences.h>
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

#define DHTPIN 25
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// Servo
#define SERVO_PIN 15
Servo servoJemuran;

// LED indikator
#define R 13
#define G 12
#define B 14

// Sensor
#define LDR_PIN 34
#define RAIN_ANALOG 35

const float BATAS_LEMBAB = 80.0;
const float BATAS_SUHU = 25.0;

// =====================
// RENTANG SENSOR CAHAYA (Makin kecil = Terang)
// =====================
const int LDR_TERIK   = 800;   // 0 - 800: Cerah Terik
const int LDR_BERAWAN = 1800;  // 801 - 1800: Berawan Sebagian
const int LDR_MENDUNG = 2800;  // 1801 - 2800: Mendung Gelap
// > 2800: Malam / Sangat Gelap
// const int BATAS_GELAP = 2500;

// =====================
// RENTANG SENSOR HUJAN (Makin kecil = Basah)
// =====================
const int HUJAN_KERING  = 3800;  // > 3800: Tidak ada air
const int HUJAN_GERIMIS = 2500;  // 2500 - 3800: Ada tetesan (Gerimis)
// < 2500: Hujan Deras
// const int BATAS_HUJAN = 3600;

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
// STATE TIMER INTERNAL
// =====================
bool timerAktif = false;
unsigned long targetWaktuTimer = 0; // Kapan timer ini harus dieksekusi (dalam format millis)
String aksiTimer = ""; // "MASUK" atau "KELUAR"

// =====================
// DEVICE ID
// =====================
String deviceId;

// =====================
// MQTT Config
// =====================
const char *mqtt_server = "3.27.138.96";

WiFiClient espClient;
PubSubClient client(espClient);

// MQTT Topics
String topicData;
String topicStatus;
String topicKontrol;
String topicPair;
String topicWifiReset;

// Deklarasi Fungsi
void setLeds(bool dalam, bool proses, bool luar);

String getDeviceId()
{
  uint8_t mac[6];
  WiFi.macAddress(mac);
  char id[13];
  snprintf(id, sizeof(id), "%02X%02X%02X%02X%02X%02X",
           mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  return String(id);
}

void setupTopics()
{
  topicData = "jemuran/" + deviceId + "/data";
  topicStatus = "jemuran/" + deviceId + "/status";
  topicKontrol = "jemuran/" + deviceId + "/kontrol";
  topicPair = "jemuran/" + deviceId + "/pair";
  topicWifiReset = "jemuran/" + deviceId + "/wifi-reset";
}

// Fungsi eksekusi pergerakan (agar tidak ngulang kode)
void gerakJemuran(String aksi, String asal) {
  if (aksi == "MASUK" && statusDiLuar == true) {
    Serial.println(asal + ": Menarik jemuran MASUK...");
    setLeds(false, true, false);
    servoJemuran.write(PUTAR_MASUK);
    delay(DURASI_PUTAR);
    servoJemuran.write(BERHENTI);
    statusDiLuar = false;
    setLeds(true, false, false);
    client.publish(topicStatus.c_str(), ("EVENT: MASUK (" + asal + ")").c_str());
  } 
  else if (aksi == "KELUAR" && statusDiLuar == false) {
    Serial.println(asal + ": Mendorong jemuran KELUAR...");
    setLeds(false, true, false);
    servoJemuran.write(PUTAR_KELUAR);
    delay(DURASI_PUTAR);
    servoJemuran.write(BERHENTI);
    statusDiLuar = true;
    setLeds(false, false, true);
    client.publish(topicStatus.c_str(), ("EVENT: KELUAR (" + asal + ")").c_str());
  }
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
  Serial.println("Pesan Web masuk [" + topicStr + "]: " + pesan);

  if (topicStr == topicKontrol)
  {
    // Jika ada perintah kontrol masuk, batalkan timer yang sedang berjalan
    if (pesan == "MASUK" || pesan == "KELUAR" || pesan == "AUTO" || pesan == "MANUAL" || pesan == "BATAL_TIMER") {
        timerAktif = false;
    }

    if (pesan == "MASUK")
    {
      modeAuto = false;
      gerakJemuran("MASUK", "Manual Web");
    }
    else if (pesan == "KELUAR")
    {
      modeAuto = false;
      gerakJemuran("KELUAR", "Manual Web");
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
    else if (pesan == "BATAL_TIMER")
    {
      Serial.println("Web Perintah: TIMER DIBATALKAN");
      client.publish(topicStatus.c_str(), "DEBUG: TIMER DIBATALKAN");
    }
    // CEK JIKA FORMAT PESAN ADALAH TIMER (Cth: TIMER_MASUK_1800)
    else if (pesan.startsWith("TIMER_")) 
    {
      int underscore1 = pesan.indexOf('_');
      int underscore2 = pesan.indexOf('_', underscore1 + 1);
      
      if (underscore1 != -1 && underscore2 != -1) {
        String aksi = pesan.substring(underscore1 + 1, underscore2); // "MASUK" / "KELUAR"
        String detikStr = pesan.substring(underscore2 + 1); // "1800"
        
        unsigned long durasiMilis = detikStr.toInt() * 1000UL;
        
        // Pindah ke mode manual
        modeAuto = false;
        
        // Setup Timer
        targetWaktuTimer = millis() + durasiMilis;
        aksiTimer = aksi;
        timerAktif = true;
        
        Serial.println("Timer diaktifkan! Target: " + aksiTimer + ", Durasi (ms): " + String(durasiMilis));
        client.publish(topicStatus.c_str(), ("DEBUG: TIMER " + aksiTimer + " DIMULAI").c_str());
      }
    }
  }
  else if (topicStr == topicPair)
  {
    if (pesan == "PING")
    {
      String response = "{\"deviceId\":\"" + deviceId + "\",\"pong\":true,\"ip\":\"" + WiFi.localIP().toString() + "\"}";
      client.publish(topicPair.c_str(), response.c_str());
    }
  }
  else if (topicStr == topicWifiReset)
  {
    if (pesan == "RESET")
    {
      client.publish(topicStatus.c_str(), "INFO: WiFi Reset - Restarting in AP mode...");
      delay(1000);
      WiFiManager wm;
      wm.resetSettings();
      ESP.restart();
    }
  }
}

void setupWiFi()
{
  Serial.println("Memulai WiFiManager...");
  WiFiManager wifiManager;
  String apName = "Clothesline_" + deviceId.substring(6);
  if (!wifiManager.autoConnect(apName.c_str()))
  {
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
    String clientId = "ESP32-" + deviceId;
    if (client.connect(clientId.c_str(), topicStatus.c_str(), 1, true, "Offline"))
    {
      Serial.println("Connected!");
      client.publish(topicStatus.c_str(), "Online", true);
      client.subscribe(topicKontrol.c_str());
      client.subscribe(topicPair.c_str());
      client.subscribe(topicWifiReset.c_str());
    }
    else
    {
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
  Serial.begin(115200);
  delay(1000); 

  pinMode(RAIN_ANALOG, INPUT);
  pinMode(R, OUTPUT);
  pinMode(G, OUTPUT);
  pinMode(B, OUTPUT);
  setLeds(true, false, false);

  dht.begin();
  deviceId = getDeviceId();
  setupTopics();

  delay(1000); 

  ESP32PWM::allocateTimer(0);
  servoJemuran.setPeriodHertz(50); 
  servoJemuran.attach(SERVO_PIN, 1000, 2000); 
  
  servoJemuran.write(BERHENTI);
  statusDiLuar = false;

  delay(2000);

  setupWiFi();
  client.setServer(mqtt_server, 1883);
  client.setBufferSize(512);
  client.setCallback(callback);
  reconnectMQTT();
}

unsigned long lastUpdate = 0;

void loop()
{
  if (!client.connected())
    reconnectMQTT();
  client.loop();

  // === 1. CEK TIMER INTERNAL ===
  // Dilakukan tanpa delay agar responsif
  if (timerAktif) {
    if (millis() >= targetWaktuTimer) {
      Serial.println("Waktu habis! Mengeksekusi timer: " + aksiTimer);
      gerakJemuran(aksiTimer, "Timer ESP32");
      timerAktif = false; // Matikan timer
    }
  }

  // === 2. BACA SENSOR & PUBLISH DATA SETIAP 3 DETIK ===
  // Mengganti delay(3000) dengan millis() agar ESP32 tidak freeze (bisa nerima MQTT/Timer)
  if (millis() - lastUpdate >= 3000) {
    lastUpdate = millis();

    float suhu = dht.readTemperature();
    float lembab = dht.readHumidity();
    int nilaiLDR = bacaSensorStabil(LDR_PIN);
    int intensitasAir = bacaSensorStabil(RAIN_ANALOG);

    // bool gelap = (nilaiLDR > BATAS_GELAP);
    // bool sedangHujan = (intensitasAir < BATAS_HUJAN);
    // bool cuacaBuruk = sedangHujan || gelap || (lembab > BATAS_LEMBAB) || (suhu < BATAS_SUHU);

    // --- LOGIKA PENENTUAN STATUS CUACA ---
    String kondisiCuaca = "Tidak Diketahui";

    if (intensitasAir < HUJAN_GERIMIS) {
        kondisiCuaca = "Hujan Deras";
    } else if (intensitasAir < HUJAN_KERING) {
        kondisiCuaca = "Gerimis";
    } else if (nilaiLDR > LDR_MENDUNG) {
        kondisiCuaca = "Malam/Gelap";
    } else if (nilaiLDR > LDR_BERAWAN) {
        kondisiCuaca = "Mendung";
    } else if (nilaiLDR > LDR_TERIK) {
        kondisiCuaca = "Berawan";
    } else {
        kondisiCuaca = "Cerah Terik";
    }

    // Jemuran masuk JIKA Gerimis, Mendung, Hujan Deras, Malam, atau Mendung
    bool cuacaBuruk = (intensitasAir < HUJAN_GERIMIS) || (intensitasAir < HUJAN_KERING) || (nilaiLDR > LDR_MENDUNG) || (nilaiLDR > LDR_BERAWAN) || (lembab > BATAS_LEMBAB) || (suhu < BATAS_SUHU);

    // Hitung sisa timer (jika aktif)
    long sisaTimerDetik = 0;
    if (timerAktif) {
      sisaTimerDetik = (targetWaktuTimer - millis()) / 1000;
      if (sisaTimerDetik < 0) sisaTimerDetik = 0;
    }

    // --- KIRIM DATA KE MQTT ---
    char msg[400]; // Buffer diperbesar untuk menampung field 'kondisi'
    snprintf(msg, sizeof(msg),
             "{\"suhu\":%.1f,\"lembab\":%.1f,\"ldr\":%d,\"intensitasAir\":%d,\"cuacaBuruk\":%d,\"mode\":\"%s\",\"statusDiLuar\":%d,\"deviceId\":\"%s\",\"timerAktif\":%d,\"timerAksi\":\"%s\",\"sisaTimer\":%ld,\"kondisi\":\"%s\"}",
             suhu, lembab, nilaiLDR, intensitasAir, cuacaBuruk ? 1 : 0, modeAuto ? "AUTO" : "MANUAL", statusDiLuar ? 1 : 0, deviceId.c_str(), timerAktif ? 1 : 0, aksiTimer.c_str(), sisaTimerDetik, kondisiCuaca.c_str());
    
    client.publish(topicData.c_str(), msg);

    // === 3. LOGIKA AUTO ===
    if (modeAuto && !timerAktif) // Auto ditahan jika timer sedang jalan
    {
      if (cuacaBuruk) {
        gerakJemuran("MASUK", "Auto Sensor");
      } else {
        gerakJemuran("KELUAR", "Auto Sensor");
      }
    }
  }
}