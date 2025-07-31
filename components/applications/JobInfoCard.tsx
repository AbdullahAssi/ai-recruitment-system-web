import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobData } from "../../types/application.types";

interface JobInfoCardProps {
  job: JobData;
  totalApplications: number;
}

export function JobInfoCard({ job, totalApplications }: JobInfoCardProps) {
  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
              <span>{job.location || "Remote"}</span>
              <span>
                Posted: {format(new Date(job.postedDate), "MMM dd, yyyy")}
              </span>
              <Badge
                className={
                  job.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {job.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">
              {totalApplications}
            </div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 text-sm line-clamp-2">{job.description}</p>
      </CardContent>
    </Card>
  );
}
