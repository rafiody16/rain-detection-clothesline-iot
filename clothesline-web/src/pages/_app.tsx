import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router"; // PERBAIKAN 1: Import useRouter yang benar untuk Pages Router
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/provider/theme-provider";
import { ColorThemeProvider } from "@/contexts/color-theme-context";
import { MqttProvider } from "@/contexts/mqtt-context";
import { FirebaseProvider } from "@/contexts/firebase-context";
import { DeviceProvider } from "@/contexts/device-context";

type AppPropsWithLayout = AppProps & {
  Component: any;
};

export default function App({
  Component,
  pageProps: { session, ...pageProps }, // PERBAIKAN 2: Destructuring yang benar
}: AppPropsWithLayout) {
  const router = useRouter();

  // Cek apakah URL saat ini berada di dalam "/dashboard"
  const isDashboard = router.pathname.startsWith("/dashboard");

  // Gunakan layout khusus dari halaman jika ada (dari getLayout)
  const getLayout = Component.getLayout ?? ((page: any) => page);

  // Komponen halaman yang sudah siap dirender
  const pageContent = getLayout(<Component {...pageProps} />);

  // PERBAIKAN 3 & 4: Struktur JSX dan Hierarki Provider
  // SessionProvider wajib berada di atas DeviceProvider
  return (
    <SessionProvider session={session}>
      <ColorThemeProvider>
        <ThemeProvider attribute="class">
          <TooltipProvider>
            
            {/* JIKA DI DASHBOARD: Muat semua fungsi IoT */}
            {isDashboard ? (
              <DeviceProvider>
                <FirebaseProvider>
                  <MqttProvider>
                    {pageContent}
                  </MqttProvider>
                </FirebaseProvider>
              </DeviceProvider>
            ) : (
              /* JIKA BUKAN DASHBOARD: Langsung render halaman tanpa memuat IoT */
              pageContent
            )}

          </TooltipProvider>
        </ThemeProvider>
      </ColorThemeProvider>
    </SessionProvider>
  );
}