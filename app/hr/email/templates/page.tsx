"use client";

import React from "react";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";
import { LoadingState } from "@/components/reusables";
import {
  EmailTemplatesHeader,
  EmailTemplateCard,
  EmailTemplateDialog,
  EmailTemplatePreviewDialog,
  BulkEmailInfoDialog,
  EmptyEmailTemplatesState,
} from "@/components/email";

export default function EmailTemplatesPage() {
  const {
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
    // API actions
    fetchTemplates,
    testEmailConnection,
  } = useEmailTemplates();

  if (loading) {
    return <LoadingState variant="page" message="Loading email templates..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <EmailTemplatesHeader
        totalTemplates={templates.length}
        loading={loading}
        onRefresh={fetchTemplates}
        onCreateNew={() => setShowCreateDialog(true)}
        onCreateDefaults={handleCreateDefaults}
      />

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {templates.map((template) => (
            <EmailTemplateCard
              key={template.id}
              template={template}
              onEdit={handleEditTemplate}
              onPreview={handlePreviewTemplate}
              onDuplicate={handleDuplicateTemplate}
              onToggleActive={handleToggleActive}
              onDelete={handleDeleteTemplate}
              onBulkEmailInfo={handleBulkEmailInfo}
            />
          ))}
        </div>
      ) : (
        <EmptyEmailTemplatesState
          onCreateNew={() => setShowCreateDialog(true)}
          onCreateDefaults={handleCreateDefaults}
        />
      )}

      {/* Create Template Dialog */}
      <EmailTemplateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        mode="create"
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleCreateTemplate}
        isSubmitting={creating}
        onCancel={() => {
          setShowCreateDialog(false);
          resetForm();
        }}
      />

      {/* Edit Template Dialog */}
      <EmailTemplateDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        mode="edit"
        template={editingTemplate}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleUpdateTemplate}
        isSubmitting={creating}
        onCancel={() => {
          setShowEditDialog(false);
          resetForm();
        }}
      />

      {/* Preview Template Dialog */}
      <EmailTemplatePreviewDialog
        template={previewTemplate}
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
      />

      {/* Bulk Email Info Dialog */}
      <BulkEmailInfoDialog
        template={bulkEmailTemplate}
        open={showBulkEmailDialog}
        onOpenChange={setShowBulkEmailDialog}
        onTestConnection={testEmailConnection}
      />
    </div>
  );
}
