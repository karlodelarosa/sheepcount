"use client";
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

const UserDropdown = () => {
  const { user, tenant, logout } = useTenant();
  const router = useRouter();

  if (!user) return null;

  const profile = tenant?.profile;
  const firstName = profile?.first_name ?? user.email.split("@")[0] ?? "User";
  const lastName = profile?.last_name ?? "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ");
  const initials = profile
    ? getInitials(profile.first_name, profile.last_name)
    : (user.email[0]?.toUpperCase() ?? "U");

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 py-1 h-8 rounded-lg hover:bg-muted"
        >
          <Avatar className="w-6 h-6 border border-border">
            <AvatarImage src="" />
            <AvatarInitial initials={initials} />
          </Avatar>
          <div className="text-left hidden md:block leading-tight">
            <p className="text-foreground text-xs">{displayName}</p>
          </div>
          <ChevronDown className="w-3 h-3 text-muted-foreground hidden md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-xl border-border/60"
      >
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-foreground">{displayName}</p>
            <p className="text-muted-foreground">{user?.email}</p>
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
