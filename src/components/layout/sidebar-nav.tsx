"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  BarChart,
  Bot,
  LayoutDashboard,
  PiggyBank,
  Wallet,
} from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { UserNav } from "@/components/user-nav";
import { Separator } from "@/components/ui/separator";
import { apiGet } from "@/lib/api-client";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transactions", icon: ArrowRightLeft, label: "Transactions" },
  { href: "/budgets", icon: PiggyBank, label: "Budgets" },
  { href: "/reports", icon: BarChart, label: "Reports" },
  { href: "/ai-assistant", icon: Bot, label: "AI Assistant" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [me, setMe] = useState<{ name: string | null; email: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = () => {
      apiGet<{ user: { name: string | null; email: string } }>("/api/me")
        .then((d) => { if (mounted) setMe(d.user); })
        .catch(() => { if (mounted) setMe(null); });
    };
    load();
    const onUpdated = () => load();
    const onFocus = () => load();
    if (typeof window !== 'undefined') {
      window.addEventListener('data-updated', onUpdated);
      window.addEventListener('focus', onFocus);
    }
    return () => {
      mounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('data-updated', onUpdated);
        window.removeEventListener('focus', onFocus);
      }
    };
  }, []);

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
          <PiggyBank className="h-6 w-6" />
          <span>FinTrack</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="hidden md:flex flex-col gap-2 p-2">
        <Separator />
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
            <div className="flex items-center gap-3">
                <UserNav />
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{me?.name || me?.email || 'Account'}</span>
                    <span className="text-xs text-muted-foreground">{me?.email || ''}</span>
                </div>
            </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
