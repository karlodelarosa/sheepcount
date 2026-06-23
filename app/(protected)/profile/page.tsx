"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { useTenant } from "@/app/providers/tenant-provider";
import { PageLoader } from "@/components/page-loader";
import { getInitials } from "@/app/helpers";
import { createClient } from "@/lib/supabase/client";
import { getOrganizationId } from "@/lib/supabase/tenant";
import {
  cancelOrganizationSubscription,
  removeUserAvatar,
  updateOrganizationDetails,
  updateUserProfile,
  uploadUserAvatar,
  validateAvatarFile,
} from "@/lib/supabase/profile";
import dayjs from "dayjs";
import { toast } from "sonner";
import { Upload } from "lucide-react";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export default function ProfilePage() {
  const { user, tenant, isLoading, refreshSession } = useTenant();
  const supabase = useMemo(() => createClient(), []);

  const organizations = tenant?.organizations ?? tenant?.tenant.organizations ?? [];
  const profile = tenant?.profile;
  const subscription = tenant?.subscription;
  const isAdmin = profile?.role === "admin";

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
  const [isCancellingSubscription, setIsCancellingSubscription] =
    useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarPreviewRef = useRef<string | null>(null);

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

  const handleCancelSubscription = async () => {
    const orgId = getOrganizationId(tenant);
    if (!orgId) {
      toast.error("No organization found");
      return;
    }

    if (
      !window.confirm(
        "Cancel your subscription at the end of the current billing period?",
      )
    ) {
      return;
    }

    setIsCancellingSubscription(true);
    try {
      await cancelOrganizationSubscription(supabase, orgId);
      await refreshSession();
      toast.success("Subscription will cancel at period end");
    } catch (error) {
      toast.error("Failed to cancel subscription", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsCancellingSubscription(false);
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
  const plan = selectedOrg?.plan || tenant?.tenant.plan || "Standard";
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
          <Button
            size="sm"
            className="mt-2"
            onClick={openAvatarDialog}
          >
            Change Photo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
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
        </CardContent>
        <CardContent>
          <Button
            className="w-full"
            onClick={handleSavePersonalInfo}
            disabled={isSavingPersonal}
          >
            {isSavingPersonal ? "Saving..." : "Save Personal Info"}
          </Button>
        </CardContent>
      </Card>

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
            {!isAdmin && (
              <p className="text-sm text-muted-foreground">
                Only organization admins can edit these details.
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Organization Name</Label>
              <Input
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                disabled={!isAdmin}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isAdmin}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
                disabled={!isAdmin}
              />
            </div>
          </CardContent>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div className="text-sm text-muted-foreground">
              Plan: <strong>{plan}</strong> • Status: <strong>{status}</strong>{" "}
              • Subscribed: <strong>{subscribedAt}</strong> • Expires:{" "}
              <strong>{expiresAt}</strong>
              {subscriptionCancelling && (
                <>
                  {" "}
                  • <strong className="text-amber-600">Cancels at period end</strong>
                </>
              )}
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancelSubscription}
                  disabled={
                    isCancellingSubscription || subscriptionCancelling
                  }
                >
                  {subscriptionCancelling
                    ? "Cancellation Scheduled"
                    : isCancellingSubscription
                      ? "Cancelling..."
                      : "Cancel Subscription"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveOrganization}
                  disabled={isSavingOrg}
                >
                  {isSavingOrg ? "Saving..." : "Save Organization"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>Last login: {lastLogin}</p>
          <p>Member since: {memberSince}</p>
          {profile?.role && (
            <p>
              Role: <span className="capitalize">{profile.role}</span>
            </p>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}