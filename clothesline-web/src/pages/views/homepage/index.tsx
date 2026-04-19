import React, { useState, useEffect, useRef } from "react";
import styles from "./homepage.module.scss";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import {
  FaMapMarkerAlt,
  FaThermometerHalf,
  FaTint,
  FaWind,
  FaCloud,
  FaCloudSun,
  FaSignOutAlt,
  FaSun,
  FaClock,
  FaCalendarAlt,
  FaArrowsAltH,
  FaArrowDown,
} from "react-icons/fa";
import { IoIosRainy } from "react-icons/io";
import { SiRainyun } from "react-icons/si";

type WeatherData = {
  time: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  cloudcover: number;
  windspeed: number;
};

const TampilanHomepage = ({ weathers }: { weathers: WeatherData[] }) => {
  const weatherNow = weathers && weathers.length > 0 ? weathers[0] : null;

  const cloudCover = weatherNow?.cloudcover ?? 0;
  const precip = weatherNow?.precipitation ?? 0;

  const [railPosition, setRailPosition] = useState(0);
  const [time, setTime] = useState<Date>(new Date());
  // const [hasMounted, setHasMounted] = useState(false);
  const hasMounted = useRef(false);

  const { data } = useSession();

  useEffect(() => {
    hasMounted.current = true;
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // if (!hasMounted) {
  //     return <div className={styles.dashboardContainer} style={{ opacity: 0 }}></div>;
  // }

  return (
    <div className={styles.dashboardContainer}>
      {/* HEADER */}
      <header className={styles.mainHeader}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.dashboardTitle}>Dashboard Smart Clothesline</h1>
          <div className={styles.dateTimeWrapper}>
            <span>
              <FaCalendarAlt /> {formatDate(time)}
            </span>
            <span className={styles.divider}>|</span>
            <span>
              <FaClock /> {time.toLocaleTimeString("id-ID")}
            </span>
          </div>
        </div>

        <div className={styles.userSection}>
          {/* <span className={styles.userName}>malik</span>
                  <button className={styles.btnLogout}>
                    <FaSignOutAlt /> Logout
                  </button> */}
          {data ? (
            <>
              <span className={styles.userName}>{data.user?.name}</span>
              {/* <div className={styles.navbar__user}>
                        Welcome, {data.user?.fullname}
                        {data.user.image && (
                          <Image
                            src={data.user.image}
                            alt={data.user.fullname}
                            className={styles.navbar__user__image}
                            width={50}
                            height={50}
                          />
                        )}
                      </div> */}
              <button className={styles.btnLogout} onClick={() => signOut()}>
                Sign Out
              </button>
            </>
          ) : (
            <button className={styles.btnLogout} onClick={() => signIn()}>
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* MAIN GRID */}
      <main className={styles.mainGrid}>
        {/* PETA LOKASI */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Peta Lokasi</h2>
            <span className={styles.badgeLive}>Live Position</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.mapArea}>
              <div className={styles.mapMarker}>
                <span>📍</span>
                <div className={styles.mapPopup}>Lokasi awal (Malang)</div>
              </div>
            </div>
          </div>
          <div className={styles.separator}></div>
          <div className={styles.cardFooter}>
            <p className={styles.cardCaption}>
              Peta ini menampilkan posisi jemuran pintar Anda secara real-time.
            </p>
          </div>
        </section>

        {/* KONDISI CUACA */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Kondisi Cuaca</h2>
            {cloudCover <= 30 && precip < 0.5 ? (
              <span className={styles.badgeOptimal}>Optimal</span>
            ) : cloudCover > 30 && precip < 0.5 ? (
              <span className={styles.badgeKurangOptimal}>Kurang Optimal</span>
            ) : (
              <span className={styles.badgeBuruk}>Buruk</span>
            )}
          </div>
          <div className={styles.cardBody}>
            <div className={styles.locationTag}>
              <FaMapMarkerAlt /> Kota Malang
            </div>

            <div className={styles.weatherMain}>
              <div className={styles.tempDisplay}>
                <FaThermometerHalf className={styles.iconPurple} />{" "}
                {weatherNow ? weatherNow.temperature : "-"}
                <small>°C</small>
              </div>

              {precip > 0.5 ? (
                cloudCover > 50 ? (
                  <IoIosRainy className={styles.rainIcon} />
                ) : (
                  <SiRainyun className={styles.rainnyCloudyIcon} />
                )
              ) : cloudCover > 50 ? (
                <FaCloud className={styles.cloudyIcon} />
              ) : cloudCover > 15 ? (
                <FaCloudSun className={styles.cloudySunIcon} />
              ) : (
                <FaSun className={styles.sunIcon} />
              )}
            </div>

            <div className={styles.weatherGrid}>
              <div className={styles.metric}>
                <FaTint /> <span>Kelembaban</span>{" "}
                <strong>{weatherNow ? weatherNow.humidity : "-"}%</strong>
              </div>
              <div className={styles.metric}>
                <FaWind /> <span>Angin</span>{" "}
                <strong>{weatherNow ? weatherNow.windspeed : "-"} km/h</strong>
              </div>
              <div className={styles.metric}>
                <FaCloud /> <span>Awan</span>{" "}
                <strong>{weatherNow ? weatherNow.cloudcover : "-"}%</strong>
              </div>
            </div>
          </div>
          <div className={styles.separator}></div>
          <div className={styles.cardFooter}>
            {cloudCover <= 30 && precip < 0.5 ? (
              <div className={styles.statusBannerSuccess}>
                ✓ Kondisi sangat baik untuk menjemur pakaian.
              </div>
            ) : cloudCover > 30 && precip < 0.5 ? (
              <div className={styles.statusBannerWarning}>
                ⚠️ Kondisi cukup baik untuk menjemur pakaian.
              </div>
            ) : (
              <div className={styles.statusBannerError}>
                ✗ Kondisi tidak baik untuk menjemur pakaian.
              </div>
            )}
          </div>
        </section>

        {/* KONTROL CEPAT */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Kontrol Cepat</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.ctrlBtn} ${railPosition === 0 ? styles.active : ""}`}
                onClick={() => setRailPosition(0)}
              >
                <FaArrowsAltH /> Bentangkan
              </button>
              <button
                className={`${styles.ctrlBtn} ${railPosition === 100 ? styles.active : ""}`}
                onClick={() => setRailPosition(100)}
              >
                <FaArrowDown /> Lipat
              </button>
            </div>
          </div>
          <div className={styles.separator}></div>
          <div className={styles.cardFooter}>
            <div className={styles.weeklyStats}>
              <h3>Statistik Mingguan</h3>
              <div className={styles.statLine}>
                <span>Waktu Aktif</span> <strong>32h 10m</strong>
              </div>
              <div className={styles.statLine}>
                <span>Siklus Selesai</span> <strong>8 siklus</strong>
              </div>
              <div className={styles.statLine}>
                <span>Efisiensi</span>{" "}
                <strong className={styles.textGreen}>91%</strong>
              </div>
            </div>
          </div>
        </section>

        {/* STATUS JEMURAN */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Status Jemuran</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.statusStack}>
              <div className={styles.statusTile}>
                <p>Posisi Rel</p>
                <h3>Tertutup {railPosition}%</h3>
                <div className={styles.progressBase}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${railPosition}%` }}
                  ></div>
                </div>
              </div>

              <div className={styles.statusTile}>
                <p>Sensor Hujan</p>

                {precip > 0.5 ? (
                  <>
                    <h3 className={styles.textRed}>Hujan</h3>
                    <p className={styles.subtext}>Terdapat tetesan air.</p>
                  </>
                ) : (
                  <>
                    <h3 className={styles.textGreen}>Kering</h3>
                    <p className={styles.subtext}>
                      Tidak ada tetesan terdeteksi.
                    </p>
                  </>
                )}
              </div>

              <div className={styles.statusTile}>
                <p>Siklus</p>
                <h3>1 selesai</h3>
                <p className={styles.subtext}>hari ini</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.mainFooter}>
        Smart Clothesline System v1.0 • Hemat energi, ramah lingkungan
      </footer>
    </div>
  );
};

export default TampilanHomepage;
