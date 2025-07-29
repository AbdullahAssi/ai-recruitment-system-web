import React from "react";

const HiringAutomationSection: React.FC = () => {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto ">
      {/* Header Badge */}
      <div className="mb-8">
        <span className="inline-block px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-full">
          Changing the Norm
        </span>
      </div>

      {/* Main Heading */}
      <div className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-black leading-tight max-w-5xl">
          We have <span className="text-blue-500">simplified hiring</span> with
          AI automation and data-driven insights.
        </h2>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-12 gap-6 h-auto">
        {/* AI-Powered Screening - Top Left */}
        <div className="col-span-12 md:col-span-5 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="h-64 bg-gradient-to-br from-orange-100 to-orange-50 relative overflow-hidden">
            {/* Placeholder for hands/document image */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200/50 to-orange-100/50 flex items-center justify-center">
              <div className="w-32 h-32 bg-orange-300/30 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-orange-400/40 rounded-lg"></div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              AI-Powered
              <br />
              Screening
            </h3>
            <p className="text-gray-600 text-sm">
              Unlock faster, smarter screening with automated resume analysis.
            </p>
          </div>
        </div>

        {/* Interview Scheduling - Top Right */}
        <div className="col-span-12 md:col-span-7 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
            {/* Placeholder for calendar image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-lg p-4 transform rotate-3">
                <div className="text-2xl font-bold text-black mb-2">Jan</div>
                <div className="grid grid-cols-7 gap-1 text-xs text-gray-600">
                  {[...Array(31)].map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 flex items-center justify-center"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Interview
              <br />
              Scheduling
            </h3>
            <p className="text-gray-600 text-sm">
              Automate interview coordination and eliminate back-and-forth.
            </p>
          </div>
        </div>

        {/* Candidate Skill Matching - Bottom Left */}
        <div className="col-span-12 md:col-span-7 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
            {/* Placeholder for team meeting image */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 flex items-center justify-center">
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-blue-300/40 rounded-full"></div>
                <div className="w-12 h-12 bg-indigo-300/40 rounded-full"></div>
                <div className="w-8 h-16 bg-blue-400/30 rounded-lg"></div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Candidate
              <br />
              Skill Matching
            </h3>
            <p className="text-gray-600 text-sm">
              Match candidates to roles based on skills and experience using AI.
            </p>
          </div>
        </div>

        {/* Real-Time Insights - Bottom Right */}
        <div className="col-span-12 md:col-span-5 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-50 relative overflow-hidden">
            {/* Placeholder for laptop with analytics */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-gray-800 rounded-lg p-2 transform -rotate-12">
                <div className="w-32 h-20 bg-white rounded flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Real-Time
              <br />
              Insights
            </h3>
            <p className="text-gray-600 text-sm">
              View candidate funnel performance and hiring KPIs instantly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HiringAutomationSection;
