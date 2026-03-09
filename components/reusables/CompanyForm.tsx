"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Camera,
  Trash2,
  Loader2,
} from "lucide-react";

const ALLOWED_LOGO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_LOGO_BYTES = 5 * 1024 * 1024;

interface CompanyFormData {
  name: string;
  description: string;
  website: string;
  industry: string;
  size: string;
  location: string;
  foundedYear: string;
  email: string;
  phone: string;
  linkedin: string;
  twitter: string;
}

interface CompanyFormProps {
  initialData?: Partial<CompanyFormData & { logo?: string }>;
  companyId?: string;
  onSuccess: (company: any) => void;
  mode?: "create" | "edit";
}

const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Consulting",
  "Media & Entertainment",
  "Real Estate",
  "Transportation",
  "Hospitality",
  "Other",
];

export function CompanyForm({
  initialData,
  companyId,
  onSuccess,
  mode = "create",
}: CompanyFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Logo file state
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const existingLogoUrl = initialData?.logo ?? null;

  const [formData, setFormData] = useState<CompanyFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    website: initialData?.website || "",
    industry: initialData?.industry || "",
    size: initialData?.size || "",
    location: initialData?.location || "",
    foundedYear: initialData?.foundedYear || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    linkedin: initialData?.linkedin || "",
    twitter: initialData?.twitter || "",
  });

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file",
        description: "Please upload a JPEG, PNG, WebP, or GIF.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast({
        title: "File too large",
        description: "Maximum size is 5 MB.",
        variant: "destructive",
      });
      return;
    }

    setLogoFile(file);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleLogoClear = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const uploadLogo = async (id: string) => {
    if (!logoFile) return;
    const fd = new FormData();
    fd.append("logo", logoFile);
    fd.append("companyId", id);
    await fetch("/api/upload/company-logo", {
      method: "POST",
      body: fd,
      credentials: "include",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({
        title: "Error",
        description: "Company name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const url = companyId ? `/api/company/${companyId}` : "/api/company";
      const method = companyId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Upload logo after company is created/updated (needs company ID)
        if (logoFile) {
          await uploadLogo(data.company.id);
        }
        toast({
          title: "Success",
          description: data.message || "Company saved successfully",
        });
        onSuccess(data.company);
      } else {
        throw new Error(data.error || "Failed to save company");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save company",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">
              Company Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Tech Corp Inc."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Company Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Tell us about your company..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) =>
                  setFormData({ ...formData, industry: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="size">Company Size</Label>
              <Select
                value={formData.size}
                onValueChange={(value) =>
                  setFormData({ ...formData, size: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size} employees
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., San Francisco, CA"
              />
            </div>

            <div>
              <Label htmlFor="foundedYear">Founded Year</Label>
              <Input
                id="foundedYear"
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                value={formData.foundedYear}
                onChange={(e) =>
                  setFormData({ ...formData, foundedYear: e.target.value })
                }
                placeholder="e.g., 2020"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact & Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Company Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="contact@company.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+1 (555) 000-0000"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website URL</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://www.company.com"
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="linkedin"
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedin: e.target.value })
                  }
                  placeholder="https://linkedin.com/company/..."
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="twitter">Twitter URL</Label>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="twitter"
                  type="url"
                  value={formData.twitter}
                  onChange={(e) =>
                    setFormData({ ...formData, twitter: e.target.value })
                  }
                  placeholder="https://twitter.com/company"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Company Logo</Label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleLogoSelect}
              aria-label="Upload company logo"
            />
            <div className="mt-1.5 flex items-center gap-4">
              {/* Preview circle */}
              <div className="relative group w-16 h-16 flex-shrink-0">
                <div
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden cursor-pointer hover:border-brand transition-colors"
                  onClick={() => logoInputRef.current?.click()}
                  title="Click to select logo"
                >
                  {logoPreview || existingLogoUrl ? (
                    <img
                      src={logoPreview ?? existingLogoUrl!}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-7 h-7 text-muted-foreground" />
                  )}
                </div>
                {/* Hover camera overlay */}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Right-side actions */}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-xs h-8"
                >
                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                  {logoPreview || existingLogoUrl
                    ? "Change Logo"
                    : "Upload Logo"}
                </Button>
                {(logoPreview || existingLogoUrl) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleLogoClear}
                    className="text-xs h-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Remove
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP or GIF · max 5 MB
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          className="bg-brand hover:bg-brand/90 text-white min-w-[160px]"
          size="lg"
        >
          {loading
            ? mode === "create"
              ? "Creating..."
              : "Updating..."
            : mode === "create"
              ? "Create Company"
              : "Update Company"}
        </Button>
      </div>
    </form>
  );
}
