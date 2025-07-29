"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Calendar,
  FileText,
  Search,
  Eye,
  Download,
  Briefcase,
  MapPin,
  Users,
  Filter,
  Send,
} from "lucide-react";
import { format } from "date-fns";

interface Candidate {
  id: string;
  name: string;
  email: string;
  experience: number;
  createdAt: string;
  resumes: {
    id: string;
    fileName: string;
    filePath: string;
    uploadDate: string;
    extractedText?: string;
  }[];
  applications: {
    id: string;
    score: number;
    status: string;
    appliedAt: string;
    job: {
      id: string;
      title: string;
      location: string;
    };
  }[];
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );

  // Bulk email functionality
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    filterCandidates();
  }, [candidates, searchTerm, experienceFilter]);

  const fetchCandidates = async () => {
    try {
      const response = await fetch("/api/candidates");
      const data = await response.json();

      if (data.success) {
        setCandidates(data.candidates);
        toast({
          title: "Candidates Loaded",
          description: `Found ${data.candidates.length} candidates`,
        });
      } else {
        toast({
          title: "Failed to Load Candidates",
          description: data.error || "Could not fetch candidate data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast({
        title: "Failed to Load Candidates",
        description: "An error occurred while loading candidate data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCandidates = () => {
    let filtered = [...candidates];

    // Search by name or email
    if (searchTerm) {
      filtered = filtered.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by experience
    if (experienceFilter) {
      const [min, max] = experienceFilter.split("-").map(Number);
      filtered = filtered.filter((candidate) => {
        if (max) {
          return candidate.experience >= min && candidate.experience <= max;
        } else {
          return candidate.experience >= min;
        }
      });
    }

    setFilteredCandidates(filtered);
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
      const allIds = filteredCandidates.map((candidate) => candidate.id);
      setSelectedCandidates(allIds);
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleSelectCandidate = (candidateId: string, checked: boolean) => {
    if (checked) {
      setSelectedCandidates((prev) => [...prev, candidateId]);
    } else {
      setSelectedCandidates((prev) => prev.filter((id) => id !== candidateId));
    }
  };

  const openEmailDialog = async () => {
    await fetchEmailTemplates();
    setEmailDialogOpen(true);
  };

  const sendBulkEmail = async () => {
    if (selectedCandidates.length === 0) {
      toast({
        title: "No Recipients Selected",
        description: "Please select at least one candidate to send emails to",
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
      const emailData = {
        candidateIds: selectedCandidates,
        ...(selectedTemplate && selectedTemplate !== "custom"
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
        const sentCount =
          result.results?.successCount ||
          result.sent ||
          selectedCandidates.length;
        toast({
          title: "Emails Sent Successfully",
          description: `Sent ${sentCount} emails to selected candidates`,
        });
        setEmailDialogOpen(false);
        setSelectedCandidates([]);
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
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Candidate Database
            </h1>
            <p className="text-gray-600">
              Manage and review candidate profiles and applications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-lg font-semibold text-purple-600">
              {filteredCandidates.length} Candidates
            </span>
          </div>
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
            <div className="grid md:grid-cols-3 gap-4">
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
                  Experience Level
                </label>
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Experience Levels</option>
                  <option value="0-2">0-2 years (Junior)</option>
                  <option value="3-5">3-5 years (Mid-level)</option>
                  <option value="6-10">6-10 years (Senior)</option>
                  <option value="10">10+ years (Expert)</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setExperienceFilter("");
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

        {/* Bulk Actions Toolbar */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedCandidates.length === filteredCandidates.length &&
                      filteredCandidates.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm text-gray-600">
                    Select All ({selectedCandidates.length} selected)
                  </Label>
                </div>
                {selectedCandidates.length > 0 && (
                  <Badge variant="secondary" className="px-3 py-1">
                    {selectedCandidates.length} candidates selected
                  </Badge>
                )}
              </div>

              {selectedCandidates.length > 0 && (
                <Dialog
                  open={emailDialogOpen}
                  onOpenChange={setEmailDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      onClick={openEmailDialog}
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
                          Sending to {selectedCandidates.length} selected
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
                            disabled={
                              sendingEmail ||
                              !selectedTemplate ||
                              (selectedTemplate === "custom" &&
                                (!customSubject || !customBody))
                            }
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
              )}
            </div>
          </CardContent>
        </Card>

        {/* Candidates Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <Card
              key={candidate.id}
              className={`shadow-lg hover:shadow-xl transition-all ${
                selectedCandidates.includes(candidate.id)
                  ? "ring-2 ring-purple-500 bg-purple-50"
                  : ""
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-2">
                      <Checkbox
                        checked={selectedCandidates.includes(candidate.id)}
                        onCheckedChange={(checked) =>
                          handleSelectCandidate(
                            candidate.id,
                            checked as boolean
                          )
                        }
                      />
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {candidate.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {candidate.email}
                      </p>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          {candidate.name} - Profile Details
                        </DialogTitle>
                      </DialogHeader>

                      {selectedCandidate && (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                            <Button
                              onClick={() => {
                              setEmailDialogOpen(false);
                              setSelectedCandidate(null);
                              window.location.href = `/hr/candidates/${candidate.id}`;
                              }}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <User className="w-4 h-4 mr-2" />
                              Open Full Profile
                            </Button>
                            </div>

                          <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="overview">
                                Overview
                              </TabsTrigger>
                              <TabsTrigger value="resumes">Resumes</TabsTrigger>
                              <TabsTrigger value="applications">
                                Applications
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h4 className="font-semibold mb-2">
                                    Contact Information
                                  </h4>
                                  <p className="text-sm">
                                    <strong>Email:</strong>{" "}
                                    {selectedCandidate.email}
                                  </p>
                                  <p className="text-sm">
                                    <strong>Experience:</strong>{" "}
                                    {selectedCandidate.experience} years
                                  </p>
                                  <p className="text-sm">
                                    <strong>Registered:</strong>{" "}
                                    {format(
                                      new Date(selectedCandidate.createdAt),
                                      "MMM dd, yyyy"
                                    )}
                                  </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h4 className="font-semibold mb-2">
                                    Statistics
                                  </h4>
                                  <p className="text-sm">
                                    <strong>Resumes:</strong>{" "}
                                    {selectedCandidate.resumes.length}
                                  </p>
                                  <p className="text-sm">
                                    <strong>Applications:</strong>{" "}
                                    {selectedCandidate.applications.length}
                                  </p>
                                  <p className="text-sm">
                                    <strong>Last Activity:</strong>{" "}
                                    {selectedCandidate.applications.length > 0
                                      ? format(
                                          new Date(
                                            Math.max(
                                              ...selectedCandidate.applications.map(
                                                (app) =>
                                                  new Date(
                                                    app.appliedAt
                                                  ).getTime()
                                              )
                                            )
                                          ),
                                          "MMM dd, yyyy"
                                        )
                                      : "No applications"}
                                  </p>
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="resumes" className="space-y-4">
                              {selectedCandidate.resumes.map((resume) => (
                                <div
                                  key={resume.id}
                                  className="border p-4 rounded-lg"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold flex items-center gap-2">
                                      <FileText className="w-4 h-4" />
                                      {resume.fileName}
                                    </h4>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        downloadResume(
                                          resume.id,
                                          resume.fileName
                                        )
                                      }
                                    >
                                      <Download className="w-4 h-4 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    Uploaded:{" "}
                                    {format(
                                      new Date(resume.uploadDate),
                                      "MMM dd, yyyy"
                                    )}
                                  </p>
                                  {resume.extractedText && (
                                    <div className="bg-gray-50 p-3 rounded text-xs max-h-32 overflow-y-auto">
                                      <strong>Extracted Text Preview:</strong>
                                      <p className="mt-1">
                                        {resume.extractedText.substring(0, 300)}
                                        ...
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </TabsContent>

                            <TabsContent
                              value="applications"
                              className="space-y-4"
                            >
                              {selectedCandidate.applications.map(
                                (application) => (
                                  <div
                                    key={application.id}
                                    className="border p-4 rounded-lg"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <h4 className="font-semibold flex items-center gap-2">
                                          <Briefcase className="w-4 h-4" />
                                          {application.job.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {application.job.location}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <div
                                          className={`text-lg font-bold ${getScoreColor(
                                            application.score
                                          )}`}
                                        >
                                          {application.score}%
                                        </div>
                                        <Badge
                                          className={getStatusColor(
                                            application.status
                                          )}
                                        >
                                          {application.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      Applied:{" "}
                                      {format(
                                        new Date(application.appliedAt),
                                        "MMM dd, yyyy"
                                      )}
                                    </p>
                                  </div>
                                )
                              )}

                              {selectedCandidate.applications.length === 0 && (
                                <p className="text-gray-500 text-center py-4">
                                  No applications submitted yet
                                </p>
                              )}
                            </TabsContent>
                          </Tabs>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {candidate.experience} years experience
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {format(new Date(candidate.createdAt), "MMM yyyy")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {candidate.resumes.length} resume(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {candidate.applications.length} application(s)
                    </span>
                  </div>
                </div>

                {candidate.applications.length > 0 && (
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-semibold mb-2">
                      Recent Applications
                    </h4>
                    <div className="space-y-2">
                      {candidate.applications.slice(0, 2).map((app) => (
                        <div
                          key={app.id}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="truncate">{app.job.title}</span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold ${getScoreColor(
                                app.score
                              )}`}
                            >
                              {app.score}%
                            </span>
                            <Badge
                              className={`text-xs ${getStatusColor(
                                app.status
                              )}`}
                            >
                              {app.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCandidates.length === 0 && !loading && (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Candidates Found
            </h3>
            <p className="text-gray-600">
              {searchTerm || experienceFilter
                ? "Try adjusting your filters to see more results"
                : "No candidates have registered yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
