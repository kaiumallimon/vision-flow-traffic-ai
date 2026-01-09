"use client";

import { Card } from '@/components/ui/card';
import { Brain, Zap, Shield } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Accuracy',
    description:
      'Vision Flow AI is engineered with next-generation neural network technology that delivers real-time, highly precise traffic detection. Its advanced deep learning algorithm minimizes errors and ensures accurate results comparable to professional traffic systems. With a detection accuracy of 95%+, users can confidently track their traffic patterns for better decision-making.',
    gradient: 'from-cyan-500/10 to-teal-500/10',
    iconColor: 'text-cyan-600',
  },
  {
    icon: Zap,
    title: 'Real-Time Analysis',
    description:
      'Vision Flow is built for consistent performance, providing stable and accurate detections throughout any session. The system maintains precision without the need for manual calibration, remaining unaffected by lighting changes, camera angles, or environmental conditions. With seamless cloud integration, users enjoy continuous, reliable traffic monitoring and real-time insights anytime, anywhere.',
    gradient: 'from-blue-500/10 to-cyan-500/10',
    iconColor: 'text-blue-600',
  },
  {
    icon: Shield,
    title: 'Data Security',
    description:
      'Designed with user privacy in mind, Vision Flow uses encrypted cloud storage that keeps your data safe and secure. It features automatic backup and secure data transmission, helping users maintain data integrity and privacy. All detections are processed with enterprise-grade security protocols.',
    gradient: 'from-indigo-500/10 to-blue-500/10',
    iconColor: 'text-indigo-600',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e920_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e920_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-12 sm:mb-16 space-y-3 sm:space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Why Choose
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
              Vision Flow AI
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced AI technology meets user-friendly design
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden bg-white border-gray-200 hover:border-cyan-300 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="p-6 sm:p-8 space-y-4">
                  <div
                    className={`w-full aspect-[2/1] rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg border border-gray-100">
                      <Icon className={`h-8 w-8 sm:h-10 sm:w-10 ${feature.iconColor}`} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
