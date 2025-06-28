"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, MapPin, Loader2, Upload, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

// Form validation schema
const formSchema = z.object({
  photo: z.any().optional().refine((file) => !file || file instanceof File, {
    message: "Photo must be a file",
  }).refine((file) => !file || file.size < 5000000, {
    message: "Photo must be less than 5MB",
  }).refine((file) => !file || file.type.startsWith('image/'), {
    message: "File must be an image",
  }),
  notes: z.string().max(200).optional(),
});

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export function ReportForm() {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // Debounced search for location suggestions
  const searchLocationSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      
      if (response.ok) {
        const results = await response.json();
        setLocationSuggestions(results);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounce the search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocationSuggestions(manualLocation);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [manualLocation, searchLocationSuggestions]);
  
  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      setLocationLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        toast({
          title: "Location found!",
          description: `Located within ${Math.round(position.coords.accuracy)}m accuracy.`,
        });
        setLocationLoading(false);
      },
      (error) => {
        let message = "Unable to get location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }
        toast({
          title: "Location error",
          description: message,
          variant: "destructive",
        });
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const selectLocationSuggestion = (suggestion: any) => {
    const latitude = parseFloat(suggestion.lat);
    const longitude = parseFloat(suggestion.lon);
    
    setLocation({
      latitude,
      longitude,
      accuracy: 100
    });
    
    setManualLocation(suggestion.display_name);
    setShowSuggestions(false);
    setLocationSuggestions([]);
    
    toast({
      title: "Location selected!",
      description: `${suggestion.display_name.split(',').slice(0, 2).join(', ')}`,
    });
  };

  const searchLocation = async () => {
    if (!manualLocation.trim()) {
      toast({
        title: "Address required",
        description: "Please enter an address to search.",
        variant: "destructive",
      });
      return;
    }

    // If we have suggestions, use the first one
    if (locationSuggestions.length > 0) {
      selectLocationSuggestion(locationSuggestions[0]);
      return;
    }

    setGeocoding(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation)}&limit=1&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const results = await response.json();
      
      if (results.length === 0) {
        toast({
          title: "Location not found",
          description: "Please try a more specific address or landmark.",
          variant: "destructive",
        });
        setGeocoding(false);
        return;
      }
      
      selectLocationSuggestion(results[0]);
      
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to find location. Please try again or use GPS.",
        variant: "destructive",
      });
    } finally {
      setGeocoding(false);
    }
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file before setting
      const validation = formSchema.shape.photo.safeParse(file);
      if (!validation.success) {
        toast({
          title: "Invalid file",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
      
      form.setValue('photo', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Photo selected",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
      });
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!location) {
      toast({
        title: "Location required",
        description: "Please allow location access to report a pothole.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 200);
      
      const formData = new FormData();
      formData.append('photo', values.photo);
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
      if (values.notes) formData.append('notes', values.notes);
      
      const response = await fetch('/api/reports', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const result = await response.json();
      
      if (response.ok) {
        setSubmitSuccess(true);
        toast({
          title: "Success!",
          description: "Pothole reported successfully. Thank you for helping make our roads safer!",
        });
        
        // Trigger map refresh by dispatching a custom event
        window.dispatchEvent(new CustomEvent('potholeReported', { 
          detail: result.report 
        }));
        
        // Reset form after success
        setTimeout(() => {
          form.reset();
          setPhotoPreview(null);
          setLocation(null);
          setManualLocation('');
          setSubmitSuccess(false);
          setUploadProgress(0);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to submit report');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit report. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full mx-auto bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white tracking-tight">
          <div className="p-2 bg-blue-500/20 backdrop-blur-sm rounded-2xl border border-blue-400/30">
            <Camera className="h-6 w-6 text-blue-400" />
          </div>
          Report a Pothole
        </CardTitle>
        <CardDescription className="text-lg text-white/70 font-light">
          Help make our roads safer by reporting road damage
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {submitSuccess ? (
          <div className="text-center space-y-6 py-12">
            <div className="w-20 h-20 bg-green-500/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto border border-green-400/30">
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">Report Submitted!</h3>
              <p className="text-white/70 font-light">Thank you for helping improve road safety.</p>
            </div>
            <Progress value={100} className="w-full h-2 rounded-full" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Location Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-semibold text-white">Location</label>
                  {location && (
                    <Badge className="bg-green-500/20 text-green-400 border border-green-400/30 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      Accuracy: {location.accuracy ? Math.round(location.accuracy) : 'Unknown'}m
                    </Badge>
                  )}
                </div>
                
                {location ? (
                  <Alert className="bg-green-500/20 border-green-400/40 backdrop-blur-sm rounded-2xl p-4">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <AlertDescription className="text-green-300 font-medium ml-2">
                      Location detected: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-blue-500/20 border-blue-400/40 backdrop-blur-sm rounded-2xl p-4">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                    <AlertDescription className="text-blue-300 font-medium ml-2">
                      Location access required to report potholes accurately.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 gap-4">
                  <Button
                    type="button"
                    variant={location ? "outline" : "default"}
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="w-full h-12 rounded-2xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {locationLoading && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                    <MapPin className="mr-3 h-5 w-5" />
                    {location ? 'Update GPS Location' : 'Use My Location'}
                  </Button>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/30"></div>
                    <span className="text-sm text-white/70 px-3 font-medium">OR</span>
                    <div className="flex-1 h-px bg-white/30"></div>
                  </div>
                  
                  <div className="relative">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Input
                          placeholder="Enter address or landmark (e.g., 123 Main St, City)"
                          value={manualLocation}
                          onChange={(e) => setManualLocation(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                          onFocus={() => locationSuggestions.length > 0 && setShowSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                          className="flex-1 h-12 rounded-2xl bg-white/10 border-white/30 focus:border-blue-400 focus:ring-blue-400 text-white placeholder:text-white/50 text-base pr-8 backdrop-blur-sm"
                        />
                        {searchLoading && (
                          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-white/70" />
                        )}
                        
                        {/* Suggestions Dropdown */}
                        {showSuggestions && locationSuggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 backdrop-blur-3xl border border-white/50 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto" style={{"backdropFilter": "blur(40px) saturate(1.8)"}}>
                            {locationSuggestions.map((suggestion, index) => (
                              <button
                                key={suggestion.place_id || index}
                                type="button"
                                onClick={() => selectLocationSuggestion(suggestion)}
                                className="w-full text-left px-4 py-3 hover:bg-white/20 first:rounded-t-2xl last:rounded-b-2xl border-b border-white/20 last:border-b-0 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <MapPin className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <div className="font-medium text-white truncate">
                                      {suggestion.display_name.split(',')[0]}
                                    </div>
                                    <div className="text-sm text-white/70 truncate">
                                      {suggestion.display_name.split(',').slice(1).join(',').trim()}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={searchLocation}
                        disabled={geocoding || searchLoading}
                        className="h-12 px-4 rounded-2xl border-gray-200 hover:bg-gray-50"
                      >
                        {(geocoding || searchLoading) ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Search className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Photo Upload Section */}
              <FormField
                control={form.control}
                name="photo"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-white">Photo</FormLabel>
                    <FormControl>
                      <div className="space-y-6">
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('photo-input')?.click()}
                            className="flex-1 h-12 rounded-2xl bg-white/10 border-white/30 hover:bg-white/20 text-white hover:text-white font-semibold backdrop-blur-sm"
                          >
                            <Camera className="h-5 w-5 mr-3" />
                            {value ? 'Change Photo' : 'Take Photo'}
                          </Button>
                          {photoPreview && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setPhotoDialogOpen(true)}
                              className="h-12 w-12 rounded-2xl bg-white/10 border-white/30 hover:bg-white/20 text-white hover:text-white backdrop-blur-sm"
                            >
                              <Upload className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                        <input
                          id="photo-input"
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={handlePhotoChange}
                          {...field}
                        />
                        {photoPreview && (
                          <div className="relative">
                            <img 
                              src={photoPreview} 
                              alt="Pothole preview" 
                              className="w-full h-52 object-cover rounded-3xl border-2 border-gray-200 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                              onClick={() => setPhotoDialogOpen(true)}
                            />
                            <Badge className="absolute top-4 right-4 bg-black/70 text-white border-0 px-3 py-1 rounded-full backdrop-blur-sm">
                              Click to view
                            </Badge>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription className="text-base text-white/70 font-light">
                      Take or upload a clear photo of the pothole. Max 5MB.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Notes Section */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-white">Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Very deep, near the school entrance, affects bike lane..."
                        className="resize-none rounded-2xl bg-white/10 border-white/30 focus:border-blue-400 focus:ring-blue-400 text-white placeholder:text-white/50 text-base backdrop-blur-sm"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-base text-white/70 font-light">
                      Any details that might help locate or assess the pothole (max 200 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Upload Progress */}
              {isSubmitting && (
                <div className="space-y-3 bg-blue-50 rounded-2xl p-4">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-blue-700">Uploading report...</span>
                    <span className="text-blue-600">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full h-2 rounded-full" />
                </div>
              )}
              
              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300" 
                disabled={isSubmitting || !location || !form.watch('photo')}
                size="lg"
              >
                {isSubmitting && <Loader2 className="mr-3 h-6 w-6 animate-spin" />}
                {isSubmitting ? 'Reporting Pothole...' : 'Report Pothole'}
              </Button>
              
              {(!location || !form.watch('photo')) && (
                <p className="text-base text-white/70 text-center font-light">
                  {!location && !form.watch('photo') ? 'Photo and location required' :
                   !location ? 'Location required' : 'Photo required'}
                </p>
              )}
            </form>
          </Form>
        )}
        
        {/* Photo Preview Dialog */}
        <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Photo Preview</DialogTitle>
            </DialogHeader>
            {photoPreview && (
              <img 
                src={photoPreview} 
                alt="Pothole preview" 
                className="w-full rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}