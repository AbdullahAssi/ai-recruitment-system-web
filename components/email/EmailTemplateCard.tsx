import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  MoreHorizontal,
  Eye,
  Edit,
  Send,
  Copy,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import {
  EmailTemplate,
  getEmailTypeLabel,
} from "../../hooks/useEmailTemplates";

interface EmailTemplateCardProps {
  template: EmailTemplate;
  onPreview: (template: EmailTemplate) => void;
  onEdit: (template: EmailTemplate) => void;
  onDuplicate: (template: EmailTemplate) => void;
  onToggleActive: (template: EmailTemplate) => void;
  onBulkEmailInfo: (template: EmailTemplate) => void;
  onDelete: (templateId: string) => void;
}

export function EmailTemplateCard({
  template,
  onPreview,
  onEdit,
  onDuplicate,
  onToggleActive,
  onBulkEmailInfo,
  onDelete,
}: EmailTemplateCardProps) {
  return (
    <Card className="shadow-lg">
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
                {getEmailTypeLabel(template.type)}
              </Badge>
              <span>
                Updated {format(new Date(template.updatedAt), "MMM dd, yyyy")}
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
                onClick={() => onPreview(template)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(template)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onBulkEmailInfo(template)}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Bulk Email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDuplicate(template)}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onToggleActive(template)}
                className="flex items-center gap-2"
              >
                {template.isActive ? "🔴" : "🟢"} 
                {template.isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(template.id)}
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
  );
}
