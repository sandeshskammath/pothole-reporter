'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building, Phone, Mail, ArrowRight, Star, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function CivicActionHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Users className="h-4 w-4" />
            Civic Engagement Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Take Action in Your Community
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Beyond reporting potholes, engage with your local government and community organizations to create lasting change.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Contact Representatives */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 rounded-xl">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Contact Representatives</CardTitle>
                    <CardDescription className="text-gray-600">
                      Reach out to your elected officials about infrastructure issues
                    </CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>Phone & Email</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>Message Templates</span>
                  </div>
                </div>
                <Link href="/civic/representatives">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Find My Representatives
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Community Organizations */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-600 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Community Organizations</CardTitle>
                    <CardDescription className="text-gray-600">
                      Connect with local groups working on civic issues
                    </CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>Nearby Groups</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Events & Meetings</span>
                  </div>
                </div>
                <Link href="/civic/organizations">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Discover Organizations
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact Stats */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Community Impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">127</div>
              <div className="text-sm text-gray-600">Representatives Contacted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">43</div>
              <div className="text-sm text-gray-600">Organizations Connected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">89%</div>
              <div className="text-sm text-gray-600">Response Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">$2.4M</div>
              <div className="text-sm text-gray-600">Infrastructure Funding</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">How Civic Action Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Report Issues</h3>
              <p className="text-gray-600">
                Document infrastructure problems in your community through our reporting system.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Contact Officials</h3>
              <p className="text-gray-600">
                Use our tools to reach out to the right representatives with professional messaging.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Drive Change</h3>
              <p className="text-gray-600">
                Track progress and collaborate with community organizations for lasting impact.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}