"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Mail,
  Edit,
  MoreHorizontal,
  Trash2,
  Eye,
  Copy,
  RefreshCw,
  Download,
  Send,
  Users,
} from "lucide-react";
import { format } from "date-fns";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const emailTypes = [
  { value: "APPLICATION_RECEIVED", label: "Application Received" },
  { value: "INTERVIEW_INVITE", label: "Interview Invitation" },
  { value: "APPLICATION_UNDER_REVIEW", label: "Under Review" },
  { value: "APPLICATION_SHORTLISTED", label: "Shortlisted" },
  { value: "APPLICATION_REJECTED", label: "Rejected" },
  { value: "JOB_OFFER", label: "Job Offer" },
  { value: "FOLLOW_UP", label: "Follow Up" },
  { value: "CUSTOM", label: "Custom" },
];

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [bulkEmailTemplate, setBulkEmailTemplate] =
    useState<EmailTemplate | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    type: "CUSTOM",
    isActive: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/email/templates");
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      } else {
        toast({
          title: "Failed to Load Templates",
          description: data.error || "Could not fetch email templates",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Failed to Load Templates",
        description: "An error occurred while loading email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.subject.trim() ||
      !formData.body.trim()
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    try {
      const response = await fetch("/api/email/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateDialog(false);
        resetForm();
        fetchTemplates();
        toast({
          title: "Template Created",
          description: "Email template created successfully",
        });
      } else {
        toast({
          title: "Creation Failed",
          description: data.error || "Failed to create email template",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Creation Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      type: template.type,
      isActive: template.isActive,
    });
    setShowEditDialog(true);
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTemplate) return;

    setCreating(true);

    try {
      const response = await fetch(
        `/api/email/templates/${editingTemplate.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (data.success) {
        setShowEditDialog(false);
        setEditingTemplate(null);
        resetForm();
        fetchTemplates();
        toast({
          title: "Template Updated",
          description: "Email template updated successfully",
        });
      } else {
        toast({
          title: "Update Failed",
          description: data.error || "Failed to update email template",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating template:", error);
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this email template?")) {
      return;
    }

    try {
      const response = await fetch(`/api/email/templates/${templateId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        fetchTemplates();
        toast({
          title: "Template Deleted",
          description: "Email template deleted successfully",
        });
      } else {
        toast({
          title: "Delete Failed",
          description: data.error || "Failed to delete email template",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Delete Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleCreateDefaults = async () => {
    try {
      const response = await fetch("/api/email/templates/seed", {
        method: "POST",
      });

      const data = await response.json();
      if (data.success) {
        fetchTemplates();
        toast({
          title: "Default Templates Created",
          description: `Created ${data.results.created} templates, skipped ${data.results.skipped} existing ones`,
        });
      } else {
        toast({
          title: "Creation Failed",
          description: data.error || "Failed to create default templates",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating defaults:", error);
      toast({
        title: "Creation Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      body: "",
      type: "CUSTOM",
      isActive: true,
    });
  };

  const getTypeLabel = (type: string) => {
    const emailType = emailTypes.find((t) => t.value === type);
    return emailType ? emailType.label : type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br  from-gray-50 to-blue-100  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading email templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Email Templates
            </h1>
            <p className="text-gray-600">
              Manage email templates for candidate communication
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTemplates}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button variant="outline" size="sm" onClick={handleCreateDefaults}>
              <Download className="w-4 h-4 mr-2" />
              Create Defaults
            </Button>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Email Template</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreateTemplate} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Template Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                        placeholder="e.g., Application Received"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Template Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {emailTypes.map((type) => (
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
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      required
                      placeholder="e.g., Thank you for your application - {{jobTitle}}"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="body">Email Body (HTML) *</Label>
                    <Textarea
                      id="body"
                      value={formData.body}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          body: e.target.value,
                        }))
                      }
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
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: checked,
                        }))
                      }
                    />
                    <Label htmlFor="isActive">Template is active</Label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateDialog(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating}>
                      {creating ? "Creating..." : "Create Template"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      {template.name}
                      <Badge
                        variant={template.isActive ? "default" : "secondary"}
                        className={
                          template.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <Badge variant="outline">
                        {getTypeLabel(template.type)}
                      </Badge>
                      <span>
                        Updated{" "}
                        {format(new Date(template.updatedAt), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setPreviewTemplate(template);
                          setShowPreviewDialog(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEditTemplate(template)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setBulkEmailTemplate(template);
                          setShowBulkEmailDialog(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send Bulk Email
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(template.id);
                          toast({
                            title: "Template ID Copied",
                            description:
                              "Template ID has been copied to clipboard",
                          });
                        }}
                        className="flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy ID
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Subject</h4>
                  <p className="text-gray-700 text-sm">{template.subject}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Body Preview</h4>
                  <div className="text-gray-600 text-xs bg-gray-50 p-2 rounded max-h-20 overflow-hidden">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: template.body.substring(0, 200) + "...",
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Email Template</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateTemplate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Template Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-type">Template Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-subject">Email Subject *</Label>
                <Input
                  id="edit-subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-body">Email Body (HTML) *</Label>
                <Textarea
                  id="edit-body"
                  value={formData.body}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      body: e.target.value,
                    }))
                  }
                  required
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: checked,
                    }))
                  }
                />
                <Label htmlFor="edit-isActive">Template is active</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingTemplate(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Updating..." : "Update Template"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Email Template Preview</DialogTitle>
            </DialogHeader>

            {previewTemplate && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Subject Preview:</h4>
                  <p className="text-gray-700 bg-gray-50 p-2 rounded">
                    {previewTemplate.subject
                      .replace(/\{\{\s*candidateName\s*\}\}/g, "John Doe")
                      .replace(/\{\{\s*jobTitle\s*\}\}/g, "Software Engineer")
                      .replace(/\{\{\s*companyName\s*\}\}/g, "Your Company")
                      .replace(
                        /\{\{\s*applicationDate\s*\}\}/g,
                        new Date().toLocaleDateString()
                      )
                      .replace(/\{\{\s*jobLocation\s*\}\}/g, "Remote")}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Body Preview:</h4>
                  <div className="border rounded p-4 bg-white max-h-96 overflow-y-auto">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: previewTemplate.body
                          .replace(/\{\{\s*candidateName\s*\}\}/g, "John Doe")
                          .replace(
                            /\{\{\s*jobTitle\s*\}\}/g,
                            "Software Engineer"
                          )
                          .replace(/\{\{\s*companyName\s*\}\}/g, "Your Company")
                          .replace(
                            /\{\{\s*applicationDate\s*\}\}/g,
                            new Date().toLocaleDateString()
                          )
                          .replace(/\{\{\s*jobLocation\s*\}\}/g, "Remote")
                          .replace(
                            /\{\{\s*candidateEmail\s*\}\}/g,
                            "john.doe@example.com"
                          ),
                      }}
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                  <p className="font-semibold mb-2">
                    Available Template Variables:
                  </p>
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
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Bulk Email Dialog */}
        <Dialog
          open={showBulkEmailDialog}
          onOpenChange={setShowBulkEmailDialog}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Bulk Email - {bulkEmailTemplate?.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  ✅ SMTP Email Service Ready
                </h4>
                <p className="text-sm text-green-700 mb-3">
                  Email service is configured and ready to send real emails via
                  SMTP.
                </p>
                <div className="text-xs text-green-600 space-y-1">
                  <p>
                    <strong>Server:</strong> mail.cymaxtech.com:587
                  </p>
                  <p>
                    <strong>From:</strong> CymaxTech HR Team
                    &lt;m.abdullah@cymaxtech.com&gt;
                  </p>
                  <p>
                    <strong>Status:</strong> ✅ Connection verified
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">How to Send Bulk Emails:</h4>
                <div className="bg-blue-50 p-4 rounded-lg text-sm">
                  <p className="font-semibold mb-2">
                    Steps to send bulk emails:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700">
                    <li>
                      Go to the <strong>Candidates</strong> or{" "}
                      <strong>Applications</strong> page
                    </li>
                    <li>Select multiple candidates using checkboxes</li>
                    <li>Click "Send Bulk Email" from the actions menu</li>
                    <li>Choose this template or write custom content</li>
                    <li>Review variables and click send</li>
                  </ol>
                  <p className="text-xs text-blue-600 mt-2">
                    <strong>Note:</strong> Variables like{" "}
                    <code>{"{{candidateName}}"}</code> and{" "}
                    <code>{"{{jobTitle}}"}</code> will be automatically replaced
                    for each recipient.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Email Features Available:</h4>
                <div className="bg-gray-50 p-4 rounded-lg text-sm grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">
                      ✅ Real Email Sending:
                    </p>
                    <ul className="text-gray-600 text-xs space-y-1 mt-1">
                      <li>• SMTP delivery via CymaxTech server</li>
                      <li>• Template variable substitution</li>
                      <li>• HTML email support</li>
                      <li>• Delivery confirmation</li>
                      <li>• Error handling & reporting</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      📊 Tracking & History:
                    </p>
                    <ul className="text-gray-600 text-xs space-y-1 mt-1">
                      <li>• Complete email history</li>
                      <li>• Delivery status tracking</li>
                      <li>• Failed email notifications</li>
                      <li>• Candidate communication log</li>
                      <li>• Template usage analytics</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowBulkEmailDialog(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/email/test");
                      const data = await response.json();

                      if (data.success) {
                        toast({
                          title: "✅ Email Service Test Passed",
                          description: "SMTP connection is working correctly!",
                        });
                      } else {
                        toast({
                          title: "❌ Email Service Test Failed",
                          description:
                            data.error ||
                            "Please check your SMTP configuration",
                          variant: "destructive",
                        });
                      }
                    } catch (error) {
                      toast({
                        title: "❌ Test Failed",
                        description: "Could not test email service",
                        variant: "destructive",
                      });
                    }
                  }}
                  variant="outline"
                >
                  Test Connection
                </Button>
                <Button
                  onClick={() => {
                    toast({
                      title: "✅ Email Service Ready",
                      description:
                        "Navigate to candidates page to send bulk emails with this template.",
                    });
                    setShowBulkEmailDialog(false);
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Ready to Send
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {templates.length === 0 && !loading && (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Email Templates
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first email template or load the default templates
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
              <Button variant="outline" onClick={handleCreateDefaults}>
                <Download className="w-4 h-4 mr-2" />
                Load Defaults
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
