import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title:"Property Platform — Verified homes, private locations", description:"Verified property, rental, roommate and local marketplace platform for India." };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-IN"><body>{children}</body></html>}
