import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Header() {
  return (
    <nav className="w-full flex justify-end border-b border-b-foreground/10 h-16">
      <div className="flex items-center gap-4 px-5">
        <ThemeSwitcher />
        <AuthButton />
      </div>
    </nav>
  );
}
