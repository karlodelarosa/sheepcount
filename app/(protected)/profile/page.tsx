"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { PageSkeleton } from "@/components/page-skeleton";
import { DirectoryTitleCard } from "@/components/ui/directory-page-header";
import { Badge } from "@/components/ui/badge";
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

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, tenant, isLoading, refreshSession } = useTenant();
  const supabase = useMemo(() => createClient(), []);

  const organizations = useMemo(
    () => tenant?.organizations ?? tenant?.tenant.organizations ?? [],
    [tenant?.organizations, tenant?.tenant.organizations],
  );
  const profile = tenant?.profile;
  const subscription = tenant?.subscription;
  const isAdmin = profile?.role === "admin";
  const activeTab = parseTab(searchParams.get("tab"), isAdmin);

  const setActiveTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`/profile?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

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
  }, [isAdmin, activeTab, setActiveTab]);

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

  const handleAvatarFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
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
    return <PageSkeleton message="Loading your profile..." />;
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
    <div className="space-y-4">
      <DirectoryTitleCard
        title="Profile"
        description="Manage your personal details, organization, and account preferences"
        icon={User}
        secondaryAction={{
          label: "Change Photo",
          icon: Upload,
          onClick: openAvatarDialog,
        }}
      />
      <section
        aria-label="Account overview"
        className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm"
      >
        <Avatar className="size-12 shrink-0 border border-[var(--accent-color-border)]">
          <AvatarImage
            src={avatarUrl || profile?.avatar_url || ""}
            alt="Profile photo"
          />
          <AvatarFallback className="bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
            {getInitials(firstName, lastName) || user.email[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-base font-semibold">
            {[firstName, lastName].filter(Boolean).join(" ") || user.email}
          </h2>
          <p className="break-words text-sm text-muted-foreground">
            {tenantName || "No organization linked"}
          </p>
        </div>
        {profile?.role && (
          <Badge
            variant="secondary"
            className="shrink-0 capitalize bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]"
          >
            {profile.role}
          </Badge>
        )}
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
        <TabsList>
          <TabsTrigger value="personal">
            <User className="w-3.5 h-3.5" />
            Personal Details
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="organization">
              <Building2 className="w-3.5 h-3.5" />
              Organization
            </TabsTrigger>
          )}
          <TabsTrigger value="subscription">
            <CreditCard className="w-3.5 h-3.5" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-3.5 h-3.5" />
            Security
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="w-3.5 h-3.5" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-0">
          <Card className="gap-4 border-border/70 shadow-sm">
            <CardHeader className="px-4 pt-4 sm:px-5 sm:pt-5">
              <CardTitle className="text-base font-semibold">
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-first-name">First Name</Label>
                  <Input
                    id="profile-first-name"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-last-name">Last Name</Label>
                  <Input
                    id="profile-last-name"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="profile-email">Email (read-only)</Label>
                  <Input
                    id="profile-email"
                    value={user.email}
                    readOnly
                    aria-readonly="true"
                    className="bg-muted/40"
                  />
                </div>
              </div>
              <div className="flex justify-end border-t border-border/60 pt-4">
                <Button
                  className="w-full sm:w-auto rounded-xl bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)] hover:text-[var(--accent-color-foreground)]"
                  onClick={handleSavePersonalInfo}
                  disabled={isSavingPersonal}
                >
                  {isSavingPersonal ? "Saving..." : "Save Personal Info"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="organization" className="mt-0 space-y-4">
            {organizations.length > 1 && (
              <Card className="gap-4 border-border/70 shadow-sm">
                <CardHeader className="px-4 pt-4 sm:px-5 sm:pt-5">
                  <CardTitle className="text-base font-semibold">
                    Select Organization / Branch
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-5">
                  <select
                    aria-label="Select organization or branch"
                    className="h-11 lg:h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]"
                    value={selectedOrgIndex}
                    onChange={e => handleOrgChange(Number(e.target.value))}
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
              <Card className="gap-4 border-border/70 shadow-sm">
                <CardHeader className="px-4 pt-4 sm:px-5 sm:pt-5">
                  <CardTitle className="text-base font-semibold">
                    Organization Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="profile-organization-name">
                        Organization Name
                      </Label>
                      <Input
                        id="profile-organization-name"
                        value={tenantName}
                        onChange={e => setTenantName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="profile-phone">Phone</Label>
                      <Input
                        id="profile-phone"
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="profile-address">Address</Label>
                      <Input
                        id="profile-address"
                        value={orgAddress}
                        onChange={e => setOrgAddress(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end border-t border-border/60 pt-4">
                    <Button
                      className="w-full sm:w-auto rounded-xl bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)] hover:text-[var(--accent-color-foreground)]"
                      onClick={handleSaveOrganization}
                      disabled={isSavingOrg}
                    >
                      {isSavingOrg ? "Saving..." : "Save Organization"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        <TabsContent value="subscription" className="mt-0">
          <Card className="gap-4 border-border/70 shadow-sm">
            <CardHeader className="px-4 pt-4 sm:px-5 sm:pt-5">
              <CardTitle className="text-base font-semibold">
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-5">
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
          <Card className="gap-4 border-border/70 shadow-sm">
            <CardHeader className="px-4 pt-4 sm:px-5 sm:pt-5">
              <CardTitle className="text-base font-semibold">
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5">
              <form
                onSubmit={handleChangePassword}
                className="grid gap-4 sm:grid-cols-2"
              >
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
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
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    required
                  />
                </div>
                <div className="flex justify-end border-t border-border/60 pt-4 sm:col-span-2">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto rounded-xl bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)] hover:text-[var(--accent-color-foreground)]"
                    disabled={isSavingPassword}
                  >
                    {isSavingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <Card className="gap-4 border-border/70 shadow-sm">
            <CardHeader className="px-4 pt-4 sm:px-5 sm:pt-5">
              <CardTitle className="text-base font-semibold">
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5">
              <ul className="divide-y divide-border text-sm">
                <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 first:pt-0">
                  <span className="text-muted-foreground">Last login</span>
                  <span className="font-medium">{lastLogin}</span>
                </li>
                <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">{memberSince}</span>
                </li>
                {profile?.role && (
                  <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 last:pb-0">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium capitalize">
                      {profile.role}
                    </span>
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
            <Avatar className="size-20 border border-[var(--accent-color-border)]">
              <AvatarImage
                src={avatarPreviewUrl || avatarUrl || profile?.avatar_url || ""}
                alt="Profile photo preview"
              />
              <AvatarFallback className="bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
                {getInitials(firstName, lastName) ||
                  user.email[0]?.toUpperCase()}
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
                className="bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)] hover:text-[var(--accent-color-foreground)]"
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
    <Suspense fallback={<PageSkeleton message="Loading your profile..." />}>
      <ProfilePageContent />
    </Suspense>
  );
}
