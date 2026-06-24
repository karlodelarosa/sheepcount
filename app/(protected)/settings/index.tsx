"use client";

import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/theme-context";
import { Moon, Sun, Palette, Building2, Upload, Droplets } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { useTenant } from "@/app/providers/tenant-provider";
import { createClient } from "@/lib/supabase/client";
import { getOrganizationId } from "@/lib/supabase/tenant";
import {
  removeOrganizationLogo,
  uploadOrganizationLogo,
  validateAvatarFile,
} from "@/lib/supabase/profile";
import { toast } from "sonner";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function SettingsView() {
  const { settings, updateSettings, toggleMode } = useTheme();
  const { tenant, refreshSession } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const {
    settings: orgSettings,
    hydrated: orgSettingsHydrated,
    isSaving: orgSettingsSaving,
    setWaterBaptismEnabled,
  } = useOrganizationSettings();

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
    { name: "Orange", value: "#ea580c" },
    { name: "Pink", value: "#db2777" },
    { name: "Indigo", value: "#4f46e5" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground">Customize your organization's appearance and branding</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Theme Mode */}
        <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 flex items-center justify-center">
                {settings.mode === 'dark' ? (
                  <Moon className="w-5 h-5 text-white dark:text-slate-900" />
                ) : (
                  <Sun className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Toggle between light and dark mode</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-background/50">
              <div>
                <p className="text-foreground">Dark Mode</p>
                <p className="text-muted-foreground">Use dark theme throughout the app</p>
              </div>
              <Switch 
                checked={settings.mode === 'dark'} 
                onCheckedChange={toggleMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Organization Details */}
        <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Organization</CardTitle>
                <CardDescription>Update your organization details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input 
                value={settings.organizationName}
                onChange={(e) => updateSettings({ organizationName: e.target.value })}
                placeholder="Enter organization name"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Organization Logo</Label>
              <div className="flex items-center gap-3">
                {settings.organizationLogo ? (
                  <img
                    src={settings.organizationLogo}
                    alt="Organization logo"
                    className="h-12 w-12 rounded-lg border border-border/60 object-cover"
                  />
                ) : null}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleLogoFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={!organizationId || isUploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                  {isUploadingLogo ? "Uploading..." : "Upload Logo"}
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
                {settings.organizationLogo && !isUploadingLogo ? (
                  <Badge variant="secondary">Logo uploaded</Badge>
                ) : null}
              </div>
              <p className="text-muted-foreground">Recommended: Square image, at least 200x200px</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-background/50">
              <div>
                <p className="text-foreground">Use organization logo</p>
                <p className="text-muted-foreground">
                  Show your logo in the sidebar instead of the Ministry Lens icon
                </p>
              </div>
              <Switch
                checked={settings.useOrganizationLogo}
                disabled={!settings.organizationLogo}
                onCheckedChange={(checked) =>
                  updateSettings({ useOrganizationLogo: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Accent Color */}
        <Card className="border-border/60 bg-card/50 backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Accent Color</CardTitle>
                <CardDescription>Choose a primary color for your application</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {accentColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateSettings({ accentColor: color.value })}
                  className={`
                    group relative p-4 rounded-xl border-2 transition-all duration-200
                    ${settings.accentColor === color.value 
                      ? 'border-foreground shadow-lg' 
                      : 'border-border/60 hover:border-border'
                    }
                  `}
                >
                  <div 
                    className="w-full h-16 rounded-lg shadow-sm"
                    style={{ backgroundColor: color.value }}
                  />
                  <p className="mt-3 text-foreground">{color.name}</p>
                  {settings.accentColor === color.value && (
                    <Badge className="mt-2 w-full">Selected</Badge>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="border-border/60 bg-card/50 backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Features</CardTitle>
                <CardDescription>
                  Enable optional modules for your church
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-background/50">
              <div>
                <p className="text-foreground">Water Baptism</p>
                <p className="text-muted-foreground">
                  Track baptisms, view the registry, and generate certificates
                </p>
              </div>
              <Switch
                checked={orgSettings.waterBaptismEnabled ?? false}
                disabled={!orgSettingsHydrated || orgSettingsSaving}
                onCheckedChange={setWaterBaptismEnabled}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
