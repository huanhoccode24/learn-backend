import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import { ToastProvider } from "@/components/ui/Toast";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import UserHeader from "@/components/layout/user-header";
import UserFooter from "@/components/layout/user-footer";
import LiveblocksClientProvider from "@/providers/liveblocks-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BitelleLearnHub",
  description: "Nền tảng chia sẻ tri thức về lập trình và phát triển phần mềm",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider session={session}>
          <ToastProvider>
            <LiveblocksClientProvider>
              <QueryProvider>
                <UserHeader />
                {children}
                <UserFooter />
              </QueryProvider>
            </LiveblocksClientProvider>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
