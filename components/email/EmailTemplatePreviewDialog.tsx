import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmailTemplate } from "../../hooks/useEmailTemplates";

interface EmailTemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: EmailTemplate | null;
}

const TEMPLATE_VARIABLES = {
  candidateName: "John Doe",
  candidateEmail: "john.doe@example.com",
  jobTitle: "Software Engineer",
  jobLocation: "Remote",
  companyName: "Your Company",
  applicationDate: new Date().toLocaleDateString(),
  hrName: "Jane Smith",
};

function replaceTemplateVariables(text: string): string {
  return text
    .replace(/\{\{\s*candidateName\s*\}\}/g, TEMPLATE_VARIABLES.candidateName)
    .replace(/\{\{\s*candidateEmail\s*\}\}/g, TEMPLATE_VARIABLES.candidateEmail)
    .replace(/\{\{\s*jobTitle\s*\}\}/g, TEMPLATE_VARIABLES.jobTitle)
    .replace(/\{\{\s*jobLocation\s*\}\}/g, TEMPLATE_VARIABLES.jobLocation)
    .replace(/\{\{\s*companyName\s*\}\}/g, TEMPLATE_VARIABLES.companyName)
    .replace(
      /\{\{\s*applicationDate\s*\}\}/g,
      TEMPLATE_VARIABLES.applicationDate,
    )
    .replace(/\{\{\s*hrName\s*\}\}/g, TEMPLATE_VARIABLES.hrName);
}

export function EmailTemplatePreviewDialog({
  open,
  onOpenChange,
  template,
}: EmailTemplatePreviewDialogProps) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Email Template Preview - {template.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Subject Preview:</h4>
            <p className="text-gray-700 bg-gray-50 p-2 rounded">
              {replaceTemplateVariables(template.subject)}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Body Preview:</h4>
            <div className="border rounded p-4 bg-white max-h-96 overflow-y-auto">
              <div
                dangerouslySetInnerHTML={{
                  __html: replaceTemplateVariables(template.body),
                }}
              />
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
            <p className="font-semibold mb-2">Sample Data Used for Preview:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(TEMPLATE_VARIABLES).map(([key, value]) => (
                <div key={key}>
                  <code className="bg-gray-200 px-1 rounded">
                    {`{{${key}}}`}
                  </code>{" "}
                  → {value}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
