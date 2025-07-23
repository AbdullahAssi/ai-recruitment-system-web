"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Briefcase, 
  MapPin, 
  Calendar, 
  Users, 
  Eye, 
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  ToggleLeft,
  ToggleRight,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  requirements: string;
  isActive: boolean;
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

interface FilterState {
  search: string;
  status: 'all' | 'active' | 'inactive';
  location: string;
  sortBy: 'date' | 'title' | 'applications';
  sortOrder: 'asc' | 'desc';
}

export default function HRJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    requirements: "",
  });
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    location: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const applyFilters = () => {
    let filtered = [...jobs];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        job.location.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(job =>
        filters.status === 'active' ? job.isActive : !job.isActive
      );
    }

    // Location filter
    if (filters.location) {
      const locationTerm = filters.location.toLowerCase();
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationTerm)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'applications':
          aValue = a.applications.length;
          bValue = b.applications.length;
          break;
        case 'date':
        default:
          aValue = new Date(a.postedDate).getTime();
          bValue = new Date(b.postedDate).getTime();
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredJobs(filtered);
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/jobs?includeInactive=true");
      const data = await response.json();
      if (data.success) {
        setJobs(data.jobs);
      } else {
        toast({
          title: "Failed to Load Jobs",
          description: data.error || "Could not fetch job listings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Failed to Load Jobs",
        description: "An error occurred while loading job listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      requirements: job.requirements || "",
    });
    setShowEditDialog(true);
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    setUpdating(jobId);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchJobs(); // Refresh the jobs list
        toast({
          title: "Job Status Updated",
          description: `Job ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        });
      } else {
        toast({
          title: "Update Failed",
          description: data.error || "Failed to update job status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating job status:", error);
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred while updating job status",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingJob) return;

    // Validation
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.location.trim()
    ) {
      toast({
        title: "Missing Information",
        description:
          "Please fill in all required fields (Title, Description, Location)",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    try {
      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setShowEditDialog(false);
        setEditingJob(null);
        setFormData({
          title: "",
          description: "",
          location: "",
          requirements: "",
        });
        fetchJobs(); // Refresh the jobs list
        toast({
          title: "Job Updated Successfully",
          description: "The job posting has been updated",
        });
      } else {
        toast({
          title: "Job Update Failed",
          description: data.error || "Failed to update job",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        title: "Job Update Failed",
        description: "An unexpected error occurred while updating the job",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.location.trim()
    ) {
      toast({
        title: "Missing Information",
        description:
          "Please fill in all required fields (Title, Description, Location)",
        variant: "destructive",
      });
      return;
    }

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
        toast({
          title: "Job Created Successfully",
          description: "The job posting has been created and is now live",
        });
      } else {
        toast({
          title: "Job Creation Failed",
          description: data.error || "Failed to create job",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Job Creation Failed",
        description: "An unexpected error occurred while creating the job",
        variant: "destructive",
      });
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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Job Management
            </h1>
            <p className="text-gray-600">
              Manage job postings and view applications
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchJobs}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
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
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label>Search Jobs</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title, description..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Job Status</Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value: 'all' | 'active' | 'inactive') => 
                    setFilters(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="Filter by location..."
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value: 'date' | 'title' | 'applications') => 
                    setFilters(prev => ({ ...prev, sortBy: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Posted Date</SelectItem>
                    <SelectItem value="title">Job Title</SelectItem>
                    <SelectItem value="applications">Applications Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Select 
                  value={filters.sortOrder} 
                  onValueChange={(value: 'asc' | 'desc') => 
                    setFilters(prev => ({ ...prev, sortOrder: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Counter */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Showing {filteredJobs.length} of {jobs.length} jobs
                {filters.search && ` for "${filters.search}"`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {job.title}
                      <Badge
                        variant={job.isActive ? "default" : "secondary"}
                        className={job.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {job.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
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
                  
                  {/* Actions Dropdown */}
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
                        onClick={() => handleEditJob(job)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Job
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleToggleJobStatus(job.id, job.isActive)}
                        disabled={updating === job.id}
                        className="flex items-center gap-2"
                      >
                        {job.isActive ? (
                          <ToggleLeft className="w-4 h-4" />
                        ) : (
                          <ToggleRight className="w-4 h-4" />
                        )}
                        {updating === job.id 
                          ? "Updating..." 
                          : job.isActive 
                            ? "Deactivate" 
                            : "Activate"
                        }
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                          <Link href={`/hr/jobs/${job.id}/applications`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View All {job.applications.length} Applications
                            </Button>
                          </Link>
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

        {/* Edit Job Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Job Posting</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateJob} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Job Title *</Label>
                <Input
                  id="edit-title"
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
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
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
                <Label htmlFor="edit-description">Job Description *</Label>
                <Textarea
                  id="edit-description"
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
                <Label htmlFor="edit-requirements">
                  Requirements & Qualifications
                </Label>
                <Textarea
                  id="edit-requirements"
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
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingJob(null);
                    setFormData({
                      title: "",
                      description: "",
                      location: "",
                      requirements: "",
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Updating..." : "Update Job"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {filteredJobs.length === 0 && !loading && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {jobs.length === 0 ? "No Jobs Posted" : "No Jobs Match Your Filters"}
            </h3>
            <p className="text-gray-600 mb-4">
              {jobs.length === 0 
                ? "Start by creating your first job posting"
                : "Try adjusting your search criteria or filters"
              }
            </p>
            {jobs.length === 0 && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Job
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
