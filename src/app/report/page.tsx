import { ReportForm } from '@/components/report-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportPage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Report a Pothole
        </h1>
        <p className="text-lg text-muted-foreground">
          Help improve road safety in your community
        </p>
      </div>
      
      <ReportForm />
      
      <Card className="mt-8 border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-800">📋 Testing Instructions</CardTitle>
          <CardDescription className="text-amber-700">
            How to test the report form functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="text-amber-700">
          <ol className="list-decimal list-inside space-y-2">
            <li>Click "Get My Location" and allow location access</li>
            <li>Click "Take Photo" and select an image file</li>
            <li>Add optional notes about the pothole</li>
            <li>Click "Report Pothole" to submit</li>
            <li>Watch for success message and form reset</li>
          </ol>
          <p className="mt-4 text-sm">
            <strong>Note:</strong> The form requires both location and photo before submission is enabled.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}