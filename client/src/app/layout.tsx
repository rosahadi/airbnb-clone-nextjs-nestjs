import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "@/lib/ApolloWrapper";
import Navbar from "@/components/navbar/Navbar";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "sonner";
import { MainContent } from "@/components/MainContent";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Airbnb",
  description: "Feel at home, away from home.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ApolloWrapper>
          <AuthProvider>
            <Navbar />
            <Toaster />
            <MainContent> {children}</MainContent>
          </AuthProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
