import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TabNav from "@/components/tab/TabNav";
import ToolStateStrip from "@/components/tab/ToolStateStrip";
import GrantBuilder from "@/components/grants/GrantBuilder";
import { PortalProvider } from "@/lib/state/PortalContext";
import "./globals.css";

// Outfit for body, JetBrains Mono for numbers/dates per the sibling pattern.
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://equity.arminoorata.com"),
  title: {
    default: "Equity Education Portal",
    template: "%s · Equity Education Portal",
  },
  description:
    "A free public tool for understanding stock options, RSUs, and the rest of equity compensation. By Armi Noorata.",
  applicationName: "Equity Toolkit",
  authors: [{ name: "Armi Noorata", url: "https://arminoorata.com" }],
  creator: "Armi Noorata",
  keywords: [
    "equity compensation",
    "stock options",
    "ISO",
    "NSO",
    "RSU",
    "vesting",
    "Total Rewards",
    "Armi Noorata",
  ],
  openGraph: {
    type: "website",
    url: "https://equity.arminoorata.com",
    siteName: "Equity Education Portal",
    title: "Equity Education Portal",
    description:
      "A free public tool for understanding stock options, RSUs, and the rest of equity compensation. By Armi Noorata.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Equity Education Portal",
    description:
      "A free public tool for understanding stock options, RSUs, and the rest of equity compensation.",
    creator: "@arminoorata",
  },
};

// Dark default; returning visitors keep their localStorage choice.
const bootstrap = `(function(){try{var s=localStorage.getItem('theme');var t=s||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

// No client Analytics or SpeedInsights. The portal handles user grant data
// and BYOK API keys; mounting third-party page-view tags inside the tool
// would undercut the no-servers / no-logs privacy story in the spec. Vercel's
// request-level analytics still works at the platform layer.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <PortalProvider>
          <SiteHeader />
          <TabNav />
          <ToolStateStrip />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <GrantBuilder />
        </PortalProvider>
      </body>
    </html>
  );
}
