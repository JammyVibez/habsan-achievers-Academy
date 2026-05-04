'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, CheckCircle, XCircle, Loader2 } from 'lucide-react';

type DocumentsFlags = {
  birthCertificate: boolean;
  schoolReportCard: boolean;
  passportPhotos: boolean;
  parentID: boolean;
  proofOfResidence: boolean;
  medicalCertificate: boolean;
};

export type AdmissionApplicationRow = {
  id: string;
  applicationRef: string;
  studentName: string;
  classLevel: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  applicationDate: string;
  status: string;
  documents: DocumentsFlags;
};

export default function AdminAdmissionsApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<AdmissionApplicationRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedApp, setSelectedApp] = useState<AdmissionApplicationRow | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [approvalNotice, setApprovalNotice] = useState<{
    applicationRef: string;
    admissionNumber: string;
    studentEmail: string;
    defaultPassword: string;
  } | null>(null);

  const loadApplications = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const res = await fetch('/api/admissions/applications?status=pending', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load applications');
      }
      setApplications(data.applications as AdmissionApplicationRow[]);
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Failed to load applications');
    } finally {
      setLoadingList(false);
    }
  }, [router]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  async function handleApprove() {
    if (!selectedApp) return;
    setIsApproving(true);
    setActionError(null);
    setApprovalNotice(null);

    try {
      const res = await fetch('/api/admissions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ applicationRef: selectedApp.applicationRef }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve application');
      }

      setApprovalNotice({
        applicationRef: selectedApp.applicationRef,
        admissionNumber: data.admissionNumber,
        studentEmail: data.studentEmail,
        defaultPassword: data.defaultPassword,
      });
      setSelectedApp(null);
      await loadApplications();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to approve');
    } finally {
      setIsApproving(false);
    }
  }

  async function handleReject() {
    if (!selectedApp) return;
    setIsRejecting(true);
    setActionError(null);

    try {
      const res = await fetch('/api/admissions/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ applicationRef: selectedApp.applicationRef }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reject application');
      }

      setSelectedApp(null);
      await loadApplications();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to reject');
    } finally {
      setIsRejecting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Admission Applications</h1>
          <p className="text-muted-foreground">Review and manage pending student admission applications</p>
        </div>
        <Button variant="outline" onClick={() => void loadApplications()} disabled={loadingList}>
          {loadingList ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing
            </>
          ) : (
            'Refresh'
          )}
        </Button>
      </div>

      {approvalNotice && (
        <Alert>
          <AlertDescription className="space-y-2 text-sm">
            <p className="font-semibold">Application approved — share these login details with the parent</p>
            <p>
              <span className="text-muted-foreground">Reference:</span>{' '}
              <span className="font-mono">{approvalNotice.applicationRef}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Admission number:</span>{' '}
              <span className="font-mono">{approvalNotice.admissionNumber}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Student email:</span>{' '}
              <span className="font-mono break-all">{approvalNotice.studentEmail}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Temporary password:</span>{' '}
              <span className="font-mono">{approvalNotice.defaultPassword}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              The student should sign in and complete onboarding (password change) if required.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {listError && (
        <Alert variant="destructive">
          <AlertDescription>{listError}</AlertDescription>
        </Alert>
      )}

      {loadingList ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading applications…
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No pending applications right now.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="truncate">{app.studentName}</CardTitle>
                    <CardDescription className="break-words">
                      Ref <span className="font-mono">{app.applicationRef}</span> · {app.classLevel}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    Pending Review
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Parent</p>
                    <p className="font-medium">{app.parentName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium text-xs break-all">{app.parentEmail}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{app.parentPhone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Applied</p>
                    <p className="font-medium">{new Date(app.applicationDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-3">Documents Submitted</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {(
                      [
                        ['Birth Certificate', app.documents.birthCertificate],
                        ['School Report Card', app.documents.schoolReportCard],
                        ['Passport Photos', app.documents.passportPhotos],
                        ['Parent ID', app.documents.parentID],
                        ['Proof of Residence', app.documents.proofOfResidence],
                        ['Medical Certificate', app.documents.medicalCertificate],
                      ] as const
                    ).map(([label, ok]) => (
                      <div key={label} className="flex items-center gap-2">
                        {ok ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedApp(app)} className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => setSelectedApp(app)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedApp && (
        <Dialog open={true} onOpenChange={(open) => !open && setSelectedApp(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedApp.studentName}</DialogTitle>
              <DialogDescription>
                Application <span className="font-mono">{selectedApp.applicationRef}</span>
              </DialogDescription>
            </DialogHeader>

            {actionError && (
              <Alert variant="destructive">
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6 py-4">
              <div>
                <h3 className="font-semibold mb-3">Student Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedApp.studentName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Class Level</p>
                    <p className="font-medium">{selectedApp.classLevel}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Parent/Guardian Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedApp.parentName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium break-all">{selectedApp.parentEmail}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedApp.parentPhone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Application Date</p>
                    <p className="font-medium">{new Date(selectedApp.applicationDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Documents</h3>
                <div className="space-y-2 text-sm">
                  {(
                    [
                      ['Birth Certificate', selectedApp.documents.birthCertificate],
                      ['School Report Card', selectedApp.documents.schoolReportCard],
                      ['Passport Photos', selectedApp.documents.passportPhotos],
                      ['Parent ID Card', selectedApp.documents.parentID],
                      ['Proof of Residence', selectedApp.documents.proofOfResidence],
                      ['Medical Certificate', selectedApp.documents.medicalCertificate],
                    ] as const
                  ).map(([label, ok]) => (
                    <div key={label} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>{label}</span>
                      {ok ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="destructive" onClick={handleReject} disabled={isRejecting || isApproving} className="flex-1">
                  {isRejecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Application
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isApproving || isRejecting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve & Create Account
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
