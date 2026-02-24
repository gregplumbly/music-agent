import { Sidebar } from "@/components/sidebar";
import { SearchProvider } from "@/components/search/search-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto pt-14 md:pt-0">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SearchProvider>
  );
}
