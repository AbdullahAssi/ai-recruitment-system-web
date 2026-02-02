"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Eye,
  Calendar,
  User,
  Briefcase,
  FileText,
} from "lucide-react";
import { ServerPagination } from "@/components/reusables/ServerPagination";

interface EmailHistoryItem {
  id: string;
  subject: string;
  body: string;
  recipient: string;
  status: "SENT" | "FAILED" | "PENDING";
  sentAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  candidate: {
    id: string;
    name: string;
    email: string;
  };
  job: {
    id: string;
    title: string;
    location: string;
    company: {
      id: string;
      name: string;
    };
  } | null;
  template: {
    id: string;
    name: string;
    type: string;
  } | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalCount: number;
  totalPages: number;
}

export default function EmailHistoryPage() {
  const [emailHistory, setEmailHistory] = useState<EmailHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalCount: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });
  const [searchDebounce, setSearchDebounce] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<EmailHistoryItem | null>(
    null,
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchDebounce }));
      setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchDebounce]);

  // Fetch email history
  useEffect(() => {
    fetchEmailHistory();
  }, [pagination.page, pagination.limit, filters.status, filters.search]);

  const fetchEmailHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/email/history?${params}`);
      const data = await response.json();

      if (data.success) {
        setEmailHistory(data.emailHistory);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch email history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sent
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Email History
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View all emails sent from the system
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by recipient or subject..."
                value={searchDebounce}
                onChange={(e) => setSearchDebounce(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status}
              onValueChange={(value) => {
                setFilters({ ...filters, status: value });
                setPagination({ ...pagination, page: 1 });
              }}
            >
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>

            {/* Stats */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4" />
              <span>
                Total: <strong>{pagination.totalCount}</strong> emails
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Loading email history...
                </p>
              </div>
            </div>
          ) : emailHistory.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No emails found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No email records match your current filters
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {emailHistory.map((email) => (
                <div
                  key={email.id}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Subject and Status */}
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {email.subject}
                          </h3>
                        </div>
                        {getStatusBadge(email.status)}
                      </div>

                      {/* Recipient */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{email.recipient}</span>
                        {email.candidate && (
                          <span className="text-xs">
                            ({email.candidate.name})
                          </span>
                        )}
                      </div>

                      {/* Job Info */}
                      {email.job && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <Briefcase className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {email.job.title}
                            {email.job.company && (
                              <span className="text-xs ml-1">
                                at {email.job.company.name}
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Template Info */}
                      {email.template && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <FileText className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            Template: {email.template.name}
                          </span>
                        </div>
                      )}

                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {email.sentAt
                          ? formatDate(email.sentAt)
                          : formatDate(email.createdAt)}
                      </div>

                      {/* Error Message */}
                      {email.status === "FAILED" && email.errorMessage && (
                        <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                          <strong>Error:</strong> {email.errorMessage}
                        </div>
                      )}
                    </div>

                    {/* View Button */}
                    <button
                      onClick={() => setSelectedEmail(email)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                      title="View email content"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && emailHistory.length > 0 && (
            <div className="mt-6">
              <ServerPagination
                pagination={pagination}
                onPageChange={(page: number) =>
                  setPagination({ ...pagination, page })
                }
                onLimitChange={(limit: number) =>
                  setPagination({ ...pagination, limit, page: 1 })
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Preview Dialog */}
      {selectedEmail && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEmail(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedEmail.subject}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{selectedEmail.recipient}</span>
                    </div>
                    {getStatusBadge(selectedEmail.status)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
