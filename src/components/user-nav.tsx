"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";

export function UserNav() {
    const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
    const [user, setUser] = useState<{ name: string | null; email: string } | null>(null);

    useEffect(() => {
      let mounted = true;
      const load = () => {
        apiGet<{ user: { name: string | null; email: string } }>("/api/me")
          .then((d) => { if (mounted) setUser(d.user); })
          .catch(() => { if (mounted) setUser(null); });
      };
      load();
      const onUpdated = () => load();
      const onStorage = (e: StorageEvent) => {
        if (e.key === 'accessToken' || e.key === 'refreshToken') load();
      };
      const onFocus = () => load();
      if (typeof window !== 'undefined') {
        window.addEventListener('data-updated', onUpdated);
        window.addEventListener('storage', onStorage);
        window.addEventListener('focus', onFocus);
      }
      return () => {
        mounted = false;
        if (typeof window !== 'undefined') {
          window.removeEventListener('data-updated', onUpdated);
          window.removeEventListener('storage', onStorage);
          window.removeEventListener('focus', onFocus);
        }
      };
    }, []);

    const initials = useMemo(() => {
      const name = (user?.name || '').trim();
      if (name) return name.charAt(0).toUpperCase();
      const email = (user?.email || '').trim();
      if (email) return email.charAt(0).toUpperCase();
      return 'U';
    }, [user]);

    function logout() {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage 
                src={userAvatar?.imageUrl}
                alt="User avatar" 
                data-ai-hint={userAvatar?.imageHint}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email || ''}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile"> 
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
