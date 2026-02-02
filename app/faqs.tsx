"use client"
import React, { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

const FAQSection = () => {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const faqData = [
    {
      id: 1,
      question: "How does Recruit AI improve the hiring process?",
      answer: "Recruit AI streamlines hiring by automating resume screening, identifying top candidates through intelligent matching algorithms, and providing data-driven insights. It reduces time-to-hire by up to 70% while improving candidate quality through advanced natural language processing and predictive analytics."
    },
    {
      id: 2,
      question: "Is Recruit AI biased in its hiring decisions?",
      answer: "Recruit AI is designed with fairness and bias mitigation at its core. Our algorithms are regularly audited for bias, trained on diverse datasets, and include built-in safeguards to ensure equitable evaluation. We provide transparency reports and allow customization of evaluation criteria to align with your diversity and inclusion goals."
    },
    {
      id: 3,
      question: "Can I integrate Recruit AI with my existing HR tools?",
      answer: "Yes, Recruit AI offers seamless integration with over 100+ popular HR platforms including Workday, BambooHR, Greenhouse, Lever, and more. Our API-first approach ensures easy connectivity with your existing ATS, HRIS, and other recruitment tools, maintaining your current workflow while enhancing it with AI capabilities."
    },
    {
      id: 4,
      question: "What industries can use Recruit AI?",
      answer: "Recruit AI is versatile and serves multiple industries including technology, healthcare, finance, manufacturing, retail, consulting, and more. Our AI models are trained to understand industry-specific requirements, terminology, and skill sets, making it effective across diverse sectors from startups to Fortune 500 companies."
    }
  ];

  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
          Frequently Asked
        </h1>
        <h1 className="text-4xl font-bold text-gray-900 mb-8 tracking-tight">
          Questions
        </h1>
      </div>

      <div className="space-y-4">
        {faqData.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              aria-expanded={openItem === item.id}
            >
              <span className="text-lg font-medium text-gray-900 pr-4">
                {item.question}
              </span>
              <div className="flex-shrink-0">
                {openItem === item.id ? (
                  <ChevronDown 
                    className="w-5 h-5 text-gray-600 transform rotate-180 transition-transform duration-300 ease-in-out" 
                  />
                ) : (
                  <Plus 
                    className="w-5 h-5 text-gray-600 transition-transform duration-300 ease-in-out" 
                  />
                )}
              </div>
            </button>
            
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openItem === item.id
                  ? 'max-h-96 opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-5 pt-2">
                <div
                  className={`text-gray-700 leading-relaxed transform transition-all duration-300 ease-in-out ${
                    openItem === item.id
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-2 opacity-0'
                  }`}
                >
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Decorative elements */}
      <div className="mt-16 flex justify-center">
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
      </div>
    </div>
  );
};

export default FAQSection;