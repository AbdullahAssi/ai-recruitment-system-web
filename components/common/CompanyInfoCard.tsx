import { Building2, MapPin, Users, Calendar, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Company {
  id: string;
  name: string;
  logo?: string | null;
  industry?: string | null;
  size?: string | null;
  location?: string | null;
  website?: string | null;
  description?: string | null;
  foundedYear?: number | null;
  isVerified?: boolean;
}

interface CompanyInfoCardProps {
  company: Company;
  showDescription?: boolean;
  variant?: "full" | "compact";
}

export function CompanyInfoCard({
  company,
  showDescription = false,
  variant = "full",
}: CompanyInfoCardProps) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        {company.logo ? (
          <img
            src={company.logo}
            alt={company.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {company.name}
            </h3>
            {company.isVerified && (
              <Badge variant="secondary" className="text-xs">
                ✓
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
            {company.industry && <span>{company.industry}</span>}
            {company.location && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {company.location}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                {company.name}
              </h3>
              {company.isVerified && (
                <Badge className="bg-green-500">Verified</Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
              {company.industry && (
                <Badge variant="secondary">{company.industry}</Badge>
              )}
              {company.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {company.location}
                </span>
              )}
              {company.size && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {company.size} employees
                </span>
              )}
              {company.foundedYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Founded {company.foundedYear}
                </span>
              )}
            </div>

            {showDescription && company.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {company.description}
              </p>
            )}

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Globe className="w-4 h-4" />
                Visit Website
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
