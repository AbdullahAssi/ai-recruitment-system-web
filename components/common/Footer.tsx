import React from 'react';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`bg-gray-50 border-t border-gray-200 py-8 mt-16 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-gray-600 text-sm">
          © {new Date().getFullYear()} AI Recruitment System. Built with
          Love For Final Project
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Intelligent resume matching for modern recruitment.
        </p>
      </div>
    </footer>
  );
}
