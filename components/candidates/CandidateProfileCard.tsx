import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaEdit,
} from "react-icons/fa";

interface CandidateProfileCardProps {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  experience?: number;
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  onEditClick: () => void;
}

export function CandidateProfileCard({
  name,
  email,
  phone,
  location,
  experience,
  bio,
  linkedinUrl,
  githubUrl,
  portfolioUrl,
  onEditClick,
}: CandidateProfileCardProps) {
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return parts
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-32" />
      <CardContent className="relative pt-0 pb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 md:-mt-12">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
            <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl font-bold">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 justify-center md:justify-start">
                <span className="flex items-center text-sm text-gray-600">
                  <FaEnvelope className="w-4 h-4 mr-1" />
                  {email}
                </span>
                {experience !== undefined && experience > 0 && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <FaBriefcase className="w-3 h-3" />
                    {experience} years exp.
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={onEditClick}
            className="bg-purple-600 hover:bg-purple-700 mt-4 md:mt-0"
            aria-label="Edit profile"
          >
            <FaEdit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          {bio && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                About
              </h3>
              <p className="text-gray-600 leading-relaxed">{bio}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <FaPhone className="w-4 h-4 text-purple-600" />
                <span>{phone}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2 text-gray-600">
                <FaMapMarkerAlt className="w-4 h-4 text-purple-600" />
                <span>{location}</span>
              </div>
            )}
          </div>

          {(linkedinUrl || githubUrl || portfolioUrl) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Connect
              </h3>
              <div className="flex flex-wrap gap-3">
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    aria-label="Visit LinkedIn profile"
                  >
                    <FaLinkedin className="w-4 h-4" />
                    <span className="text-sm font-medium">LinkedIn</span>
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    aria-label="Visit GitHub profile"
                  >
                    <FaGithub className="w-4 h-4" />
                    <span className="text-sm font-medium">GitHub</span>
                  </a>
                )}
                {portfolioUrl && (
                  <a
                    href={portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                    aria-label="Visit portfolio website"
                  >
                    <FaGlobe className="w-4 h-4" />
                    <span className="text-sm font-medium">Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
