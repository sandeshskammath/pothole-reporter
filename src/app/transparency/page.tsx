'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, DollarSign, CloudSnow, Target, ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function TransparencyHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <BarChart3 className="h-4 w-4" />
            Government Transparency Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Data-Driven Accountability
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Track government performance, explore budget transparency, and understand how weather affects infrastructure in your community.
          </p>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Performance Dashboard */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 rounded-xl">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Performance Tracking</CardTitle>
                    <CardDescription className="text-gray-600">
                      Government accountability metrics
                    </CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Grade</span>
                  <Badge className="bg-green-100 text-green-800">B+</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Repair Time</span>
                  <span className="text-sm font-medium">12.4 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-sm font-medium">87%</span>
                </div>
                <Link href="/transparency/performance">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    View Performance Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Budget Dashboard */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-600 rounded-xl">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Budget Transparency</CardTitle>
                    <CardDescription className="text-gray-600">
                      How taxpayer money is spent
                    </CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">FY 2024 Budget</span>
                  <span className="text-sm font-medium">$24.6M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Spent to Date</span>
                  <span className="text-sm font-medium">$18.2M (74%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cost per Repair</span>
                  <span className="text-sm font-medium">$890</span>
                </div>
                <Link href="/transparency/budget">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Explore Budget Data
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Weather Insights */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-600 rounded-xl">
                    <CloudSnow className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Weather Insights</CardTitle>
                    <CardDescription className="text-gray-600">
                      AI-powered pothole predictions
                    </CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Weather Correlation</span>
                  <span className="text-sm font-medium">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Alerts</span>
                  <Badge className="bg-orange-100 text-orange-800">2 High Risk</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Predictions</span>
                  <span className="text-sm font-medium">15 locations</span>
                </div>
                <Link href="/transparency/weather">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    View Weather Analysis
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Key Insights This Month
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
              <TrendingUp className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Performance Improving</h3>
                <p className="text-sm text-gray-600">
                  Average repair time decreased by 15% compared to last month
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
              <DollarSign className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Budget on Track</h3>
                <p className="text-sm text-gray-600">
                  Infrastructure spending is 3% under budget this fiscal year
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-orange-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Weather Alert</h3>
                <p className="text-sm text-gray-600">
                  Freeze-thaw cycles expected next week may increase pothole formation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How Transparency Works */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">How We Ensure Transparency</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Data</h3>
              <p className="text-gray-600">
                All metrics are updated in real-time from official government sources and public records.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Open Budget</h3>
              <p className="text-gray-600">
                Complete visibility into how municipal funds are allocated and spent on infrastructure.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Accountability</h3>
              <p className="text-gray-600">
                Performance grades and alerts ensure government promises translate into action.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}