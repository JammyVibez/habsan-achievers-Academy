'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { StudentCreationData } from '@/lib/student-utils';

interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: string[];
  onStudentAdded?: () => void;
}

export function AddStudentModal({ open, onOpenChange, classes, onStudentAdded }: AddStudentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdStudent, setCreatedStudent] = useState<any>(null);
  const [liveClasses, setLiveClasses] = useState<string[]>(classes);

  const [formData, setFormData] = useState<StudentCreationData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    classAssigned: '',
    parentEmail: '',
    parentPhone: '',
    address: '',
    medicalInfo: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.firstName.trim()) throw new Error('First name is required');
      if (!formData.lastName.trim()) throw new Error('Last name is required');
      if (!formData.dateOfBirth) throw new Error('Date of birth is required');
      if (!formData.classAssigned) throw new Error('Class assignment is required');
      if (!formData.parentEmail.trim()) throw new Error('Parent email is required');
      if (!formData.parentPhone.trim()) throw new Error('Parent phone is required');

      // Call API to create student
      const response = await fetch('/api/students/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create student');
      }

      setSuccess(true);
      setCreatedStudent(data.student);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        classAssigned: '',
        parentEmail: '',
        parentPhone: '',
        address: '',
        medicalInfo: '',
      });

      // Call callback after 2 seconds
      setTimeout(() => {
        onStudentAdded?.();
        onOpenChange(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  function resetModal() {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      classAssigned: '',
      parentEmail: '',
      parentPhone: '',
      address: '',
      medicalInfo: '',
    });
    setError(null);
    setSuccess(false);
    setCreatedStudent(null);
  }

  useEffect(() => {
    setLiveClasses(classes);
  }, [classes]);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      try {
        const res = await fetch('/api/public/classes');
        const data = await res.json();
        if (res.ok && Array.isArray(data.classes)) {
          setLiveClasses(data.classes);
        }
      } catch {
        // fallback to provided classes
      }
    })();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetModal();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Student account will be created automatically with generated admission number and default password
          </DialogDescription>
        </DialogHeader>

        {success && createdStudent ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Student Created Successfully!</p>
                <p className="text-sm text-green-700">Credentials have been generated below</p>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <Label className="text-xs font-semibold text-gray-600">Admission Number</Label>
                <p className="text-lg font-mono font-bold text-green-700">{createdStudent.admissionNumber}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600">Email</Label>
                <p className="text-sm text-gray-900">{createdStudent.email}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600">Default Password</Label>
                <p className="text-sm font-mono text-gray-900 select-all">{createdStudent.defaultPassword}</p>
              </div>
              <div className="pt-2 border-t border-gray-300 text-xs text-gray-600">
                <p>Share these credentials with the parent/guardian</p>
                <p>Student must change password on first login</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="classAssigned">Class Assignment *</Label>
              <Select value={formData.classAssigned} onValueChange={(value) => setFormData({ ...formData, classAssigned: value })}>
                <SelectTrigger id="classAssigned" disabled={isLoading}>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {liveClasses.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentEmail">Parent Email *</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  placeholder="parent@example.com"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="parentPhone">Parent Phone *</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="+234 800 000 0000"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="medicalInfo">Medical Information</Label>
              <Textarea
                id="medicalInfo"
                value={formData.medicalInfo}
                onChange={(e) => setFormData({ ...formData, medicalInfo: e.target.value })}
                placeholder="Allergies, conditions, medications..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Student Account'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
