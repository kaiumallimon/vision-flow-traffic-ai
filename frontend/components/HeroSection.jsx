"use client";

import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Activity, Camera } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function HeroSection({ isLoggedIn }) {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[calc(100vh-5rem)] flex items-center overflow-hidden pt-40 pb-8 bg-gradient-to-br from-cyan-50 via-white to-blue-50"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-float"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${
              mousePosition.y * 0.02
            }px)`,
          }}
        />
        <div
          className="absolute top-40 right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-float-delayed"
          style={{
            transform: `translate(${mousePosition.x * -0.015}px, ${
              mousePosition.y * -0.015
            }px)`,
          }}
        />
        <div
          className="absolute bottom-20 left-1/3 w-72 h-72 bg-indigo-400/15 rounded-full blur-3xl animate-float-slow"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${
              mousePosition.y * 0.01
            }px)`,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e920_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e920_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          {/* Left Content - 60% */}
          <div className="lg:col-span-3 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-cyan-200 bg-cyan-50 backdrop-blur-sm mt-10 md:mt-0">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-600" />
              <span className="text-xs sm:text-sm font-medium text-cyan-700">
                AI-Powered Traffic Analysis
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Smart Traffic,
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Visualized.
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto lg:mx-0">
                Real-time detection starts here.
              </p>
            </div>

            {/* Sub-heading */}
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              From traffic cameras to live feeds—analyze your traffic in one unified AI ecosystem.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2 sm:pt-4">
              {isLoggedIn ? (
                <Link href="/dashboard/analyze">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gap-2 text-base px-6 sm:px-8 py-5 sm:py-6 rounded-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  >
                    <Activity className="h-5 w-5" />
                    Start Analyzing
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gap-2 text-base px-6 sm:px-8 py-5 sm:py-6 rounded-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  >
                    <Activity className="h-5 w-5" />
                    Get Started Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Stats/Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 justify-center lg:justify-start pt-4 sm:pt-6">
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Real-Time
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Processing</div>
              </div>
              <div className="h-10 w-px bg-gray-300" />
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  AI
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Powered</div>
              </div>
              <div className="h-10 w-px bg-gray-300" />
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Cloud
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Connected</div>
              </div>
            </div>
          </div>

          {/* Right Content - 40% Interactive Device Showcase */}
          <div className="lg:col-span-2 relative mt-20">
            <div className="relative max-w-lg mx-auto lg:max-w-none">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-blue-400/20 to-indigo-400/30 rounded-3xl blur-3xl group-hover:blur-[80px] transition-all duration-700" />

                <div className="relative bg-white/80 backdrop-blur-xl border border-cyan-200/50 rounded-3xl p-6 shadow-2xl shadow-cyan-500/10">
                  <div className="aspect-square relative max-w-sm mx-auto">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute inset-6 rounded-full border-2 border-cyan-400/30 animate-spin-slow" />
                      <div className="absolute inset-10 rounded-full border-2 border-blue-400/30 animate-spin-reverse" />
                      <div className="absolute inset-14 rounded-full border border-indigo-400/30 animate-spin-slower" />

                      <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-2xl shadow-cyan-500/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/40 to-transparent" />

                        <svg
                          className="w-24 h-24 text-white relative z-10"
                          viewBox="0 0 100 100"
                          fill="none"
                        >
                          <path
                            d="M 10 50 L 30 50 L 35 30 L 40 70 L 45 40 L 50 50 L 70 50"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="animate-pulse-line"
                          />
                          <circle cx="50" cy="50" r="4" fill="currentColor" className="animate-pulse">
                            <animate
                              attributeName="r"
                              values="4;8;4"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              values="1;0.3;1"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        </svg>
                      </div>

                      <div className="absolute top-8 right-8 w-16 h-16 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center animate-float border border-cyan-100">
                        <div className="text-xl font-bold text-cyan-600">95%</div>
                        <div className="text-[10px] text-gray-500 font-medium">Accuracy</div>
                        <div className="text-[8px] text-cyan-600 mt-0.5">High</div>
                      </div>

                      <div className="absolute bottom-8 left-8 w-14 h-14 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center animate-float-delayed border border-blue-100">
                        <Camera className="w-6 h-6 text-blue-500 mb-0.5" />
                        <div className="text-[8px] text-gray-600 font-medium">Live Feed</div>
                      </div>

                      <div className="absolute top-1/2 right-2 w-12 h-12 bg-white rounded-full shadow-lg flex flex-col items-center justify-center animate-float-slow border border-indigo-100">
                        <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse mb-0.5" />
                        <div className="text-[8px] text-gray-600 font-medium">Active</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-center space-y-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      Vision Flow AI System
                    </h3>
                    <p className="text-xs text-gray-600">
                      Real-time traffic detection • Advanced AI processing
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 text-cyan-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Fast Detection</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Cloud Sync</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
