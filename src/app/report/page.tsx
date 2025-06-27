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
      
      <Card className="mt-8 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">💡 How to Report</CardTitle>
          <CardDescription className="text-blue-700">
            Quick guide to reporting a pothole
          </CardDescription>
        </CardHeader>
        <CardContent className="text-blue-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="font-semibold">Allow Location</h3>
              <p className="text-sm">Enable GPS for accurate reporting</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="font-semibold">Take Photo</h3>
              <p className="text-sm">Capture a clear image of the damage</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-semibold">Submit Report</h3>
              <p className="text-sm">Help improve road safety in your area</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}