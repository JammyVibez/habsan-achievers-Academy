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
import type { SubjectClassAssignment } from '@/lib/teacher-utils';

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
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [classLevels, setClassLevels] = useState<string[]>([]);
  const [subjectClassAssignments, setSubjectClassAssignments] = useState<SubjectClassAssignment[]>([]);
  const [draftSubject, setDraftSubject] = useState('');
  const [draftClassLevel, setDraftClassLevel] = useState('');

  const [formData, setFormData] = useState<TeacherCreationData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    classAssigned: '',
    subjectClassAssignments: [],
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
      if (subjectClassAssignments.length === 0) throw new Error('Add at least one subject/class assignment');

      // Call API to create teacher
      const response = await fetch('/api/teachers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subjectClassAssignments,
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
        subjectClassAssignments: [],
        qualifications: '',
        employmentDate: '',
      });
      setSubjectClassAssignments([]);

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
      subjectClassAssignments: [],
      qualifications: '',
      employmentDate: '',
    });
    setSubjectClassAssignments([]);
    setDraftSubject('');
    setDraftClassLevel('');
    setError(null);
    setSuccess(false);
    setCreatedTeacher(null);
  }

  function addAssignment() {
    const subject = draftSubject.trim();
    const classLevel = draftClassLevel.trim();
    if (!subject || !classLevel) {
      setError('Select both subject and class before adding');
      return;
    }
    const exists = subjectClassAssignments.some((a) => a.subject === subject && a.classLevel === classLevel);
    if (exists) {
      setError('This subject/class assignment already exists');
      return;
    }
    setError(null);
    setSubjectClassAssignments((prev) => [...prev, { subject, classLevel }]);
    setDraftSubject('');
    setDraftClassLevel('');
  }

  function removeAssignment(target: SubjectClassAssignment) {
    setSubjectClassAssignments((prev) =>
      prev.filter((a) => !(a.subject === target.subject && a.classLevel === target.classLevel)),
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
                <p className="text-sm text-gray-900">{(createdTeacher.subjectClassAssignments ?? []).map((a: SubjectClassAssignment) => `${a.subject} (${a.classLevel})`).join(', ')}</p>
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
                <SelectContent>
                  {classLevels.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold block">Subject/Class Assignments *</Label>
              <div className="grid grid-cols-2 gap-3">
                <Select value={draftSubject} onValueChange={setDraftSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={draftClassLevel} onValueChange={setDraftClassLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classLevels.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="outline" onClick={addAssignment} disabled={isLoading}>
                Add assignment
              </Button>
              <div className="space-y-2 p-3 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                {subjectClassAssignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No assignments added yet.</p>
                ) : (
                  subjectClassAssignments.map((a) => (
                    <div key={`${a.subject}-${a.classLevel}`} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                      <span>{a.subject} — {a.classLevel}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAssignment(a)}
                        disabled={isLoading}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                )}
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
