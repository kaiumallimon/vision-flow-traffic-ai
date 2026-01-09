"use client";

import { Upload, Cpu, FileCheck, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    number: '01',
    title: 'Upload Image',
    description: 'Select a traffic image from your device or camera',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
  },
  {
    icon: Cpu,
    number: '02',
    title: 'AI Processing',
    description: 'Our AI analyzes the image with advanced algorithms',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    icon: FileCheck,
    number: '03',
    title: 'Get Results',
    description: 'View detailed detection results and insights',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  {
    icon: TrendingUp,
    number: '04',
    title: 'Track Analytics',
    description: 'Monitor trends and analyze traffic patterns',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16 space-y-3 sm:space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              How It
            </span>{' '}
            <span className="bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Simple steps to analyze your traffic images with AI
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div
                  className={`${step.bgColor} ${step.borderColor} border-2 rounded-2xl p-6 sm:p-8 text-center hover:shadow-lg transition-all duration-300 group`}
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border ${step.borderColor}`}
                    >
                      <Icon className={`w-8 h-8 ${step.color}`} />
                    </div>

                    <div className={`text-4xl font-bold ${step.color} opacity-50`}>
                      {step.number}
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent z-10"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
