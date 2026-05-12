import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/provider/theme-provider";
import { ColorThemeProvider } from "@/contexts/color-theme-context";
export default function App({
  Component,
  pageProps: { session, pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <ColorThemeProvider>
        <ThemeProvider attribute="class">
          <TooltipProvider>
            <Component {...pageProps} />
          </TooltipProvider>
        </ThemeProvider>
      </ColorThemeProvider>
    </SessionProvider>
  );
}
