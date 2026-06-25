"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTenant } from "@/app/providers/tenant-provider";
import { PageLoader } from "@/components/page-loader";
import { getInitials } from "@/app/helpers";
import { createClient } from "@/lib/supabase/client";
import { getOrganizationId } from "@/lib/supabase/tenant";
import { normalizePlanKey } from "@/lib/subscription/plans";
import { CancelSubscriptionDialog } from "@/app/(protected)/profile/_components/cancel-subscription-dialog";
import { SubscriptionUpgrade } from "@/app/(protected)/profile/_components/subscription-upgrade";
import {
  removeUserAvatar,
  updateOrganizationDetails,
  updateUserProfile,
  uploadUserAvatar,
} from "@/lib/supabase/profile";
import { validateAvatarFile } from "@/lib/upload-validation";
import dayjs from "dayjs";
import { toast } from "sonner";
import {
  Activity,
  Building2,
  CreditCard,
  Lock,
  Upload,
  User,
} from "lucide-react";

type ProfileTab =
  | "personal"
  | "organization"
  | "subscription"
  | "security"
  | "activity";

const ADMIN_TABS: ProfileTab[] = [
  "personal",
  "organization",
  "subscription",
  "security",
  "activity",
];

const MEMBER_TABS: ProfileTab[] = [
  "personal",
  "subscription",
  "security",
  "activity",
];

function parseTab(value: string | null, isAdmin: boolean): ProfileTab {
  const allowed = isAdmin ? ADMIN_TABS : MEMBER_TABS;
  if (value && allowed.includes(value as ProfileTab)) {
    return value as ProfileTab;
  }
  return "personal";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

const tabTriggerClass =
  "gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-white";

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, tenant, isLoading, refreshSession } = useTenant();
  const supabase = useMemo(() => createClient(), []);

  const organizations = tenant?.organizations ?? tenant?.tenant.organizations ?? [];
  const profile = tenant?.profile;
  const subscription = tenant?.subscription;
  const isAdmin = profile?.role === "admin";
  const activeTab = parseTab(searchParams.get("tab"), isAdmin);

  const setActiveTab = (tab: string) => {
    router.replace(`/profile?tab=${tab}`, { scroll: false });
  };

  const [selectedOrgIndex, setSelectedOrgIndex] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarPreviewRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAdmin && activeTab === "organization") {
      setActiveTab("personal");
    }
  }, [isAdmin, activeTab]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setAvatarUrl(profile.avatar_url || "");
    } else if (user) {
      setFirstName(user.email.split("@")[0] ?? "");
      setLastName("");
      setAvatarUrl("");
    }

    const org = organizations[selectedOrgIndex] ?? organizations[0];
    if (org) {
      setPhone(org.phone || "");
      setTenantName(org.name || "");
      setOrgAddress(org.address || "");
    } else if (tenant?.tenant.name) {
      setTenantName(tenant.tenant.name);
    }
  }, [profile, organizations, selectedOrgIndex, tenant, user]);

  useEffect(() => {
    return () => {
      if (avatarPreviewRef.current) {
        URL.revokeObjectURL(avatarPreviewRef.current);
      }
    };
  }, []);

  const resetAvatarSelection = () => {
    if (avatarPreviewRef.current) {
      URL.revokeObjectURL(avatarPreviewRef.current);
      avatarPreviewRef.current = null;
    }
    setAvatarPreviewUrl(null);
    setAvatarFile(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const openAvatarDialog = () => {
    resetAvatarSelection();
    setAvatarDialogOpen(true);
  };

  const handleAvatarDialogChange = (open: boolean) => {
    setAvatarDialogOpen(open);
    if (!open) {
      resetAvatarSelection();
    }
  };

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      validateAvatarFile(file);
    } catch (error) {
      toast.error(getErrorMessage(error));
      event.target.value = "";
      return;
    }

    if (avatarPreviewRef.current) {
      URL.revokeObjectURL(avatarPreviewRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    avatarPreviewRef.current = previewUrl;
    setAvatarPreviewUrl(previewUrl);
    setAvatarFile(file);
  };

  const handleSaveAvatar = async () => {
    if (!user || !avatarFile) return;

    setIsSavingAvatar(true);
    try {
      const updated = await uploadUserAvatar(supabase, user.id, avatarFile);
      setAvatarUrl(updated.avatar_url ?? "");
      await refreshSession();
      setAvatarDialogOpen(false);
      resetAvatarSelection();
      toast.success("Profile picture updated");
    } catch (error) {
      toast.error("Failed to upload profile picture", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    setIsSavingAvatar(true);
    try {
      await removeUserAvatar(supabase, user.id);
      setAvatarUrl("");
      await refreshSession();
      setAvatarDialogOpen(false);
      resetAvatarSelection();
      toast.success("Profile picture removed");
    } catch (error) {
      toast.error("Failed to remove profile picture", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleSavePersonalInfo = async () => {
    if (!user) return;

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst) {
      toast.error("First name is required");
      return;
    }

    setIsSavingPersonal(true);
    try {
      await updateUserProfile(supabase, user.id, {
        first_name: trimmedFirst,
        last_name: trimmedLast,
      });
      await refreshSession();
      toast.success("Personal information saved");
    } catch (error) {
      toast.error("Failed to save personal information", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handleSaveOrganization = async () => {
    const orgId = getOrganizationId(tenant);
    if (!orgId) {
      toast.error("No organization found");
      return;
    }

    const trimmedName = tenantName.trim();
    if (!trimmedName) {
      toast.error("Organization name is required");
      return;
    }

    setIsSavingOrg(true);
    try {
      await updateOrganizationDetails(supabase, orgId, {
        name: trimmedName,
        phone: phone.trim() || null,
        address: orgAddress.trim() || null,
      });
      await refreshSession();
      toast.success("Organization details saved");
    } catch (error) {
      toast.error("Failed to save organization", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSavingOrg(false);
    }
  };

  const handleCancelSubscription = () => {
    setCancelDialogOpen(true);
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    } catch (error) {
      toast.error("Failed to update password", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleOrgChange = (index: number) => {
    setSelectedOrgIndex(index);
    const org = organizations[index];
    if (!org) return;
    setPhone(org.phone || "");
    setTenantName(org.name || "");
    setOrgAddress(org.address || "");
  };

  if (isLoading) {
    return <PageLoader message="Loading your profile..." />;
  }

  if (!user) return null;

  const selectedOrg = organizations[selectedOrgIndex] ?? organizations[0];
  const currentPlanKey = normalizePlanKey(
    tenant?.entitlements?.plan_key ??
      selectedOrg?.plan ??
      tenant?.tenant.plan ??
      subscription?.plan ??
      "basic",
  );
  const plan = currentPlanKey.replace(/^./, c => c.toUpperCase());
  const organizationId = getOrganizationId(tenant);
  const status = tenant?.status || "Active";
  const subscribedAt = subscription?.current_period_start
    ? dayjs(subscription.current_period_start).format("MMM D, YYYY")
    : "—";
  const expiresAt = subscription?.current_period_end
    ? dayjs(subscription.current_period_end).format("MMM D, YYYY")
    : "—";
  const lastLogin = user.last_sign_in_at
    ? dayjs(user.last_sign_in_at).format("MMM D, YYYY, hh:mm A")
    : "—";
  const memberSince = profile?.created_at
    ? dayjs(profile.created_at).format("MMM D, YYYY")
    : "—";
  const subscriptionCancelling = subscription?.cancel_at_period_end ?? false;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center gap-6">
        <Avatar className="w-20 h-20 border-2 border-border">
          <AvatarImage src={avatarUrl || profile?.avatar_url || ""} />
          <AvatarFallback>
            {getInitials(firstName, lastName) || user.email[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">
            {[firstName, lastName].filter(Boolean).join(" ") || user.email}
          </h1>
          <p className="text-muted-foreground">
            {tenantName || "No organization linked"}
          </p>
          <Button size="sm" className="mt-2" onClick={openAvatarDialog}>
            Change Photo
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 p-1 bg-slate-100/80 dark:bg-zinc-800/80">
          <TabsTrigger value="personal" className={tabTriggerClass}>
            <User className="w-3.5 h-3.5" />
            Personal Details
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="organization" className={tabTriggerClass}>
              <Building2 className="w-3.5 h-3.5" />
              Organization
            </TabsTrigger>
          )}
          <TabsTrigger value="subscription" className={tabTriggerClass}>
            <CreditCard className="w-3.5 h-3.5" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="security" className={tabTriggerClass}>
            <Lock className="w-3.5 h-3.5" />
            Security
          </TabsTrigger>
          <TabsTrigger value="activity" className={tabTriggerClass}>
            <Activity className="w-3.5 h-3.5" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div>
                <Label>Email (read-only)</Label>
                <Input value={user.email} disabled />
              </div>
              <Button
                className="w-full"
                onClick={handleSavePersonalInfo}
                disabled={isSavingPersonal}
              >
                {isSavingPersonal ? "Saving..." : "Save Personal Info"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="organization" className="mt-0 space-y-4">
            {organizations.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Organization / Branch</CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    className="w-full border border-input rounded-md p-2"
                    value={selectedOrgIndex}
                    onChange={(e) => handleOrgChange(Number(e.target.value))}
                  >
                    {organizations.map((org, index) => (
                      <option key={org.id} value={index}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>
            )}

            {tenant && (
              <Card>
                <CardHeader>
                  <CardTitle>Organization Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Organization Name</Label>
                    <Input
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={orgAddress}
                      onChange={(e) => setOrgAddress(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleSaveOrganization}
                    disabled={isSavingOrg}
                  >
                    {isSavingOrg ? "Saving..." : "Save Organization"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        <TabsContent value="subscription" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Plan</dt>
                  <dd className="font-medium">{plan}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Status</dt>
                  <dd className="font-medium">{status}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Subscribed</dt>
                  <dd className="font-medium">{subscribedAt}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Current period ends
                  </dt>
                  <dd className="font-medium">{expiresAt}</dd>
                </div>
              </dl>

              {subscriptionCancelling && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Your subscription is scheduled to cancel at the end of the
                  current billing period.
                </p>
              )}

              {isAdmin && organizationId && (
                <SubscriptionUpgrade
                  organizationId={organizationId}
                  currentPlanKey={currentPlanKey}
                  onUpgraded={refreshSession}
                />
              )}

              {isAdmin && (
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={subscriptionCancelling}
                >
                  {subscriptionCancelling
                    ? "Cancellation Scheduled"
                    : "Cancel Subscription"}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSavingPassword}
                >
                  {isSavingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border text-sm">
                <li className="flex items-center justify-between py-3 first:pt-0">
                  <span className="text-muted-foreground">Last login</span>
                  <span className="font-medium">{lastLogin}</span>
                </li>
                <li className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">{memberSince}</span>
                </li>
                {profile?.role && (
                  <li className="flex items-center justify-between py-3 last:pb-0">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium capitalize">{profile.role}</span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={avatarDialogOpen} onOpenChange={handleAvatarDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a JPEG, PNG, WebP, or GIF up to 5 MB.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24 border-2 border-border">
              <AvatarImage
                src={avatarPreviewUrl || avatarUrl || profile?.avatar_url || ""}
              />
              <AvatarFallback>
                {getInitials(firstName, lastName) || user.email[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarFileChange}
            />

            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isSavingAvatar}
            >
              <Upload className="w-4 h-4" />
              Choose Image
            </Button>

            {avatarFile && (
              <p className="text-sm text-muted-foreground text-center">
                {avatarFile.name}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            {(avatarUrl || profile?.avatar_url) && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemoveAvatar}
                disabled={isSavingAvatar}
              >
                Remove Photo
              </Button>
            )}
            <div className="flex gap-2 sm:ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAvatarDialogChange(false)}
                disabled={isSavingAvatar}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveAvatar}
                disabled={!avatarFile || isSavingAvatar}
              >
                {isSavingAvatar ? "Uploading..." : "Save Photo"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isAdmin && organizationId && user && (
        <CancelSubscriptionDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          organizationId={organizationId}
          userEmail={user.email}
          onCancelled={refreshSession}
        />
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<PageLoader message="Loading your profile..." />}>
      <ProfilePageContent />
    </Suspense>
  );
}
