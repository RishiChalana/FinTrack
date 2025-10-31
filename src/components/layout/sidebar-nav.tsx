"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRightLeft,
  BarChart,
  Bot,
  Goal,
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

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transactions", icon: ArrowRightLeft, label: "Transactions" },
  { href: "/accounts", icon: Wallet, label: "Accounts" },
  { href: "/budgets", icon: PiggyBank, label: "Budgets" },
  { href: "/reports", icon: BarChart, label: "Reports" },
  { href: "/goals", icon: Goal, label: "Goals" },
  { href: "/ai-assistant", icon: Bot, label: "AI Assistant" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
          <PiggyBank className="h-6 w-6" />
          <span>FinTrack AI</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
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
                    <span className="text-sm font-medium">User</span>
                    <span className="text-xs text-muted-foreground">user@example.com</span>
                </div>
            </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
