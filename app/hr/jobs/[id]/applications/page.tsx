"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Users,
  ArrowLeft,
  Eye,
  Mail,
  Phone,
  Calendar,
  Search,
  Filter,
  Download,
  FileText,
  Send,
  CheckSquare,
  Square,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  score: number;
  status: string;
  appliedAt: string;
  candidate: {
    id: string;
    name: string;
    email: string;
    experience: number;
    resumes: Array<{
      id: string;
      fileName: string;
      uploadDate: string;
    }>;
  };
}

interface JobData {
  id: string;
  title: string;
  description: string;
  location: string;
  requirements: string;
  postedDate: string;
  isActive: boolean;
}

interface JobApplicationsData {
  job: JobData;
  applications: Application[];
  totalApplications: number;
  stats: {
    pending: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
  };
}

export default function JobApplicationsPage({
  params,
}: {
  params: { id: string };
}) {
  const [data, setData] = useState<JobApplicationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Bulk email functionality
  const [selectedApplications, setSelectedApplications] = useState<string[]>(
    []
  );
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchJobApplications();
  }, []);

  const fetchJobApplications = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}/applications`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast({
          title: "Failed to Load Applications",
          description: result.error || "Could not fetch job applications",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching job applications:", error);
      toast({
        title: "Failed to Load Applications",
        description: "An error occurred while loading applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "shortlisted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const downloadResume = async (resumeId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Download Started",
          description: `Downloading ${fileName}`,
        });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the resume",
        variant: "destructive",
      });
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(`/api/jobs/${params.id}/applications`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the local state
        setData((prevData) => {
          if (!prevData) return prevData;

          const updatedApplications = prevData.applications.map((app) =>
            app.id === applicationId ? { ...app, status: newStatus } : app
          );

          // Recalculate stats
          const stats = {
            pending: updatedApplications.filter(
              (app) => app.status === "PENDING"
            ).length,
            reviewed: updatedApplications.filter(
              (app) => app.status === "REVIEWED"
            ).length,
            shortlisted: updatedApplications.filter(
              (app) => app.status === "SHORTLISTED"
            ).length,
            rejected: updatedApplications.filter(
              (app) => app.status === "REJECTED"
            ).length,
          };

          return {
            ...prevData,
            applications: updatedApplications,
            stats,
          };
        });

        toast({
          title: "Status Updated",
          description: `Application status changed to ${newStatus}`,
        });
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Could not update application status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating the status",
        variant: "destructive",
      });
    }
  };

  // Bulk email functionality
  const fetchEmailTemplates = async () => {
    try {
      const response = await fetch("/api/email/templates");
      const data = await response.json();
      if (data.success) {
        setEmailTemplates(data.templates);
      }
    } catch (error) {
      console.error("Error fetching email templates:", error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredAndSortedApplications.map((app) => app.id);
      setSelectedApplications(allIds);
    } else {
      setSelectedApplications([]);
    }
  };

  const handleSelectApplication = (applicationId: string, checked: boolean) => {
    if (checked) {
      setSelectedApplications((prev) => [...prev, applicationId]);
    } else {
      setSelectedApplications((prev) =>
        prev.filter((id) => id !== applicationId)
      );
    }
  };

  const openEmailDialog = async () => {
    await fetchEmailTemplates();
    setEmailDialogOpen(true);
  };

  const sendBulkEmail = async () => {
    if (selectedApplications.length === 0) {
      toast({
        title: "No Recipients Selected",
        description: "Please select at least one application to send emails to",
        variant: "destructive",
      });
      return;
    }

    if (
      !selectedTemplate ||
      (selectedTemplate === "custom" && (!customSubject || !customBody))
    ) {
      toast({
        title: "Email Content Missing",
        description:
          "Please select a template or provide custom subject and body",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);

    try {
      const selectedApps = filteredAndSortedApplications.filter((app) =>
        selectedApplications.includes(app.id)
      );

      const candidateIds = selectedApps.map((app) => app.candidate.id);

      const emailData = {
        candidateIds,
        jobId: params.id,
        ...(selectedTemplate !== "custom"
          ? { templateId: selectedTemplate }
          : {
              customTemplate: {
                subject: customSubject,
                body: customBody,
                name: "Custom Email",
              },
            }),
      };

      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Emails Sent Successfully",
          description: `Sent ${result.sent} emails to selected candidates`,
        });
        setEmailDialogOpen(false);
        setSelectedApplications([]);
        setSelectedTemplate("");
        setCustomSubject("");
        setCustomBody("");
      } else {
        throw new Error(result.error || "Failed to send emails");
      }
    } catch (error) {
      console.error("Error sending bulk emails:", error);
      toast({
        title: "Email Send Failed",
        description: "An error occurred while sending emails",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // Load email templates on component mount
  useEffect(() => {
    fetchEmailTemplates();
  }, []);

  // Filter and sort applications
  const filteredAndSortedApplications =
    data?.applications
      .filter((app) => {
        const matchesSearch =
          app.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.candidate.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" ||
          app.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return (
              new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
            );
          case "oldest":
            return (
              new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime()
            );
          case "score-high":
            return b.score - a.score;
          case "score-low":
            return a.score - b.score;
          case "name":
            return a.candidate.name.localeCompare(b.candidate.name);
          default:
            return 0;
        }
      }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Job Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            The requested job could not be found
          </p>
          <Link href="/hr/jobs">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/hr/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {data.job.title} - Applications
            </h1>
            <p className="text-gray-600 mt-1">
              Manage applications for this job posting
            </p>
          </div>
        </div>

        {/* Job Info Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{data.job.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span>{data.job.location || "Remote"}</span>
                  <span>
                    Posted:{" "}
                    {format(new Date(data.job.postedDate), "MMM dd, yyyy")}
                  </span>
                  <Badge
                    className={
                      data.job.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {data.job.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {data.totalApplications}
                </div>
                <div className="text-sm text-gray-600">Total Applications</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm line-clamp-2">
              {data.job.description}
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {data.stats.pending}
              </div>
              <div className="text-sm text-yellow-700">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.stats.reviewed}
              </div>
              <div className="text-sm text-blue-700">Reviewed</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.stats.shortlisted}
              </div>
              <div className="text-sm text-green-700">Shortlisted</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {data.stats.rejected}
              </div>
              <div className="text-sm text-red-700">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Candidates
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="score-high">Highest Score</SelectItem>
                    <SelectItem value="score-low">Lowest Score</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setSortBy("newest");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="space-y-4">
          {/* Bulk Actions Toolbar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">
                Applications ({filteredAndSortedApplications.length})
              </h3>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={
                    selectedApplications.length ===
                      filteredAndSortedApplications.length &&
                    filteredAndSortedApplications.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm text-gray-600">
                  Select All ({selectedApplications.length} selected)
                </Label>
              </div>
            </div>

            {selectedApplications.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedApplications.length} selected
                </Badge>
                <Dialog
                  open={emailDialogOpen}
                  onOpenChange={setEmailDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      onClick={openEmailDialog}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Bulk Email
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        Send Bulk Email to Selected Candidates
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Recipients
                        </Label>
                        <p className="text-sm text-gray-600">
                          Sending to {selectedApplications.length} selected
                          candidates
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="template-select">
                            Email Template
                          </Label>
                          <Select
                            value={selectedTemplate}
                            onValueChange={setSelectedTemplate}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a template or create custom" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="custom">
                                Custom Email
                              </SelectItem>
                              {emailTemplates.map((template) => (
                                <SelectItem
                                  key={template.id}
                                  value={template.id}
                                >
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedTemplate === "custom" && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="custom-subject">
                                Email Subject
                              </Label>
                              <Input
                                id="custom-subject"
                                value={customSubject}
                                onChange={(e) =>
                                  setCustomSubject(e.target.value)
                                }
                                placeholder="Enter email subject..."
                              />
                            </div>
                            <div>
                              <Label htmlFor="custom-body">Email Body</Label>
                              <Textarea
                                id="custom-body"
                                value={customBody}
                                onChange={(e) => setCustomBody(e.target.value)}
                                placeholder="Enter email content... You can use variables like {{candidateName}}, {{jobTitle}}, etc."
                                rows={8}
                              />
                            </div>
                          </div>
                        )}

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">
                            Available Variables:
                          </h4>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>
                              <code>{"{{candidateName}}"}</code> - Candidate's
                              name
                            </p>
                            <p>
                              <code>{"{{candidateEmail}}"}</code> - Candidate's
                              email
                            </p>
                            <p>
                              <code>{"{{jobTitle}}"}</code> - Job title
                            </p>
                            <p>
                              <code>{"{{jobLocation}}"}</code> - Job location
                            </p>
                            <p>
                              <code>{"{{companyName}}"}</code> - Your company
                              name
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setEmailDialogOpen(false)}
                            disabled={sendingEmail}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={sendBulkEmail}
                            disabled={sendingEmail}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {sendingEmail ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Email
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {filteredAndSortedApplications.map((application) => (
            <Card
              key={application.id}
              className={`shadow-lg hover:shadow-xl transition-all ${
                selectedApplications.includes(application.id)
                  ? "ring-2 ring-purple-500 bg-purple-50"
                  : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex flex-col items-center gap-2">
                      <Checkbox
                        checked={selectedApplications.includes(application.id)}
                        onCheckedChange={(checked) =>
                          handleSelectApplication(
                            application.id,
                            checked as boolean
                          )
                        }
                      />
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {application.candidate.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">
                        {application.candidate.name}
                      </h4>
                      <p className="text-gray-600 text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {application.candidate.email}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        {application.candidate.experience} years experience
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <div
                      className={`text-xl font-bold px-4 py-2 rounded-lg ${getScoreColor(
                        application.score
                      )}`}
                    >
                      {application.score}%
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      <strong>Applied:</strong>{" "}
                      {format(
                        new Date(application.appliedAt),
                        "MMM dd, yyyy 'at' HH:mm"
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Application ID:</strong>{" "}
                      {application.id.substring(0, 8)}...
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <strong>Resumes:</strong>{" "}
                      {application.candidate.resumes.length} uploaded
                    </p>
                    {application.candidate.resumes.length > 0 && (
                      <p className="text-sm text-gray-600">
                        <strong>Latest:</strong>{" "}
                        {format(
                          new Date(application.candidate.resumes[0].uploadDate),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex gap-2">
                    {application.candidate.resumes.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          downloadResume(
                            application.candidate.resumes[0].id,
                            application.candidate.resumes[0].fileName
                          )
                        }
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download Resume
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Eye className="w-3 h-3 mr-1" />
                      View Profile
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Mail className="w-3 h-3 mr-1" />
                      Contact
                    </Button>
                    <Select
                      value={application.status}
                      onValueChange={(value) =>
                        updateApplicationStatus(application.id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="REVIEWED">Reviewed</SelectItem>
                        <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredAndSortedApplications.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Applications Found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "No applications match your current filters"
                  : "No applications have been submitted for this job yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
