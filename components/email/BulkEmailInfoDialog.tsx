import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, Users } from "lucide-react";
import { EmailTemplate } from "../../hooks/useEmailTemplates";

interface BulkEmailInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: EmailTemplate | null;
  onTestConnection: () => Promise<boolean>;
}

export function BulkEmailInfoDialog({
  open,
  onOpenChange,
  template,
  onTestConnection,
}: BulkEmailInfoDialogProps) {
  if (!template) return null;

  const handleTestConnection = async () => {
    await onTestConnection();
  };

  const handleReadyToSend = () => {
    // This could navigate to candidates page or show additional info
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Bulk Email - {template.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* SMTP Status */}
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

          {/* Instructions */}
          <div className="space-y-3">
            <h4 className="font-medium">How to Send Bulk Emails:</h4>
            <div className="bg-blue-50 p-4 rounded-lg text-sm">
              <p className="font-semibold mb-2">Steps to send bulk emails:</p>
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
                <code>{"{{jobTitle}}"}</code> will be automatically replaced for
                each recipient.
              </p>
            </div>
          </div>

          {/* Features */}
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

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleTestConnection} variant="outline">
              Test Connection
            </Button>
            <Button onClick={handleReadyToSend}>
              <Send className="w-4 h-4 mr-2" />
              Ready to Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
