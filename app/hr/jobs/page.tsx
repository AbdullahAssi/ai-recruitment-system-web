"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Briefcase, MapPin, Calendar, Users, Eye } from "lucide-react";
import { format } from "date-fns";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  requirements: string;
  postedDate: string;
  applications: Array<{
    id: string;
    score: number;
    status: string;
    candidate: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export default function HRJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    requirements: "",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();
      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateDialog(false);
        setFormData({
          title: "",
          description: "",
          location: "",
          requirements: "",
        });
        fetchJobs(); // Refresh the jobs list
      } else {
        alert(data.error || "Failed to create job");
      }
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to create job");
    } finally {
      setCreating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Job Management
            </h1>
            <p className="text-gray-600">
              Manage job postings and view applications
            </p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Post New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Job Posting</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                    placeholder="e.g., Senior React Developer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="e.g., Remote, New York, NY"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    required
                    placeholder="Describe the role, responsibilities, and company culture..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">
                    Requirements & Qualifications
                  </Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        requirements: e.target.value,
                      }))
                    }
                    placeholder="List specific requirements, skills, experience, education, etc..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? "Creating..." : "Post Job"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Jobs Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location || "Remote"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(job.postedDate), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    Active
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {job.description}
                  </p>
                </div>

                {job.requirements && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Requirements</h4>
                    <p className="text-gray-600 text-xs line-clamp-2">
                      {job.requirements}
                    </p>
                  </div>
                )}

                {/* Applications Summary */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Applications ({job.applications.length})
                    </h4>
                  </div>

                  {job.applications.length > 0 ? (
                    <div className="space-y-2">
                      {job.applications.slice(0, 3).map((application) => (
                        <div
                          key={application.id}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {application.candidate.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {application.candidate.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-sm font-bold px-2 py-1 rounded ${getScoreColor(
                                application.score
                              )}`}
                            >
                              {application.score}%
                            </div>
                            <p className="text-xs text-gray-600 capitalize">
                              {application.status.toLowerCase()}
                            </p>
                          </div>
                        </div>
                      ))}

                      {job.applications.length > 3 && (
                        <div className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View All {job.applications.length} Applications
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No applications yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Jobs Posted
            </h3>
            <p className="text-gray-600 mb-4">
              Start by creating your first job posting
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Post Your First Job
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
