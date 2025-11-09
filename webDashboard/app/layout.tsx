import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ReduxProvider } from "@/providers/ReduxProvider"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { AuthInitializer } from "@/components/auth/AuthInitializer"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GreenTask - Climate Action Dashboard",
  description: "Hyperlocal climate-action micro-jobs marketplace for government officials",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthInitializer>
              {children}
            </AuthInitializer>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
