"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DirectoryTitleCard } from "@/components/ui/directory-page-header";
import Link from "next/link";
import { useTheme } from "@/context/theme-context";
import { Moon, Sun, Upload, LayoutGrid, Settings, Check } from "lucide-react";
import { useTenant } from "@/app/providers/tenant-provider";
import { createClient } from "@/lib/supabase/client";
import { getOrganizationId } from "@/lib/supabase/tenant";
import {
  removeOrganizationLogo,
  uploadOrganizationLogo,
} from "@/lib/supabase/profile";
import { validateAvatarFile } from "@/lib/upload-validation";
import { toast } from "sonner";
import { NavigationVisibilitySettings } from "./_components/navigation-visibility";
import { DEFAULT_ACCENT_COLOR } from "@/lib/accent-color";

type SettingsTab = "general" | "menu";

function parseTab(value: string | null, isAdmin: boolean): SettingsTab {
  if (value === "menu" && isAdmin) {
    return "menu";
  }
  return "general";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function SettingsView() {
  const searchParams = useSearchParams();
  const { settings, updateSettings, resolvedMode } = useTheme();
  const { tenant, refreshSession } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const isAdmin = tenant?.profile?.role === "admin";
  const activeTab = parseTab(searchParams.get("tab"), isAdmin);

  const organizationId = getOrganizationId(tenant);

  const handleLogoFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !organizationId) return;

    try {
      validateAvatarFile(file);
    } catch (error) {
      toast.error(getErrorMessage(error));
      return;
    }

    setIsUploadingLogo(true);
    try {
      const updated = await uploadOrganizationLogo(
        supabase,
        organizationId,
        file,
      );
      updateSettings({ organizationLogo: updated.image ?? null });
      await refreshSession();
      toast.success("Organization logo updated");
    } catch (error) {
      toast.error("Failed to upload organization logo", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!organizationId) return;

    setIsUploadingLogo(true);
    try {
      await removeOrganizationLogo(supabase, organizationId);
      updateSettings({ organizationLogo: null, useOrganizationLogo: false });
      await refreshSession();
      toast.success("Organization logo removed");
    } catch (error) {
      toast.error("Failed to remove organization logo", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const accentColors = [
    { name: "Slate", value: "#030213" },
    { name: "Blue", value: "#2563eb" },
    { name: "Purple", value: "#7c3aed" },
    { name: "Green", value: "#059669" },
    { name: "Orange", value: DEFAULT_ACCENT_COLOR },
    { name: "Pink", value: "#db2777" },
    { name: "Indigo", value: "#4f46e5" },
  ];

  const cardClass = "rounded-xl border-border/60 bg-card shadow-none";
  const rowClass =
    "grid min-w-0 gap-4 py-5 md:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] md:items-center md:gap-8";
  const titleClass = "text-base font-semibold text-foreground";
  const descriptionClass = "mt-1 text-sm text-muted-foreground";

  return (
    <div>
      <DirectoryTitleCard
        title="Settings"
        description="Manage your organization and personalize Ministry Lens."
        icon={Settings}
      />
      <nav
        aria-label="Settings sections"
        className="flex gap-6 overflow-x-auto border-b border-border/60 sm:gap-8"
      >
        {[
          { value: "general", label: "General", icon: Settings },
          ...(isAdmin
            ? [{ value: "menu", label: "Menu Settings", icon: LayoutGrid }]
            : []),
        ].map(({ value, label, icon: Icon }) => (
          <Link
            key={value}
            href={`/settings?tab=${value}`}
            scroll={false}
            aria-current={activeTab === value ? "page" : undefined}
            className={`relative flex min-h-14 shrink-0 items-center gap-3 px-4 py-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-color)] ${activeTab === value ? "text-[var(--accent-color-strong)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[var(--accent-color)] dark:text-[var(--accent-color)]" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Icon className="size-5" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="min-w-0 py-6">
        {activeTab === "general" ? (
          <div className="space-y-6">
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="text-xl font-bold tracking-tight">
                  Organization
                </CardTitle>
                <CardDescription>
                  Update your organization details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border/60">
                  <div className={rowClass}>
                    <div>
                      <Label htmlFor="organization-name" className={titleClass}>
                        Organization name
                      </Label>
                      <p
                        id="organization-name-description"
                        className={descriptionClass}
                      >
                        Displayed across your workspace.
                      </p>
                    </div>
                    <Input
                      id="organization-name"
                      aria-describedby="organization-name-description"
                      value={settings.organizationName}
                      onChange={e =>
                        updateSettings({ organizationName: e.target.value })
                      }
                      placeholder="Enter organization name"
                    />
                  </div>
                  <div className={rowClass}>
                    <div>
                      <p id="organization-logo-label" className={titleClass}>
                        Organization logo
                      </p>
                      <p className={descriptionClass}>
                        Square image, at least 200 × 200 px.
                      </p>
                    </div>
                    <div
                      role="group"
                      aria-labelledby="organization-logo-label"
                      aria-busy={isUploadingLogo}
                      className="flex flex-wrap items-center gap-4"
                    >
                      {settings.organizationLogo ? (
                        <img
                          src={settings.organizationLogo}
                          alt="Organization logo"
                          className="size-16 rounded-xl border border-border/60 bg-muted/30 object-contain"
                        />
                      ) : null}
                      <input
                        ref={logoInputRef}
                        type="file"
                        aria-label="Upload organization logo"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleLogoFileChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-11 gap-2 px-5"
                        disabled={!organizationId || isUploadingLogo}
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <Upload className="size-4" aria-hidden="true" />
                        {isUploadingLogo
                          ? "Uploading..."
                          : settings.organizationLogo
                            ? "Change logo"
                            : "Upload logo"}
                      </Button>
                      {settings.organizationLogo ? (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={!organizationId || isUploadingLogo}
                          onClick={handleRemoveLogo}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-5">
                    <div>
                      <Label
                        htmlFor="use-organization-logo"
                        className={titleClass}
                      >
                        Use organization logo
                      </Label>
                      <p
                        id="organization-logo-description"
                        className={descriptionClass}
                      >
                        Replace the default Ministry Lens icon in the sidebar.
                      </p>
                    </div>
                    <Switch
                      id="use-organization-logo"
                      aria-describedby="organization-logo-description"
                      checked={settings.useOrganizationLogo}
                      disabled={!settings.organizationLogo}
                      onCheckedChange={checked =>
                        updateSettings({ useOrganizationLogo: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="text-xl font-bold tracking-tight">
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize how Ministry Lens looks and feels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border/60">
                  <div className={rowClass}>
                    <div>
                      <p className={titleClass}>Color mode</p>
                      <p className={descriptionClass}>
                        Choose how the application appears.
                      </p>
                    </div>
                    <div
                      role="group"
                      aria-label="Color mode"
                      className="flex w-full max-w-xs rounded-full border border-border/60 md:justify-self-end"
                    >
                      {(
                        [
                          { mode: "light", label: "Light", icon: Sun },
                          { mode: "dark", label: "Dark", icon: Moon },
                        ] as const
                      ).map(({ mode, label, icon: Icon }) => (
                        <button
                          key={mode}
                          type="button"
                          aria-pressed={resolvedMode === mode}
                          onClick={() => updateSettings({ mode })}
                          className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] ${resolvedMode === mode ? "border-[var(--accent-color)] bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]" : "border-transparent text-foreground hover:bg-muted"}`}
                        >
                          <Icon className="size-5" aria-hidden="true" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={`${rowClass} pb-0 md:items-start`}>
                    <div>
                      <p className={titleClass}>Accent color</p>
                      <p className={descriptionClass}>
                        Applied to selected navigation, controls, and
                        highlights.
                      </p>
                    </div>
                    <div
                      role="group"
                      aria-label="Accent color"
                      className="grid grid-cols-4 gap-x-2 gap-y-4 lg:grid-cols-7"
                    >
                      {accentColors.map(color => {
                        const selected = settings.accentColor === color.value;
                        return (
                          <button
                            key={color.value}
                            type="button"
                            aria-label={color.name}
                            aria-pressed={selected}
                            onClick={() =>
                              updateSettings({ accentColor: color.value })
                            }
                            className="flex min-w-0 flex-col items-center gap-2 rounded-lg py-1 text-xs transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] sm:text-sm"
                          >
                            <span
                              className={`flex size-11 shrink-0 items-center justify-center rounded-full border border-black/10 ${selected ? "ring-2 ring-[var(--accent-color)] ring-offset-2 ring-offset-card" : ""}`}
                              style={{ backgroundColor: color.value }}
                            >
                              {selected ? (
                                <Check
                                  className="size-6 text-white"
                                  strokeWidth={3}
                                  aria-hidden="true"
                                />
                              ) : null}
                            </span>
                            <span>{color.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : isAdmin ? (
          <NavigationVisibilitySettings />
        ) : null}
      </div>
    </div>
  );
}
