"use client";
import React, { useEffect, useRef, useState } from 'react';

interface Step {
  id: string;
  badge: string;
  title: string;
  description: string;
  features: string[];
  imageContent: React.ReactNode;
}

const HiringStepsSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const steps: Step[] = [
    {
      id: 'step-01',
      badge: 'Step 01',
      title: 'Book a Screening',
      description: 'Easily schedule an AI-driven candidate screening with our system',
      features: [
       'Automate interview scheduling',
            'Integrate with calendars',
            'Choose from partner recruitment platforms',
            'Send automated reminders to candidates',
            'Customizable screening questions',
            'Real-time availability detection'
        
      ],
      imageContent: (
        <div className="relative w-full  h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl overflow-hidden">
          {/* Professional woman with calendar interface */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-64 bg-gradient-to-b from-gray-400 to-gray-500 rounded-lg flex items-end justify-center pb-4">
              <div className="w-20 h-24 bg-white/20 rounded-full"></div>
            </div>
          </div>
          
          {/* Calendar overlay */}
          <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
            <div className="flex gap-1 mb-3">
              {['Mon\n05', 'Tue\n06', 'Wed\n07', 'Thurs\n08', 'Fri\n09'].map((day, i) => (
                <div key={i} className={`px-2 py-1 rounded text-xs text-center whitespace-pre-line ${i === 2 ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {day}
                </div>
              ))}
            </div>
            <div className="flex gap-1 text-xs mb-3">
              <span className="bg-gray-100 px-2 py-1 rounded">10:00 AM</span>
              <span className="bg-gray-200 px-2 py-1 rounded">10:30 AM</span>
              <span className="bg-gray-100 px-2 py-1 rounded">11:00 AM</span>
            </div>
          </div>

          {/* Notification popup */}
          <div className="absolute bottom-6 left-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center gap-3">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">AI Interview Scheduled</div>
              <div className="text-blue-200 text-xs">with 24 candidates</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'step-02',
      badge: 'Step 02',
      title: 'Review AI Insights',
      description: 'Gain deep candidate insights with our powerful AI engine.',
      features: [
        'View top skill matches and candidate fit',
        'Understand location and role preferences',
        'Get data-backed recommendations'
      ],
      imageContent: (
        <div className="relative w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl overflow-hidden">
          {/* Professional woman with laptop */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-64 bg-gradient-to-b from-gray-400 to-gray-500 rounded-lg flex items-end justify-center pb-4">
              <div className="w-20 h-24 bg-white/20 rounded-full"></div>
            </div>
          </div>

          {/* Laptop screen with video call */}
          <div className="absolute top-6 right-6 w-32 h-20 bg-black rounded-lg overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-900 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-1 p-2">
                <div className="w-12 h-8 bg-orange-400 rounded"></div>
                <div className="w-12 h-8 bg-blue-400 rounded"></div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-800 flex items-center justify-center gap-1">
              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
            </div>
          </div>

          {/* AI Insights panel */}
          <div className="absolute bottom-6 left-6 bg-gray-800/95 backdrop-blur-sm rounded-xl p-4 text-white max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium">AI Insights</span>
            </div>
            <div className="mb-3">
              <div className="text-xl font-bold">45%</div>
              <div className="text-gray-400 text-xs">of Candidates came from Austin, Texas</div>
            </div>
            <div>
              <div className="text-xs text-gray-300 mb-2">Most requested job perks:</div>
              <div className="flex flex-wrap gap-1">
                <span className="bg-gray-700 px-2 py-1 rounded text-xs">Work from Home</span>
                <span className="bg-gray-700 px-2 py-1 rounded text-xs">Flexible Hours</span>
                <span className="bg-gray-700 px-2 py-1 rounded text-xs">Pet Friendly Workspace</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'step-03',
      badge: 'Step 03',
      title: 'Select the Best Match',
      description: 'Quickly choose from top-matched candidates with confidence.',
      features: [
        'Use smart filters and compatibility scores',
        'Access interview-ready profiles',
        'Make decisions backed by real data'
      ],
      imageContent: (
        <div className="relative w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl overflow-hidden">
          {/* Professional person */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-64 bg-gradient-to-b from-gray-400 to-gray-500 rounded-lg flex items-end justify-center pb-4">
              <div className="w-20 h-24 bg-white/20 rounded-full"></div>
            </div>
          </div>

          {/* Candidate profile card */}
          <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg max-w-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-sm">Alex Johnson</div>
                <div className="text-xs text-gray-600">Senior Developer</div>
              </div>
              <div className="text-right">
                <div className="text-green-600 font-bold">98%</div>
                <div className="text-xs text-gray-500">Match</div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Skills Match</span>
                <span className="font-medium">95%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{width: '95%'}}></div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Experience</span>
                <span className="font-medium">5+ years</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Location</span>
                <span className="font-medium">Austin, TX</span>
              </div>
            </div>
            
            <button className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors">
              Schedule Interview
            </button>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = stepRefs.current.findIndex(ref => ref === entry.target);
            if (stepIndex !== -1) {
              setActiveStep(stepIndex);
            }
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-gray-50  min-h-screen">
      {/* Header Section */}
      <div className="container  max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="max-w-4xl">
          <span className="inline-block px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm rounded-full mb-6">
            Getting Started
          </span>
          <h2 className="text-5xl md:text-6xl font-bold text-black leading-tight mb-6">
            3 Simple Steps to <br />
            <span className="text-blue-500">Hire Better</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl">
            Streamline your hiring process with AI tools built for speed, accuracy, and smarter decisions.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        <div className="container mx-auto px-6">
          <div className="flex gap-12">
            {/* Left Side - Sticky Images */}
            <div className="w-1/2 sticky top-8 h-screen flex items-center">
              <div className="relative w-full h-[600px]">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      index === activeStep 
                        ? 'opacity-100 scale-100 translate-y-0 z-30' 
                        : index < activeStep
                        ? 'opacity-80 scale-95 translate-y-[-20px] z-20'
                        : 'opacity-0 scale-90 translate-y-[20px] z-10'
                    }`}
                  >
                    {step.imageContent}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Content Steps */}
            <div className="w-1/2 space-y-8">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  ref={(el) => { stepRefs.current[index] = el; }}
                  className="min-h-screen flex items-center py-8"
                >
                  <div className="w-full">
                    {/* Step Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-2xl">
                      <span className="inline-block px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-full mb-6">
                        {step.badge}
                      </span>
                      
                      <h3 className="text-3xl font-bold text-black mb-4">
                        {step.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                        {step.description}
                      </p>
                      
                      <ul className="space-y-3">
                        {step.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-black rounded-full mt-2.5 flex-shrink-0"></div>
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Progress indicator */}
                      <div className="flex items-center gap-2 mt-8">
                        {steps.map((_, dotIndex) => (
                          <div
                            key={dotIndex}
                            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                              dotIndex === index 
                                ? 'bg-blue-500' 
                                : dotIndex < index 
                                ? 'bg-gray-400' 
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HiringStepsSection;