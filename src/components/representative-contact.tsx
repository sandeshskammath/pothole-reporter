'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, Mail, MapPin, MessageSquare, ExternalLink, User, Building, Clock, CheckCircle } from 'lucide-react';

interface ContactMethod {
  type: 'email' | 'phone' | 'mail' | 'social';
  value: string;
  label: string;
}

interface Representative {
  name: string;
  office: string;
  level: 'federal' | 'state' | 'local';
  contactMethods: ContactMethod[];
  messageTemplate: string;
}

interface RepresentativeContactProps {
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  potholeReportId?: string;
}

export function RepresentativeContact({ location, potholeReportId }: RepresentativeContactProps) {
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [contactHistory, setContactHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchRepresentatives();
    if (potholeReportId) {
      fetchContactHistory();
    }
  }, [location]);

  const fetchRepresentatives = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/representatives?lat=${location.latitude}&lng=${location.longitude}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch representatives');
      }

      const data = await response.json();
      setRepresentatives(data.data || []);
      setError(null);
    } catch (err) {
      setError('Unable to load representatives. Please try again.');
      console.error('Error fetching representatives:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactHistory = async () => {
    if (!potholeReportId) return;
    
    try {
      const response = await fetch(`/api/representatives/history?reportId=${potholeReportId}`);
      if (response.ok) {
        const data = await response.json();
        setContactHistory(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching contact history:', err);
    }
  };

  const handleContactRep = (rep: Representative, contactType: string) => {
    setSelectedRep(rep);
    setCustomMessage(rep.messageTemplate.replace(
      '[Location will be automatically filled]',
      location.address || `${location.latitude}, ${location.longitude}`
    ));
  };

  const saveContactRecord = async (contactType: string) => {
    if (!selectedRep || !potholeReportId) return;

    try {
      await fetch('/api/representatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          potholeReportId,
          representative: selectedRep,
          contactType,
          messageTemplate: customMessage
        })
      });
      
      fetchContactHistory(); // Refresh history
    } catch (err) {
      console.error('Error saving contact record:', err);
    }
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'mail': return <MapPin className="h-4 w-4" />;
      case 'social': return <MessageSquare className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'federal': return 'bg-blue-100 text-blue-800';
      case 'state': return 'bg-green-100 text-green-800';
      case 'local': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Report to Your Representatives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Report to Your Representatives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchRepresentatives} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Report to Your Representatives
          </CardTitle>
          <CardDescription>
            Contact your elected officials about this pothole issue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {representatives.map((rep, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{rep.name}</h3>
                      <Badge className={getLevelColor(rep.level)}>
                        {rep.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {rep.office}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {rep.contactMethods.map((method, methodIndex) => (
                        <Dialog key={methodIndex}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleContactRep(rep, method.type)}
                              className="flex items-center gap-1"
                            >
                              {getContactIcon(method.type)}
                              {method.label}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Contact {rep.name}</DialogTitle>
                              <DialogDescription>
                                {method.type === 'email' ? 'Send an email' : 
                                 method.type === 'phone' ? 'Call' :
                                 method.type === 'mail' ? 'Send mail to' : 'Contact via'} {method.label}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium text-sm">Contact Information:</p>
                                <p className="text-sm">{method.value}</p>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Message Template:
                                </label>
                                <Textarea
                                  value={customMessage}
                                  onChange={(e) => setCustomMessage(e.target.value)}
                                  rows={12}
                                  className="text-sm"
                                />
                              </div>
                              
                              <div className="flex gap-2">
                                {method.type === 'email' && (
                                  <Button
                                    onClick={() => {
                                      const subject = encodeURIComponent('Pothole Repair Request');
                                      const body = encodeURIComponent(customMessage);
                                      window.open(`mailto:${method.value}?subject=${subject}&body=${body}`);
                                      saveContactRecord('email');
                                    }}
                                  >
                                    Open Email App
                                  </Button>
                                )}
                                {method.type === 'phone' && (
                                  <Button
                                    onClick={() => {
                                      window.open(`tel:${method.value}`);
                                      saveContactRecord('phone');
                                    }}
                                  >
                                    Call Now
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    navigator.clipboard.writeText(customMessage);
                                    saveContactRecord(method.type);
                                  }}
                                >
                                  Copy Message
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {contactHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Contact History
            </CardTitle>
            <CardDescription>
              Previous contacts made for this pothole report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contactHistory.map((contact, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      Contacted {contact.representative_name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {contact.representative_office} • via {contact.contact_type} • {new Date(contact.contact_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}