import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FaSave, FaTimes } from "react-icons/fa";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    name: string;
    phone: string;
    location: string;
    bio: string;
    experience: number;
    linkedinUrl: string;
    githubUrl: string;
    portfolioUrl: string;
  };
  onFormDataChange: (data: Partial<EditProfileDialogProps["formData"]>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  loading,
}: EditProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal information and professional details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormDataChange({ name: e.target.value })}
                required
                aria-required="true"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => onFormDataChange({ phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => onFormDataChange({ location: e.target.value })}
                placeholder="City, Country"
              />
            </div>
            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) =>
                  onFormDataChange({
                    experience: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={(e) => onFormDataChange({ bio: e.target.value })}
              placeholder="Tell us about yourself, your skills, and experience..."
            />
          </div>

          <div className="space-y-3">
            <Label>Professional Links</Label>
            <div>
              <Input
                placeholder="LinkedIn URL (e.g., https://linkedin.com/in/yourprofile)"
                value={formData.linkedinUrl}
                onChange={(e) =>
                  onFormDataChange({ linkedinUrl: e.target.value })
                }
              />
            </div>
            <div>
              <Input
                placeholder="GitHub URL (e.g., https://github.com/yourusername)"
                value={formData.githubUrl}
                onChange={(e) =>
                  onFormDataChange({ githubUrl: e.target.value })
                }
              />
            </div>
            <div>
              <Input
                placeholder="Portfolio URL (e.g., https://yourportfolio.com)"
                value={formData.portfolioUrl}
                onChange={(e) =>
                  onFormDataChange({ portfolioUrl: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <FaSave className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              <FaTimes className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
