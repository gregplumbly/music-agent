import type { Metadata } from "next";
import { Sidebar } from "@/components/sidebar";
import { SearchProvider } from "@/components/search/search-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Music Agent",
  description: "Booking & contract management for music agents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SearchProvider>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <div className="p-6">{children}</div>
            </main>
          </div>
        </SearchProvider>
      </body>
    </html>
  );
}
