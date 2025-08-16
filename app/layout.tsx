import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "../styles/accessibility.css"
import { ThemeProvider } from "@/components/theme-provider"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { extractRouterConfig } from "uploadthing/server"
import { ourFileRouter } from "./api/uploadthing/core"
import { SettingsProvider } from "@/contexts/settings-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Financial Calendar - Interactive Volatility & Performance Visualization",
  description:
    "Interactive calendar for visualizing historical volatility, liquidity, and performance data across different time periods for financial instruments.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
  <body className={inter.className}>
        <SettingsProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <main id="main-content">
              {children}
            </main>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
