# 🌧️ Smart Clothesline: Sistem Jemuran Otomatis Berbasis IoT

Sistem jemuran otomatis yang mampu mendeteksi cuaca secara *real-time* dan mengamankan pakaian menggunakan sensor hujan, cahaya, dan kelembaban. Proyek ini mengintegrasikan **ESP32** dengan dashboard monitoring berbasis **Next.js** dan **Firebase**.



---

## 📌 Identifikasi Masalah
Cuaca tidak menentu seringkali membuat pakaian basah kembali saat ditinggal bepergian. Sistem ini hadir untuk:
1. Mendeteksi hujan secara otomatis tanpa intervensi pengguna.
2. Memberikan monitoring jarak jauh melalui dashboard web.
3. Melindungi komponen jemuran dengan mekanisme pembatas (Limit Switch).

## 🛠️ Perancangan Sistem

### Komponen Utama 
| Nama Komponen | Fungsi | 
| :--- | :--- | 
| **ESP32** | Mikrokontroler Utama (Otak Sistem) | 
| **Rain Sensor** | Deteksi tetesan air hujan | 
| **DHT22** | Membaca Suhu & Kelembaban | 
| **LDR Sensor** | Membaca Intensitas Cahaya | 
| **Servo MG996R (360°)** | Penggerak mekanik penarik jemuran | 
| **Limit Switch (4x)** | Sensor batas gerak (Henti otomatis) | 

### Arsitektur Perangkat Keras
Sistem menggunakan ESP32 untuk memproses input dari sensor hujan, cahaya (LDR), dan suhu (DHT22). Output berupa gerakan motor servo yang akan berhenti secara otomatis ketika menyentuh **Limit Switch** di posisi terbuka atau tertutup maksimal.



---

## 🚀 Logika Kerja Sistem
1. **Deteksi:** Sensor membaca kondisi lingkungan (Hujan/Cahaya/Suhu).
2. **Aksi Masuk:** Jika **Hujan** terdeteksi atau kondisi **Gelap**, ESP32 memutar servo ke arah dalam hingga Limit Switch aktif.
3. **Aksi Keluar:** Jika **Cerah** dan **Tidak Hujan**, servo diputar ke arah luar hingga mencapai batas luar.
4. **Monitoring:** Semua data sensor dikirim secara *real-time* ke **Firebase** dan ditampilkan pada dashboard website.

---

## 💻 Implementasi Software & Cloud
* **Firmware:** Dikembangkan menggunakan Arduino IDE untuk logika sensor dan konektivitas Wi-Fi.
* **Cloud Platform:** Menggunakan **Google Cloud Platform (Firebase)** sebagai database *real-time*.
* **Dashboard:** Dibangun menggunakan **Next.js** untuk visualisasi status jemuran dan data cuaca historis (Analisis Big Data).

## 🧪 Skenario Pengujian
| Skenario | Langkah | Hasil Diharapkan |
| :--- | :--- | :--- |
| **Uji Hujan** | Meneteskan air ke panel sensor. | Servo bergerak masuk dalam < 2 detik. |
| **Uji Cahaya** | Menutup sensor LDR (gelap). | Sistem otomatis menarik jemuran masuk. |
| **Uji Batas** | Jemuran bergerak ke ujung. | Limit switch mematikan servo tepat waktu. |
| **Uji Koneksi** | Mematikan Wi-Fi lalu menyalakan kembali. | ESP32 melakukan *auto-reconnect* ke server. |

## Kontributor
<table>
    <tr>
        <td width="110px" align="center" style="text-align: left;">
            <a href="https://github.com/afifahnisa17">
                <img src="https://avatars.githubusercontent.com/u/143988656?v=4?s=100" width="100px;" alt="Afifah Khoirunnisa"/><br />
                <sub>
                    <b>Afifah Khoirunnisa</b>
                </sub>
            </a>
        </td>
        <td width="110px" align="center" style="text-align: left;">
            <a href="https://github.com/adfhsjt">
                <img src="https://avatars.githubusercontent.com/u/143983317?v=4"/><br />
                <sub>
                    <b>Ahmad Dzul Fadhli</b>
                </sub>
            </a>
        </td>
        <td width="110px" align="center" style="text-align: left;">
            <a href="https://github.com/TamaDioo">
                <img src="https://avatars.githubusercontent.com/u/143988578?v=4" width="100px" alt="Dio Andika Pradana Mulia Tama"/><br />
                <sub>
                    <b>Dio Andika Pradana </b>
                </sub>
            </a>
        </td>
        <td width="110px" align="center" style="text-align: left;">
            <a href="https://github.com/rafiody16">
                <img src="https://avatars.githubusercontent.com/u/53549077?v=4"/><br />
                <sub>
                    <b>Rafi Ody Prasetyo</b>
                </sub>
            </a>
        </td>

</table>

---
*Dibuat untuk memenuhi tugas Product Base Learning (PBL) - Politeknik Negeri Malang 2026.*