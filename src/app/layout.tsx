import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react" // Import React
import SessionWrapper from "./components/SessionWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GrowBeets",
  description: "Generate playlists to stimulate plant growth based on sound frequencies",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/gqr7kyx.css" />
      </head>
      <body className={inter.className}>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  )
}
