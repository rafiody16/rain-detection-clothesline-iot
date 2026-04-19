import Head from "next/head";
import Link from "next/link";
import { FaCloudSun, FaArrowRight, FaWind, FaTint } from "react-icons/fa";
import { Geist, Geist_Mono } from "next/font/google";

import styles from "../styles/home.module.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Smart Clothesline IoT | Solusi Jemuran Pintar</title>
        <meta
          name="description"
          content="Jemuran Otomatis Berbasis IoT yang memantau cuaca dan mengamankan pakaian Anda dari hujan."
        />
      </Head>

      <div className={`${geistSans.variable} ${geistMono.variable} ${styles.landing}`}>
        
        {/* Abstract Background Blobs */}
        <div className={styles.landing__blob1}></div>
        <div className={styles.landing__blob2}></div>

        {/* Navbar */}
        <nav className={styles.landing__navbar}>
          <div className={styles.landing__brand}>
            <FaCloudSun />
            <span>ClothesLine</span>
          </div>
          <div className={styles.landing__navLinks}>
            <Link href="/auth/login" className={styles.landing__loginBtn}>
              Login
            </Link>
            <Link href="/auth/register" className={styles.landing__signupBtn}>
              Sign Up
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <main className={styles.landing__hero}>
          <section className={styles.landing__heroContent}>
            
            <div className={styles.landing__badge}>
              <span className={styles.landing__badgeDot}></span>
              Sistem IoT Aktif & Siaga
            </div>

            <h1 className={styles.landing__title}>
              Jemuran Pintar, <br />
              <span>Pakaian Selalu Aman.</span>
            </h1>

            <p className={styles.landing__description}>
              Tidak perlu khawatir jemuran basah saat hujan turun tiba-tiba.
              Smart Clothesline mendeteksi cuaca secara real-time dan
              mengamankan pakaian Anda secara otomatis.
            </p>

            <div className={styles.landing__actions}>
              <Link href="/homepage" className={styles.landing__btnPrimary}>
                Lihat Dashboard <FaArrowRight />
              </Link>
              <Link href="/auth/register" className={styles.landing__btnSecondary}>
                Mulai Sekarang
              </Link>
            </div>
            
          </section>
        </main>

        {/* Feature Highlights */}
        <div className={styles.landing__features}>
          <div className={styles.landing__featuresGrid}>
            
            <div className={styles.landing__card}>
              <div className={`${styles.landing__iconWrapper} ${styles['landing__iconWrapper--blue']}`}>
                <FaTint />
              </div>
              <h3 className={styles.landing__cardTitle}>Sensor Hujan Cepat</h3>
              <p className={styles.landing__cardDesc}>
                Mendeteksi rintik hujan pertama dan menarik jemuran dalam hitungan detik.
              </p>
            </div>

            <div className={styles.landing__card}>
              <div className={`${styles.landing__iconWrapper} ${styles['landing__iconWrapper--amber']}`}>
                <FaCloudSun />
              </div>
              <h3 className={styles.landing__cardTitle}>Analisis Cuaca</h3>
              <p className={styles.landing__cardDesc}>
                Dilengkapi sensor cahaya dan suhu untuk memaksimalkan efisiensi pengeringan.
              </p>
            </div>

            <div className={styles.landing__card}>
              <div className={`${styles.landing__iconWrapper} ${styles['landing__iconWrapper--emerald']}`}>
                <FaWind />
              </div>
              <h3 className={styles.landing__cardTitle}>Live Monitoring</h3>
              <p className={styles.landing__cardDesc}>
                Pantau dan kendalikan status jemuran dari mana saja melalui Dashboard.
              </p>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}