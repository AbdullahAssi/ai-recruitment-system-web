import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  EmailTemplate,
  EmailTemplateFormData,
  EMAIL_TYPES,
} from "../../hooks/useEmailTemplates";

interface EmailTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  template?: EmailTemplate | null;
  formData: EmailTemplateFormData;
  onFormChange: (data: Partial<EmailTemplateFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function EmailTemplateDialog({
  open,
  onOpenChange,
  mode,
  template,
  formData,
  onFormChange,
  onSubmit,
  onCancel,
  isSubmitting,
}: EmailTemplateDialogProps) {
  const title =
    mode === "create" ? "Create Email Template" : "Edit Email Template";
  const submitText = mode === "create" ? "Create Template" : "Update Template";
  const loadingText = mode === "create" ? "Creating..." : "Updating...";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormChange({ name: e.target.value })}
                required
                placeholder="e.g., Application Received"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Template Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => onFormChange({ type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMAIL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => onFormChange({ subject: e.target.value })}
              required
              placeholder="e.g., Thank you for your application - {{jobTitle}}"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Email Body (HTML) *</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => onFormChange({ body: e.target.value })}
              required
              placeholder="Enter HTML email template. Use variables like {{candidateName}}, {{jobTitle}}, {{companyName}}"
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => onFormChange({ isActive: checked })}
            />
            <Label htmlFor="isActive">Template is active</Label>
          </div>

          {/* Template Variables Helper */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">
              Available Template Variables:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <code className="bg-gray-200 px-1 rounded">
                  {"{{candidateName}}"}
                </code>{" "}
                - Candidate's full name
              </div>
              <div>
                <code className="bg-gray-200 px-1 rounded">
                  {"{{candidateEmail}}"}
                </code>{" "}
                - Candidate's email
              </div>
              <div>
                <code className="bg-gray-200 px-1 rounded">
                  {"{{jobTitle}}"}
                </code>{" "}
                - Job position title
              </div>
              <div>
                <code className="bg-gray-200 px-1 rounded">
                  {"{{jobLocation}}"}
                </code>{" "}
                - Job location
              </div>
              <div>
                <code className="bg-gray-200 px-1 rounded">
                  {"{{companyName}}"}
                </code>{" "}
                - Company name
              </div>
              <div>
                <code className="bg-gray-200 px-1 rounded">
                  {"{{applicationDate}}"}
                </code>{" "}
                - Application date
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? loadingText : submitText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
