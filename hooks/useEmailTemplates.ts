import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplateFormData {
  name: string;
  subject: string;
  body: string;
  type: string;
  isActive: boolean;
}

export const EMAIL_TYPES = [
  { value: "APPLICATION_RECEIVED", label: "Application Received" },
  { value: "INTERVIEW_INVITE", label: "Interview Invitation" },
  { value: "APPLICATION_UNDER_REVIEW", label: "Under Review" },
  { value: "APPLICATION_SHORTLISTED", label: "Shortlisted" },
  { value: "APPLICATION_REJECTED", label: "Rejected" },
  { value: "JOB_OFFER", label: "Job Offer" },
  { value: "FOLLOW_UP", label: "Follow Up" },
  { value: "CUSTOM", label: "Custom" },
];

/**
 * Custom hook for managing email templates
 * Handles CRUD operations and state management
 */
export function useEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false);

  // Current items
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [bulkEmailTemplate, setBulkEmailTemplate] = useState<EmailTemplate | null>(
    null
  );

  // Form management
  const { formData, setFormData, resetForm, updateField } =
    useEmailTemplateForm();

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/email/templates");
      const data = await response.json();

      if (data.success) {
        setTemplates(data.templates);
        toast({
          title: "Templates Loaded",
          description: `Found ${data.templates.length} email templates`,
        });
      } else {
        throw new Error(data.error || "Failed to fetch templates");
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Failed to Load Templates",
        description: "Could not fetch email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createTemplate = useCallback(
    async (templateData: EmailTemplateFormData) => {
      try {
        setCreating(true);
        const response = await fetch("/api/email/templates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(templateData),
        });

        const data = await response.json();

        if (data.success) {
          setTemplates((prev) => [data.template, ...prev]);
          toast({
            title: "Template Created",
            description: `${templateData.name} has been created successfully`,
          });
          return data.template;
        } else {
          throw new Error(data.error || "Failed to create template");
        }
      } catch (error) {
        console.error("Error creating template:", error);
        toast({
          title: "Failed to Create Template",
          description: "Could not create the email template",
          variant: "destructive",
        });
        throw error;
      } finally {
        setCreating(false);
      }
    },
    [toast]
  );

  const updateTemplate = useCallback(
    async (templateId: string, templateData: EmailTemplateFormData) => {
      try {
        setCreating(true);
        const response = await fetch(`/api/email/templates/${templateId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(templateData),
        });

        const data = await response.json();

        if (data.success) {
          setTemplates((prev) =>
            prev.map((template) =>
              template.id === templateId ? data.template : template
            )
          );
          toast({
            title: "Template Updated",
            description: `${templateData.name} has been updated successfully`,
          });
          return data.template;
        } else {
          throw new Error(data.error || "Failed to update template");
        }
      } catch (error) {
        console.error("Error updating template:", error);
        toast({
          title: "Failed to Update Template",
          description: "Could not update the email template",
          variant: "destructive",
        });
        throw error;
      } finally {
        setCreating(false);
      }
    },
    [toast]
  );

  const deleteTemplate = useCallback(
    async (templateId: string) => {
      try {
        const response = await fetch(`/api/email/templates/${templateId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          setTemplates((prev) => prev.filter((t) => t.id !== templateId));
          toast({
            title: "Template Deleted",
            description: "Email template has been deleted successfully",
          });
        } else {
          throw new Error(data.error || "Failed to delete template");
        }
      } catch (error) {
        console.error("Error deleting template:", error);
        toast({
          title: "Failed to Delete Template",
          description: "Could not delete the email template",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const createDefaultTemplates = useCallback(async () => {
    try {
      setCreating(true);
      const response = await fetch("/api/email/templates/seed", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        await fetchTemplates(); // Refresh the list
        toast({
          title: "Default Templates Created",
          description: `Created ${data.count} default templates`,
        });
      } else {
        throw new Error(data.error || "Failed to create default templates");
      }
    } catch (error) {
      console.error("Error creating default templates:", error);
      toast({
        title: "Failed to Create Defaults",
        description: "Could not create default email templates",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  }, [toast, fetchTemplates]);

  const testEmailConnection = useCallback(async () => {
    try {
      const response = await fetch("/api/email/test");
      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Email Service Test Passed",
          description: "SMTP connection is working correctly!",
        });
        return true;
      } else {
        toast({
          title: "❌ Email Service Test Failed",
          description: data.error || "Please check your SMTP configuration",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Could not test email service",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Action handlers
  const handleCreateTemplate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await createTemplate(formData);
      setShowCreateDialog(false);
      resetForm();
    },
    [createTemplate, formData, resetForm]
  );

  const handleUpdateTemplate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingTemplate) return;
      await updateTemplate(editingTemplate.id, formData);
      setShowEditDialog(false);
      setEditingTemplate(null);
      resetForm();
    },
    [updateTemplate, formData, resetForm, editingTemplate]
  );

  const handleEditTemplate = useCallback(
    (template: EmailTemplate) => {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        subject: template.subject,
        body: template.body,
        type: template.type,
        isActive: template.isActive,
      });
      setShowEditDialog(true);
    },
    [setFormData]
  );

  const handleDeleteTemplate = useCallback(
    async (templateId: string) => {
      if (confirm("Are you sure you want to delete this email template?")) {
        await deleteTemplate(templateId);
      }
    },
    [deleteTemplate]
  );

  const handleDuplicateTemplate = useCallback(
    (template: EmailTemplate) => {
      setFormData({
        name: `${template.name} (Copy)`,
        subject: template.subject,
        body: template.body,
        type: template.type,
        isActive: template.isActive,
      });
      setShowCreateDialog(true);
    },
    [setFormData]
  );

  const handleToggleActive = useCallback(
    async (template: EmailTemplate) => {
      await updateTemplate(template.id, {
        ...template,
        isActive: !template.isActive,
      });
    },
    [updateTemplate]
  );

  const handlePreviewTemplate = useCallback((template: EmailTemplate) => {
    setPreviewTemplate(template);
    setShowPreviewDialog(true);
  }, []);

  const handleBulkEmailInfo = useCallback((template: EmailTemplate) => {
    setBulkEmailTemplate(template);
    setShowBulkEmailDialog(true);
  }, []);

  const handleCreateDefaults = useCallback(async () => {
    await createDefaultTemplates();
  }, [createDefaultTemplates]);

  return {
    // State
    templates,
    loading,
    creating,
    // Dialog states
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    setShowEditDialog,
    showPreviewDialog,
    setShowPreviewDialog,
    showBulkEmailDialog,
    setShowBulkEmailDialog,
    // Current items
    editingTemplate,
    previewTemplate,
    bulkEmailTemplate,
    // Actions
    handleCreateTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    handleDuplicateTemplate,
    handleToggleActive,
    handlePreviewTemplate,
    handleBulkEmailInfo,
    handleCreateDefaults,
    handleEditTemplate,
    // Form management
    formData,
    setFormData,
    resetForm,
    updateField,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createDefaultTemplates,
    testEmailConnection,
  };
}

/**
 * Hook for managing email template form state
 */
export function useEmailTemplateForm(
  initialData?: Partial<EmailTemplateFormData>
) {
  const [formData, setFormDataState] = useState<EmailTemplateFormData>({
    name: "",
    subject: "",
    body: "",
    type: "CUSTOM",
    isActive: true,
    ...initialData,
  });

  const updateField = useCallback(
    (field: keyof EmailTemplateFormData, value: string | boolean) => {
      setFormDataState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormDataState({
      name: "",
      subject: "",
      body: "",
      type: "CUSTOM",
      isActive: true,
      ...initialData,
    });
  }, [initialData]);

  const setFormData = useCallback((data: Partial<EmailTemplateFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
  }, []);

  return {
    formData,
    updateField,
    resetForm,
    setFormData,
  };
}

/**
 * Utility function to get email type label
 */
export function getEmailTypeLabel(type: string): string {
  const emailType = EMAIL_TYPES.find((t) => t.value === type);
  return emailType ? emailType.label : type;
}
