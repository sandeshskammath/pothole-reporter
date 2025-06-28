import { ReportForm } from '@/components/report-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto py-12 max-w-3xl">
        <ReportForm />
        
        <Card className="mt-12 border border-white/20 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">💡 How to Report</CardTitle>
            <CardDescription className="text-lg text-white/70 font-light">
              Quick guide to reporting a pothole
            </CardDescription>
          </CardHeader>
          <CardContent className="text-white/80 px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-3xl">📍</span>
                </div>
                <h3 className="text-xl font-bold text-white">Allow Location</h3>
                <p className="text-base text-white/70 font-light">Enable GPS for accurate reporting</p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-3xl">📸</span>
                </div>
                <h3 className="text-xl font-bold text-white">Take Photo</h3>
                <p className="text-base text-white/70 font-light">Capture a clear image of the damage</p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-xl font-bold text-white">Submit Report</h3>
                <p className="text-base text-white/70 font-light">Help improve road safety in your area</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}