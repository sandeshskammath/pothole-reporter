'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, MapPin, Users, ArrowRight, CheckCircle, Clock, Wrench, TrendingUp, Zap, Heart, Star, Shield } from 'lucide-react';
import { ReportForm } from '@/components/report-form';
import { PotholeMap } from '@/components/pothole-map';
import { GradientText } from '@/components/ui/gradient-text';
import { Noise } from '@/components/ui/noise';
import { SplashCursor } from '@/components/ui/splash-cursor';
import { StarBorder } from '@/components/ui/star-border';
import { SquaresBackground } from '@/components/ui/squares-background';
import Link from 'next/link';

interface Stats {
  totalReports: number;
  reportedCount: number;
  inProgressCount: number;
  fixedCount: number;
  communityMembers: number;
  impactScore: number;
}

// UI fixes: Fix hero text cutoff and button consistency - 10:25 AM
export default function Home() {
  const [stats, setStats] = useState<Stats>({
    totalReports: 0,
    reportedCount: 0,
    inProgressCount: 0,
    fixedCount: 0,
    communityMembers: 0,
    impactScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Background Effects */}
      <SquaresBackground 
        squareSize={35} 
        speed={15} 
        color="#60a5fa" 
        opacity={0.08} 
      />
      <Noise opacity={0.04} />
      
      {/* Apple-inspired Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Glass morphism background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent"></div>
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-6 py-20 lg:py-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="animate-fade-in-up">
              <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium rounded-full">
                <Shield className="mr-2 h-4 w-4" />
                Community-Driven Road Safety
              </Badge>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-normal tracking-tight">
                Making Roads
                <span className="block">
                  <GradientText 
                    colors={["#60a5fa", "#a855f7", "#60a5fa"]} 
                    animationSpeed={4}
                    className="block"
                  >
                    Safer Together
                  </GradientText>
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
                Join our community in creating safer roads for everyone. Report potholes instantly with your phone and help prioritize repairs in your neighborhood.
              </p>
            </div>
            
            <div className="animate-fade-in-up animation-delay-200 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/report">
                <StarBorder className="rounded-2xl" color="#3b82f6" speed={3}>
                  <Button size="lg" className="w-full sm:w-[200px] bg-blue-600 text-white hover:bg-blue-700 font-semibold px-10 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 group border border-blue-500/20 backdrop-blur-sm">
                    <Camera className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Report a Pothole
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </StarBorder>
              </Link>
              <StarBorder className="rounded-2xl" color="#8b5cf6" speed={2.5}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-[200px] border-2 border-white/40 text-white hover:bg-white/20 hover:text-white font-semibold px-10 py-5 rounded-2xl backdrop-blur-sm transition-all duration-300 bg-white/10"
                  onClick={() => document.getElementById('community-map')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <MapPin className="mr-3 h-5 w-5" />
                  View Map
                </Button>
              </StarBorder>
            </div>
            
            {/* Impact Stats */}
            <div className="animate-fade-in-up animation-delay-400 grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
              <div className="text-center bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {loading ? '...' : stats.totalReports}
                </div>
                <div className="text-gray-300 text-sm font-medium">Reports Filed</div>
              </div>
              <div className="text-center bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {loading ? '...' : stats.fixedCount}
                </div>
                <div className="text-gray-300 text-sm font-medium">Potholes Fixed</div>
              </div>
              <div className="text-center bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {loading ? '...' : stats.communityMembers}
                </div>
                <div className="text-gray-300 text-sm font-medium">Community Members</div>
              </div>
              <div className="text-center bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {loading ? '...' : stats.impactScore}%
                </div>
                <div className="text-gray-300 text-sm font-medium">Impact Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-20 space-y-20">
        {/* Subtle glass overlay for content sections */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none"></div>
      
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-16 px-6">
          <div className="lg:w-[38%]">
            <SplashCursor color="#3b82f6" size={80}>
              <ReportForm />
            </SplashCursor>
          </div>
          <div className="lg:w-[62%]" id="community-map">
            <SplashCursor color="#8b5cf6" size={90}>
              <PotholeMap />
            </SplashCursor>
          </div>
        </div>
      
        {/* Apple-style Dark Glass Stats Cards */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6 px-6">
          <Card className="border border-white/10 shadow-2xl bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden hover:bg-white/15 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-white/90">
                New Reports
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-red-500/80 to-red-600/80 rounded-2xl shadow-lg backdrop-blur-sm">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white mb-2">
                {loading ? '...' : stats.reportedCount}
              </div>
              <p className="text-sm text-red-400 font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Awaiting review
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-white/10 shadow-2xl bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden hover:bg-white/15 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-white/90">
                In Progress
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-orange-500/80 to-orange-600/80 rounded-2xl shadow-lg backdrop-blur-sm">
                <Wrench className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white mb-2">
                {loading ? '...' : stats.inProgressCount}
              </div>
              <p className="text-sm text-orange-400 font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Being repaired
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-white/10 shadow-2xl bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden hover:bg-white/15 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-white/90">
                Fixed Potholes
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-green-500/80 to-green-600/80 rounded-2xl shadow-lg backdrop-blur-sm">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white mb-2">
                {loading ? '...' : stats.fixedCount}
              </div>
              <p className="text-sm text-green-400 font-medium flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Community impact
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-white/10 shadow-2xl bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden hover:bg-white/15 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-white/90">
                Active Members
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-blue-500/80 to-blue-600/80 rounded-2xl shadow-lg backdrop-blur-sm">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white mb-2">
                {loading ? '...' : stats.communityMembers}
              </div>
              <p className="text-sm text-blue-400 font-medium flex items-center">
                <Heart className="h-4 w-4 mr-2" />
                Growing daily
              </p>
            </CardContent>
          </Card>
        </div>
      
        {/* How it Works - Dark Glass Theme */}
        <div className="relative text-center space-y-16 px-6">
          <div className="relative z-10">
            <h2 className="text-5xl font-bold text-white mb-6 tracking-tight">
              How It Works
            </h2>
            <p className="text-2xl text-white/70 max-w-3xl mx-auto font-light leading-relaxed">
              Three simple steps to make your community safer
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 max-w-6xl mx-auto">
            <div className="group text-center space-y-8">
              <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <Camera className="h-12 w-12 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">1. Take a Photo</h3>
                <p className="text-white/70 leading-relaxed text-lg font-light">
                  Snap a clear picture of the pothole with your phone. Our app makes it quick and easy.
                </p>
              </div>
            </div>
            
            <div className="group text-center space-y-8">
              <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <MapPin className="h-12 w-12 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">2. Confirm Location</h3>
                <p className="text-white/70 leading-relaxed text-lg font-light">
                  We automatically detect your location with GPS for accurate reporting and faster response.
                </p>
              </div>
            </div>
            
            <div className="group text-center space-y-8">
              <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">3. Make Impact</h3>
                <p className="text-white/70 leading-relaxed text-lg font-light">
                  Your report helps prioritize repairs and keeps the community informed about road conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      
        {/* Community Impact */}
        <div className="relative mx-6 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 rounded-[2.5rem] p-16 text-white text-center overflow-hidden">
          {/* Glass morphism background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent"></div>
            <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative max-w-4xl mx-auto space-y-12">
            <div>
              <h2 className="text-5xl font-bold mb-6 tracking-tight">
                Together, We're Making a Difference
              </h2>
              <p className="text-2xl text-gray-300 leading-relaxed font-light">
                Join thousands of community members who are actively improving road safety. Every report matters, every fix counts, and every voice makes our streets safer for everyone.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">{loading ? '...' : stats.totalReports}</div>
                <div className="text-gray-300 text-sm font-medium">Total Reports</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">{loading ? '...' : stats.fixedCount}</div>
                <div className="text-gray-300 text-sm font-medium">Roads Improved</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">{loading ? '...' : stats.communityMembers}</div>
                <div className="text-gray-300 text-sm font-medium">Active Members</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">{loading ? '...' : stats.impactScore}%</div>
                <div className="text-gray-300 text-sm font-medium">Impact Score</div>
              </div>
            </div>
            
            <Link href="/report">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-10 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 mt-12 border border-white/20">
                Join Our Community
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      
        {/* Call to Action - Dark Glass Theme */}
        <div className="relative text-center space-y-12 py-20 px-6">
          <div className="relative z-10">
            <h2 className="text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to Make a Difference?
            </h2>
            <p className="text-2xl text-white/70 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
              Join our community of citizens working together to improve road safety. Every report helps make our streets safer for everyone.
            </p>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/report">
              <Button size="lg" className="bg-blue-600/90 hover:bg-blue-700 text-white font-semibold px-12 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 group border border-blue-500/30 backdrop-blur-sm">
                <Camera className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                Report Your First Pothole
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-12 py-6 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:border-white/50"
              onClick={() => document.getElementById('community-map')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <MapPin className="mr-3 h-6 w-6" />
              Explore the Map
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
