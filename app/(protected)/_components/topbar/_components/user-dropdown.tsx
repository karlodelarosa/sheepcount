"use client";
import { useState } from "react";
import { Settings, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button/index";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/index";
import {
  Avatar,
  AvatarImage,
  AvatarInitial,
} from "@/components/ui/avatar/index";
import { useTenant } from "@/app/providers/tenant-provider";
import { getInitials } from "@/app/helpers";
import { useRouter } from "next/navigation";

function getDisplayName(
  firstName: string | undefined,
  lastName: string | undefined,
  email: string,
) {
  const fullName = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
  if (fullName) return fullName;
  const emailLocal = email.split("@")[0]?.trim();
  return emailLocal || "User";
}

const UserDropdown = () => {
  const { user, tenant, isLoggingOut, logout } = useTenant();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user && !isLoggingOut) return null;

  const profile = tenant?.profile;
  const email = user?.email ?? "";
  const displayName = getDisplayName(
    profile?.first_name,
    profile?.last_name,
    email,
  );
  const initials = profile?.first_name?.trim() || profile?.last_name?.trim()
    ? getInitials(profile.first_name, profile.last_name)
    : (displayName.charAt(0).toUpperCase() || "U");

  const handleLogout = async () => {
    setMenuOpen(false);
    router.replace("/auth/login");
    await logout();
  };

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 py-1 h-8 rounded-lg hover:bg-muted"
        >
          <Avatar className="w-6 h-6 border border-border">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarInitial initials={initials} />
          </Avatar>
          <div className="text-left leading-tight max-w-[140px]">
            <p className="text-foreground text-xs truncate">{displayName}</p>
          </div>
          <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-xl border-border/60"
      >
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-foreground">{displayName}</p>
            <p className="text-muted-foreground text-sm">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer rounded-lg"
          onClick={() => router.push("/profile")}
        >
          <User className="w-4 h-4 mr-2" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer rounded-lg"
          onClick={() => router.push("/settings")}
        >
          <Settings className="w-4 h-4 mr-2" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 rounded-lg"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { UserDropdown };
