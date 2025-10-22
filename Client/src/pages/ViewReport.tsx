import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, Download, User, Calendar, Hospital, User2 } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function ViewReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [report, setReport] = useState<any>(location.state?.report || null);
  const [loading, setLoading] = useState(!location.state?.report);

  useEffect(() => {
    if (!report && id) {
      setLoading(true);
      api.report.get(id)
        .then(res => {
          setReport(res.data || res);
        })
        .catch(error => {
          toast({
            title: "Error loading report",
            description: error instanceof Error ? error.message : "Could not load report details",
            variant: "destructive"
          });
          navigate("/dashboard");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, report, toast, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!report) {
    return <div className="flex items-center justify-center min-h-screen">Report not found</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">{report.title}</h1>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(report.date).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Hospital className="w-4 h-4 mr-2" />
              {report.hospital}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <User2 className="w-4 h-4 mr-2" />
              Dr. {report.doctor}
            </div>
            {report.familyMemberId && report.familyMemberId.name && (
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="w-4 h-4 mr-2" />
                {report.familyMemberId.name} ({report.familyMemberId.relation})
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Report Summary */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">AI Analysis</h2>
            {report.summary ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{report.summary}</pre>
              </div>
            ) : (
              <p className="text-muted-foreground">No AI analysis available for this report.</p>
            )}
          </Card>

          {/* Document Preview/Download */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Original Document</h2>
            {report.pdfUrl ? (
              <div className="space-y-4">
                <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                  <iframe
                    src={report.pdfUrl}
                    className="w-full h-full"
                    title="Report PDF"
                  />
                </div>
                <Button
                  onClick={() => window.open(report.pdfUrl, '_blank')}
                  className="w-full sm:w-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No document available</p>
              </div>
            )}
          </Card>

          {/* Additional Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
            <dl className="grid sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Test Type</dt>
                <dd className="mt-1 text-sm">{report.test}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Cost</dt>
                <dd className="mt-1 text-sm">${report.price}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
                <dd className="mt-1 text-sm">{new Date(report.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                <dd className="mt-1 text-sm">{new Date(report.updatedAt).toLocaleString()}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}