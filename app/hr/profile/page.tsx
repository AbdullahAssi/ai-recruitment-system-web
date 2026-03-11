"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/reusables";
import { AvatarUpload } from "@/components/reusables/AvatarUpload";
import {
  User,
  Briefcase,
  Mail,
  Phone,
  Building2,
  Pencil,
  Save,
  X,
  ArrowLeft,
} from "lucide-react";

interface HRProfileData {
  id: string;
  department: string | null;
  position: string | null;
  company: {
    id: string;
    name: string;
    logo: string | null;
  } | null;
}

export default function HRProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [hrProfile, setHRProfile] = useState<HRProfileData | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    if (user?.id) fetchProfile();
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/hr/profile/${user!.id}`);
      const data = await res.json();
      if (data.success && data.profile) {
        setHRProfile(data.profile);
        setPosition(data.profile.position || "");
        setDepartment(data.profile.department || "");
      }
    } catch {
      toast({ title: "Failed to load profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Name cannot be empty", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const meRes = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
        credentials: "include",
      });
      if (!meRes.ok) {
        const d = await meRes.json();
        throw new Error(d.error || "Failed to update personal info");
      }

      const hrRes = await fetch(`/api/hr/profile/${user!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position: position.trim() || null,
          department: department.trim() || null,
        }),
        credentials: "include",
      });
      if (!hrRes.ok) {
        const d = await hrRes.json();
        throw new Error(d.error || "Failed to update HR info");
      }
      const hrData = await hrRes.json();
      setHRProfile((prev) =>
        prev
          ? { ...prev, position: hrData.profile.position, department: hrData.profile.department }
          : prev,
      );

      await refreshUser();
      setEditing(false);
      toast({ title: "Profile updated successfully" });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setPosition(hrProfile?.position || "");
    setDepartment(hrProfile?.department || "");
    setEditing(false);
  };

  if (loading) return <LoadingState variant="page" message="Loading profile..." />;

  const initials = (user?.name || "HR")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  // ─── EDIT MODE ────────────────────────────────────────────────────────────

  if (editing) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelEdit}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Update your personal and role information
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Avatar column */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center gap-4">
              <AvatarUpload
                currentUrl={user?.avatarUrl}
                initials={initials}
                sizeClass="w-24 h-24"
                onUploadSuccess={async () => { await refreshUser(); }}
                onDeleteSuccess={async () => { await refreshUser(); }}
              />
              <div className="text-center text-xs text-muted-foreground space-y-0.5">
                <p className="font-medium text-foreground text-sm">Profile Picture</p>
                <p>JPEG · PNG · WebP · GIF</p>
                <p>256 × 256 px · max 5 MB</p>
              </div>
            </div>
          </div>

          {/* Fields column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Personal Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    className="focus-visible:ring-primary"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Email
                </Label>
                <Input value={user?.email || ""} disabled className="bg-muted text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
            </div>

            {/* HR Role */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Role & Department
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="position" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Position / Title
                  </Label>
                  <Input
                    id="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g. Senior HR Manager"
                    className="focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="department" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Department
                  </Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Human Resources"
                    className="focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={saving}>
                <X className="w-4 h-4 mr-1.5" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Save className="w-4 h-4 mr-1.5" />
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── VIEW MODE ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your personal info and role details
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setEditing(true)}
          className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Pencil className="w-3.5 h-3.5 mr-1.5" />
          Edit Profile
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column — avatar card */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-primary to-blue-400" />
            <div className="px-5 pb-5">
              <div className="-mt-8 mb-3">
                <AvatarUpload
                  currentUrl={user?.avatarUrl}
                  initials={initials}
                  sizeClass="w-16 h-16"
                  onUploadSuccess={async () => { await refreshUser(); }}
                  onDeleteSuccess={async () => { await refreshUser(); }}
                />
              </div>
              <h2 className="text-base font-semibold text-foreground">{user?.name}</h2>
              {(hrProfile?.position || hrProfile?.department) && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {[hrProfile.position, hrProfile.department].filter(Boolean).join(" · ")}
                </p>
              )}
              {hrProfile?.company && (
                <div className="flex items-center gap-1.5 mt-2">
                  {hrProfile.company.logo ? (
                    <img
                      src={hrProfile.company.logo}
                      alt={hrProfile.company.name}
                      className="w-4 h-4 rounded object-contain"
                    />
                  ) : (
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground">{hrProfile.company.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column — detail cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Personal Information</h3>
            <div className="space-y-3">
              <InfoRow icon={<User className="w-4 h-4 text-primary" />} label="Full Name" value={user?.name} />
              <InfoRow icon={<Mail className="w-4 h-4 text-primary" />} label="Email" value={user?.email} />
              <InfoRow icon={<Phone className="w-4 h-4 text-primary" />} label="Phone" value={user?.phone || "—"} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Role & Department</h3>
            <div className="space-y-3">
              <InfoRow icon={<Briefcase className="w-4 h-4 text-primary" />} label="Position" value={hrProfile?.position || "—"} />
              <InfoRow icon={<Briefcase className="w-4 h-4 text-primary" />} label="Department" value={hrProfile?.department || "—"} />
              {hrProfile?.company && (
                <InfoRow icon={<Building2 className="w-4 h-4 text-primary" />} label="Company" value={hrProfile.company.name} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value || "—"}</p>
      </div>
    </div>
  );
}
