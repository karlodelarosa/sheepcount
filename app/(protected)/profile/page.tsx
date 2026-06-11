"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTenant } from "@/app/providers/tenant-provider";
import { PageLoader } from "@/components/page-loader";
import { getInitials } from "@/app/helpers";
import dayjs from "dayjs";

export function ProfilePage() {
  const { user, tenant, isLoading } = useTenant();

  const organizations = tenant?.organizations ?? tenant?.tenant.organizations ?? [];
  const profile = tenant?.profile;
  const subscription = tenant?.subscription;

  const [selectedOrgIndex, setSelectedOrgIndex] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [orgAddress, setOrgAddress] = useState("");

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
    } else if (user) {
      setFirstName(user.email.split("@")[0] ?? "");
      setLastName("");
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

  const handleOrgChange = (index: number) => {
    setSelectedOrgIndex(index);
    const org = organizations[index];
    if (!org) return;
    setPhone(org.phone || "");
    setTenantName(org.name || "");
    setOrgAddress(org.address || "");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center gap-6">
        <Avatar className="w-20 h-20 border-2 border-border">
          <AvatarImage src={profile?.avatar_url || ""} />
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
          <Button size="sm" className="mt-2">
            Change Avatar
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
          <Button className="w-full">Save Personal Info</Button>
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
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
              />
            </div>
          </CardContent>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div className="text-sm text-muted-foreground">
              Plan: <strong>{plan}</strong> • Status: <strong>{status}</strong>{" "}
              • Subscribed: <strong>{subscribedAt}</strong> • Expires:{" "}
              <strong>{expiresAt}</strong>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm">
                Cancel Subscription
              </Button>
              <Button size="sm">Save Organization</Button>
            </div>
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
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage;
