import { format } from "date-fns";
import { MapPin, Calendar, Users } from "lucide-react";
import { JobData } from "../../types/application.types";

interface JobInfoCardProps {
  job: JobData;
  totalApplications: number;
}

export function JobInfoCard({ job, totalApplications }: JobInfoCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        {/* Left: job details */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-brand">
              {job.title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-foreground truncate">{job.title}</h2>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted border border-border rounded-full px-2.5 py-1">
                <MapPin className="w-3 h-3" />
                {job.location || "Remote"}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted border border-border rounded-full px-2.5 py-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(job.postedDate), "MMM dd, yyyy")}
              </span>
              <span
                className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                  job.isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {job.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
          </div>
        </div>

        {/* Right: total applications */}
        <div className="flex flex-col items-center flex-shrink-0 bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 min-w-[80px]">
          <Users className="w-4 h-4 text-brand mb-1" />
          <div className="text-2xl font-bold text-brand">{totalApplications}</div>
          <div className="text-xs text-muted-foreground text-center leading-tight">Total</div>
        </div>
      </div>
    </div>
  );
}
