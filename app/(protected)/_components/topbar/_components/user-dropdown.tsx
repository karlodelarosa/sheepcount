"use client";
import {
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button/index";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/index";
import { Avatar, AvatarFallback, AvatarImage, AvatarInitial } from "@/components/ui/avatar/index";
import { useTenant } from "@/app/providers/tenant-provider";
import { getInitials, getGradients } from "@/app/helpers";


const UserDropdown = () => {
  const { user, tenant } = useTenant();

  if (!tenant) return null;

  const { profile } = tenant;

  return (
    <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-3 py-2 h-auto rounded-xl hover:bg-muted"
              >
                <Avatar className="w-9 h-9 border-2 border-border">
                  <AvatarImage src="" />
                  <AvatarInitial initials={getInitials(profile.first_name, profile.last_name)} />
                </Avatar>
                <div className="text-left hidden md:block">
                <p className="text-foreground">{profile.first_name} {profile.last_name}</p>
                <p className="text-muted-foreground font-black">{tenant.tenant.name}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-xl border-border/60"
            >
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                <p className="text-foreground">{profile.first_name} {profile.last_name}</p>
                <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer rounded-lg">
                <User className="w-4 h-4 mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-lg">
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 rounded-lg">
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
  )
}

export { UserDropdown };