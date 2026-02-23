"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  BookOpen,
  Map,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Artists", href: "/artists", icon: Users },
  { name: "Bookings", href: "/bookings", icon: BookOpen },
  { name: "Tours", href: "/tours", icon: Map },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-col border-r border-border bg-muted/50">
      <div className="flex h-14 items-center border-b border-border px-4">
        <h1 className="text-lg font-semibold">Music Agent</h1>
      </div>

      <div className="p-3">
        <button className="flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
          <Search className="h-4 w-4" />
          <span>Search...</span>
          <kbd className="ml-auto text-xs text-muted-foreground">⌘K</kbd>
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
