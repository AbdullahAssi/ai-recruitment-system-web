import React from "react";
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
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
      {/* Banner */}
      <div className="relative h-32 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>
      <div className="relative px-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-12">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
            <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-900 shadow-xl">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-2xl font-bold">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left pb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 justify-center md:justify-start">
                <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <FaEnvelope className="w-4 h-4 mr-1.5 text-blue-500" />
                  {email}
                </span>
                {experience !== undefined && experience > 0 && (
                  <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0 flex items-center gap-1">
                    <FaBriefcase className="w-3 h-3" />
                    {experience} yr{experience !== 1 ? "s" : ""} exp.
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={onEditClick}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 mt-4 md:mt-0"
            aria-label="Edit profile"
          >
            <FaEdit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="mt-6 space-y-5">
          {bio && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-4">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                About
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                {bio}
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-3">
            {phone && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2.5 border border-gray-100 dark:border-gray-800">
                <FaPhone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{phone}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2.5 border border-gray-100 dark:border-gray-800">
                <FaMapMarkerAlt className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{location}</span>
              </div>
            )}
          </div>

          {(linkedinUrl || githubUrl || portfolioUrl) && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Connect
              </h3>
              <div className="flex flex-wrap gap-3">
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-sm font-medium"
                    aria-label="Visit LinkedIn profile"
                  >
                    <FaLinkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                    aria-label="Visit GitHub profile"
                  >
                    <FaGithub className="w-4 h-4" />
                    GitHub
                  </a>
                )}
                {portfolioUrl && (
                  <a
                    href={portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors text-sm font-medium"
                    aria-label="Visit portfolio website"
                  >
                    <FaGlobe className="w-4 h-4" />
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
