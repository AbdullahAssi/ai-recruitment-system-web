import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { JobFormData } from '../../hooks/useJobs';

interface JobFormProps {
  formData: JobFormData;
  isEditing?: boolean;
  loading?: boolean;
  onFormDataChange: (data: Partial<JobFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function JobForm({ 
  formData, 
  isEditing = false, 
  loading = false,
  onFormDataChange, 
  onSubmit, 
  onCancel 
}: JobFormProps) {
  const handleFieldChange = (field: keyof JobFormData, value: string) => {
    onFormDataChange({ [field]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${isEditing ? 'edit-' : ''}title`}>Job Title *</Label>
        <Input
          id={`${isEditing ? 'edit-' : ''}title`}
          value={formData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          required
          placeholder="e.g., Senior React Developer"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${isEditing ? 'edit-' : ''}location`}>Location</Label>
        <Input
          id={`${isEditing ? 'edit-' : ''}location`}
          value={formData.location}
          onChange={(e) => handleFieldChange('location', e.target.value)}
          placeholder="e.g., Remote, New York, NY"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${isEditing ? 'edit-' : ''}description`}>Job Description *</Label>
        <Textarea
          id={`${isEditing ? 'edit-' : ''}description`}
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          required
          placeholder="Describe the role, responsibilities, and company culture..."
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${isEditing ? 'edit-' : ''}requirements`}>
          Requirements & Qualifications
        </Label>
        <Textarea
          id={`${isEditing ? 'edit-' : ''}requirements`}
          value={formData.requirements}
          onChange={(e) => handleFieldChange('requirements', e.target.value)}
          placeholder="List specific requirements, skills, experience, education, etc..."
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading 
            ? (isEditing ? "Updating..." : "Creating...") 
            : (isEditing ? "Update Job" : "Post Job")
          }
        </Button>
      </div>
    </form>
  );
}
