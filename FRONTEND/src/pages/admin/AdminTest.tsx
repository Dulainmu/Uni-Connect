import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/adminService";

const AdminTest = () => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testAdminAPI = async () => {
    setLoading(true);
    setTestResult("Testing admin API...");
    
    try {
      const stats = await adminService.getAdminStats();
      setTestResult(`✅ Admin API working! Stats: ${JSON.stringify(stats, null, 2)}`);
    } catch (error: any) {
      setTestResult(`❌ Admin API failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = () => {
    const token = localStorage.getItem('token');
    setTestResult(`User: ${JSON.stringify(user, null, 2)}\n\nToken: ${token ? 'Present' : 'Missing'}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Test Page</h1>
        <p className="text-muted-foreground">Test admin functionality and API connections</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">API Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testAdminAPI} 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Testing..." : "Test Admin Stats API"}
            </Button>
            <Button 
              onClick={testAuth}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Check Authentication
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap overflow-auto max-h-96">
              {testResult || "Click a test button to see results..."}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTest;