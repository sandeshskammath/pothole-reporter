'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, MapPin, Phone, Mail, Globe, Calendar, Search, Filter, Star, Heart, ExternalLink, Building } from 'lucide-react';

interface CommunityOrganization {
  id: number;
  name: string;
  type: 'government' | 'nonprofit' | 'civic_tech' | 'advocacy';
  city: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  focusAreas: string[];
  meetingSchedule?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  isActive: boolean;
  distance?: number;
  relevanceScore?: number;
}

interface OrganizationDirectory {
  organizations: CommunityOrganization[];
  totalCount: number;
  filterCounts: {
    government: number;
    nonprofit: number;
    civic_tech: number;
    advocacy: number;
  };
  focusAreaCounts: {
    [key: string]: number;
  };
}

interface CommunityHubProps {
  city: string;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  userInterests?: string[];
}

export function CommunityHub({ city, userLocation, userInterests }: CommunityHubProps) {
  const [directory, setDirectory] = useState<OrganizationDirectory | null>(null);
  const [recommendations, setRecommendations] = useState<CommunityOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedFocusArea, setSelectedFocusArea] = useState<string>('all');
  const [showRecommendations, setShowRecommendations] = useState(true);

  useEffect(() => {
    fetchDirectory();
    if (userLocation) {
      fetchRecommendations();
    }
  }, [city, selectedType, selectedFocusArea]);

  const fetchDirectory = async () => {
    try {
      setLoading(true);
      let url = `/api/community/directory?city=${encodeURIComponent(city)}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const data = await response.json();
      setDirectory(data.data);
      setError(null);
    } catch (err) {
      setError('Unable to load community organizations. Please try again.');
      console.error('Error fetching directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!userLocation) return;

    try {
      const interests = userInterests?.join(',') || '';
      const response = await fetch(
        `/api/community/recommendations?lat=${userLocation.latitude}&lng=${userLocation.longitude}&interests=${interests}&limit=5`
      );
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'government': return 'bg-blue-100 text-blue-800';
      case 'nonprofit': return 'bg-green-100 text-green-800';
      case 'civic_tech': return 'bg-purple-100 text-purple-800';
      case 'advocacy': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFocusArea = (area: string) => {
    return area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredOrganizations = directory?.organizations.filter(org => {
    const matchesSearch = searchTerm === '' || 
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || org.type === selectedType;
    
    const matchesFocusArea = selectedFocusArea === 'all' || 
      org.focusAreas.includes(selectedFocusArea);

    return matchesSearch && matchesType && matchesFocusArea;
  }) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community Action Hub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Action Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchDirectory} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Action Hub
          </CardTitle>
          <CardDescription>
            Connect with local organizations working on civic issues in {city}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Recommendations Section */}
      {recommendations.length > 0 && showRecommendations && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Recommended for You
                </CardTitle>
                <CardDescription>
                  Organizations near you that match your interests
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowRecommendations(false)}
              >
                Hide
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((org) => (
                <OrganizationCard key={org.id} organization={org} showDistance={true} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="nonprofit">Nonprofit</SelectItem>
                  <SelectItem value="civic_tech">Civic Tech</SelectItem>
                  <SelectItem value="advocacy">Advocacy</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedFocusArea} onValueChange={setSelectedFocusArea}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Focus Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Focus Areas</SelectItem>
                  {directory && Object.keys(directory.focusAreaCounts).map((area) => (
                    <SelectItem key={area} value={area}>
                      {formatFocusArea(area)} ({directory.focusAreaCounts[area]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {directory && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold">{directory.totalCount}</div>
              <div className="text-sm text-gray-600">Total Organizations</div>
            </CardContent>
          </Card>
          
          {Object.entries(directory.filterCounts).map(([type, count]) => (
            <Card key={type}>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrganizations.map((org) => (
          <OrganizationCard key={org.id} organization={org} />
        ))}
      </div>

      {filteredOrganizations.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No organizations found matching your criteria.</p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedType('all');
              setSelectedFocusArea('all');
            }} className="mt-4">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function OrganizationCard({ 
  organization, 
  showDistance = false 
}: { 
  organization: CommunityOrganization;
  showDistance?: boolean;
}) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'government': return 'bg-blue-100 text-blue-800';
      case 'nonprofit': return 'bg-green-100 text-green-800';
      case 'civic_tech': return 'bg-purple-100 text-purple-800';
      case 'advocacy': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFocusArea = (area: string) => {
    return area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{organization.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getTypeColor(organization.type)}>
                {organization.type.replace('_', ' ')}
              </Badge>
              {showDistance && organization.distance && (
                <Badge variant="outline">
                  {organization.distance.toFixed(1)} mi
                </Badge>
              )}
            </div>
          </div>
          {organization.relevanceScore && (
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm">{organization.relevanceScore}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {organization.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {organization.description}
            </p>
          )}

          {organization.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{organization.address}</span>
            </div>
          )}

          {organization.meetingSchedule && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{organization.meetingSchedule}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {organization.focusAreas.slice(0, 3).map((area, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {formatFocusArea(area)}
              </Badge>
            ))}
            {organization.focusAreas.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{organization.focusAreas.length - 3} more
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            {organization.contactPhone && (
              <Button size="sm" variant="outline" asChild>
                <a href={`tel:${organization.contactPhone}`}>
                  <Phone className="h-4 w-4" />
                </a>
              </Button>
            )}
            
            {organization.contactEmail && (
              <Button size="sm" variant="outline" asChild>
                <a href={`mailto:${organization.contactEmail}`}>
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            )}
            
            {organization.website && (
              <Button size="sm" variant="outline" asChild>
                <a href={organization.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4" />
                </a>
              </Button>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{organization.name}</DialogTitle>
                  <DialogDescription>
                    {organization.description}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-sm">Type</p>
                      <Badge className={getTypeColor(organization.type)}>
                        {organization.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {organization.meetingSchedule && (
                      <div>
                        <p className="font-medium text-sm">Meetings</p>
                        <p className="text-sm text-gray-600">{organization.meetingSchedule}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-sm mb-2">Focus Areas</p>
                    <div className="flex flex-wrap gap-1">
                      {organization.focusAreas.map((area, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {formatFocusArea(area)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {organization.contactPhone && (
                      <Button variant="outline" asChild className="justify-start">
                        <a href={`tel:${organization.contactPhone}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          {organization.contactPhone}
                        </a>
                      </Button>
                    )}
                    
                    {organization.contactEmail && (
                      <Button variant="outline" asChild className="justify-start">
                        <a href={`mailto:${organization.contactEmail}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          {organization.contactEmail}
                        </a>
                      </Button>
                    )}
                    
                    {organization.website && (
                      <Button variant="outline" asChild className="justify-start">
                        <a href={organization.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Visit Website
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}