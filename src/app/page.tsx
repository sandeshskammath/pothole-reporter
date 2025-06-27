'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, MapPin, Users, ArrowRight, CheckCircle, Clock, Wrench, TrendingUp, Zap, Heart } from 'lucide-react';
import { ReportForm } from '@/components/report-form';
import { PotholeMap } from '@/components/pothole-map';
import Link from 'next/link';

interface Stats {
  totalReports: number;
  reportedCount: number;
  inProgressCount: number;
  fixedCount: number;
  communityMembers: number;
  impactScore: number;
}

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/5"></div>
        </div>
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="animate-fade-in-up">
              <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
                🚀 Community-Driven Road Safety
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Making Roads Safer,
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  One Report at a Time
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto">
                Join our community in creating safer roads for everyone. Report potholes instantly with your phone and help prioritize repairs in your neighborhood.
              </p>
            </div>
            
            <div className="animate-fade-in-up animation-delay-200 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/report">
                <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group border-2 border-yellow-500">
                  <Camera className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Report a Pothole
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 rounded-full transition-all duration-300">
                <MapPin className="mr-2 h-5 w-5" />
                View Map
              </Button>
            </div>
            
            {/* Impact Stats */}
            <div className="animate-fade-in-up animation-delay-400 grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {loading ? '...' : stats.totalReports}
                </div>
                <div className="text-blue-200 text-sm uppercase tracking-wide">Reports Filed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {loading ? '...' : stats.fixedCount}
                </div>
                <div className="text-blue-200 text-sm uppercase tracking-wide">Potholes Fixed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {loading ? '...' : stats.communityMembers}
                </div>
                <div className="text-blue-200 text-sm uppercase tracking-wide">Community Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {loading ? '...' : stats.impactScore}%
                </div>
                <div className="text-blue-200 text-sm uppercase tracking-wide">Impact Score</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-300/20 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-300/20 rounded-full animate-float animation-delay-2000"></div>
      </div>

      <div className="container mx-auto py-16 space-y-16">
      
        {/* Real-time Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                New Reports
              </CardTitle>
              <div className="p-2 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors">
                <Camera className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? '...' : stats.reportedCount}
              </div>
              <p className="text-xs text-red-600 font-medium flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Awaiting review
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                In Progress
              </CardTitle>
              <div className="p-2 bg-yellow-100 rounded-full group-hover:bg-yellow-200 transition-colors">
                <Wrench className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? '...' : stats.inProgressCount}
              </div>
              <p className="text-xs text-yellow-600 font-medium flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Being repaired
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Fixed Potholes
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? '...' : stats.fixedCount}
              </div>
              <p className="text-xs text-green-600 font-medium flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                Community impact
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Members
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? '...' : stats.communityMembers}
              </div>
              <p className="text-xs text-blue-600 font-medium flex items-center">
                <Heart className="h-3 w-3 mr-1" />
                Growing daily
              </p>
            </CardContent>
          </Card>
        </div>
      
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Report a Pothole
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Help improve road safety in your community. It takes less than 2 minutes to make a difference.
              </p>
            </div>
            <ReportForm />
          </div>
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Live Community Map
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                See real-time reports from your community and track the progress of road repairs.
              </p>
            </div>
            <PotholeMap />
          </div>
        </div>
      
        {/* How it Works */}
        <div className="text-center space-y-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to make your community safer
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="group text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Camera className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">1. Take a Photo</h3>
                <p className="text-gray-600 leading-relaxed">
                  Snap a clear picture of the pothole with your phone. Our app makes it quick and easy.
                </p>
              </div>
            </div>
            
            <div className="group text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">2. Confirm Location</h3>
                <p className="text-gray-600 leading-relaxed">
                  We automatically detect your location with GPS for accurate reporting and faster response.
                </p>
              </div>
            </div>
            
            <div className="group text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">3. Make Impact</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your report helps prioritize repairs and keeps the community informed about road conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      
        {/* Community Impact */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-12 text-white text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold mb-4">
              Together, We're Making a Difference
            </h2>
            <p className="text-xl text-green-100 leading-relaxed">
              Join thousands of community members who are actively improving road safety. Every report matters, every fix counts, and every voice makes our streets safer for everyone.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              <div>
                <div className="text-3xl font-bold mb-2">{loading ? '...' : stats.totalReports}</div>
                <div className="text-green-200 text-sm uppercase tracking-wide">Total Reports</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">{loading ? '...' : stats.fixedCount}</div>
                <div className="text-green-200 text-sm uppercase tracking-wide">Roads Improved</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">{loading ? '...' : stats.communityMembers}</div>
                <div className="text-green-200 text-sm uppercase tracking-wide">Active Members</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">{loading ? '...' : stats.impactScore}%</div>
                <div className="text-green-200 text-sm uppercase tracking-wide">Impact Score</div>
              </div>
            </div>
            
            <Link href="/report">
              <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 mt-8">
                Join Our Community
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      
        {/* Call to Action */}
        <div className="text-center space-y-8 py-16">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Join our community of citizens working together to improve road safety. Every report helps make our streets safer for everyone.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/report">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Camera className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Report Your First Pothole
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-8 py-4 rounded-full">
              <MapPin className="mr-2 h-5 w-5" />
              Explore the Map
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
