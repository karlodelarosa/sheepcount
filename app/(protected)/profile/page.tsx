"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTenant } from "@/app/providers/tenant-provider";
import { getInitials } from "@/app/helpers";
import dayjs from "dayjs";

export function ProfilePage() {
  const { user, tenant } = useTenant();

  if (!tenant) return <div>Loading...</div>;

  const { profile, organizations, subscription } = tenant;

  // Track selected organization
  const [selectedOrgIndex, setSelectedOrgIndex] = useState(0);
  const selectedOrg = organizations[selectedOrgIndex];

  // Local state for editable fields (UI-only)
  const [firstName, setFirstName] = useState(profile.first_name);
  const [lastName, setLastName] = useState(profile.last_name);
  const [phone, setPhone] = useState(selectedOrg.phone || "");
  const [tenantName, setTenantName] = useState(selectedOrg.name || "");
  const [orgAddress, setOrgAddress] = useState(selectedOrg.address || "");

  // Subscription info
  const plan = selectedOrg.plan || "Standard";
  const status = tenant.status || "Active";
  const subscribedAt = dayjs(subscription?.current_period_start).format("MMM D, YYYY");
  const expiresAt = dayjs(subscription?.current_period_end).format("MMM D, YYYY");

  // Activity info
  const lastLogin = dayjs(user.last_sign_in_at).format("MMM D, YYYY, hh:mm A");
  const memberSince = dayjs(profile.created_at).format("MMM D, YYYY");

  // Handle organization selection
  const handleOrgChange = (index: number) => {
    setSelectedOrgIndex(index);
    const org = organizations[index];
    setPhone(org.phone || "");
    setTenantName(org.name || "");
    setOrgAddress(org.address || "");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center gap-6">
        <Avatar className="w-20 h-20 border-2 border-border">
          <AvatarImage src={profile.avatar_url || ""} />
          <AvatarFallback>{getInitials(firstName, lastName)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">
            {firstName} {lastName}
          </h1>
          <p className="text-muted-foreground">{tenantName}</p>
          <Button size="sm" className="mt-2">Change Avatar</Button>
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>First Name</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
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

      {/* Organization Selection */}
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

      {/* Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Organization Name</Label>
            <Input value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>Address</Label>
            <Input value={orgAddress} onChange={(e) => setOrgAddress(e.target.value)} />
          </div>
        </CardContent>
        <CardContent className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Plan: <strong>{plan}</strong> • Status: <strong>{status}</strong> • Subscribed: <strong>{subscribedAt}</strong> • Expires: <strong>{expiresAt}</strong>
          </div>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm">Cancel Subscription</Button>
            <Button size="sm">Save Organization</Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Information */}
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
