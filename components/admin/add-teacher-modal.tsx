'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { TeacherCreationData } from '@/lib/teacher-utils';
import { useEffect } from 'react';

interface AddTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeacherAdded?: () => void;
}

export function AddTeacherModal({ open, onOpenChange, onTeacherAdded }: AddTeacherModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdTeacher, setCreatedTeacher] = useState<any>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [classLevels, setClassLevels] = useState<string[]>([]);

  const [formData, setFormData] = useState<TeacherCreationData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    classAssigned: '',
    subjectsAssigned: [],
    qualifications: '',
    employmentDate: '',
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
      if (!formData.email.trim()) throw new Error('Email is required');
      if (!formData.phoneNumber.trim()) throw new Error('Phone number is required');
      if (!formData.classAssigned) throw new Error('Class assignment is required');
      if (selectedSubjects.length === 0) throw new Error('At least one subject must be assigned');

      // Call API to create teacher
      const response = await fetch('/api/teachers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subjectsAssigned: selectedSubjects,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create teacher');
      }

      setSuccess(true);
      setCreatedTeacher(data.teacher);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        classAssigned: '',
        subjectsAssigned: [],
        qualifications: '',
        employmentDate: '',
      });
      setSelectedSubjects([]);

      // Call callback after 2 seconds
      setTimeout(() => {
        onTeacherAdded?.();
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
      email: '',
      phoneNumber: '',
      classAssigned: '',
      subjectsAssigned: [],
      qualifications: '',
      employmentDate: '',
    });
    setSelectedSubjects([]);
    setError(null);
    setSuccess(false);
    setCreatedTeacher(null);
  }

  function toggleSubject(subject: string) {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  }

  useEffect(() => {
    if (!open) return;
    void (async () => {
      try {
        const [subjectsRes, classesRes] = await Promise.all([
          fetch('/api/public/subjects'),
          fetch('/api/public/classes'),
        ]);
        const subjectsData = await subjectsRes.json();
        const classesData = await classesRes.json();
        if (subjectsRes.ok) {
          setAvailableSubjects(
            Array.isArray(subjectsData.subjects)
              ? subjectsData.subjects.map((s: { name: string }) => s.name).filter(Boolean)
              : [],
          );
        }
        if (classesRes.ok) {
          setClassLevels(Array.isArray(classesData.classes) ? classesData.classes : []);
        }
      } catch {
        // keep current values if loading fails
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
          <DialogTitle>Add New Teacher</DialogTitle>
          <DialogDescription>
            Teacher account will be created with a default password for login
          </DialogDescription>
        </DialogHeader>

        {success && createdTeacher ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Teacher Created Successfully!</p>
                <p className="text-sm text-green-700">Login credentials have been generated below</p>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <Label className="text-xs font-semibold text-gray-600">Email</Label>
                <p className="text-sm text-gray-900">{createdTeacher.email}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600">Default Password</Label>
                <p className="text-sm font-mono text-gray-900 select-all">{createdTeacher.defaultPassword}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600">Class Assigned</Label>
                <p className="text-sm text-gray-900">{createdTeacher.classAssigned}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600">Subjects</Label>
                <p className="text-sm text-gray-900">{createdTeacher.subjectsAssigned.join(', ')}</p>
              </div>
              <div className="pt-2 border-t border-gray-300 text-xs text-gray-600">
                <p>Share these credentials with the teacher</p>
                <p>Teacher must change password on first login</p>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="teacher@school.edu.ng"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+234 800 000 0000"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="classAssigned">Class Assignment *</Label>
              <Select value={formData.classAssigned} onValueChange={(value) => setFormData({ ...formData, classAssigned: value })}>
                <SelectTrigger id="classAssigned" disabled={isLoading}>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  {classLevels.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-3 block">Subjects *</Label>
              <div className="grid grid-cols-2 gap-2 p-3 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                {availableSubjects.map((subject) => (
                  <label key={subject} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject)}
                      onChange={() => toggleSubject(subject)}
                      disabled={isLoading}
                      className="rounded"
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="qualifications">Qualifications</Label>
                <Input
                  id="qualifications"
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  placeholder="B.Sc, M.A, etc."
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="employmentDate">Employment Date</Label>
                <Input
                  id="employmentDate"
                  type="date"
                  value={formData.employmentDate}
                  onChange={(e) => setFormData({ ...formData, employmentDate: e.target.value })}
                  disabled={isLoading}
                />
              </div>
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
                  'Create Teacher Account'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
