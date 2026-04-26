"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { FileUp, Upload, X, AlertCircle, Info } from "lucide-react"
import Link from "next/link"

const CLASS_LEVELS = [
  "Pre-Nursery",
  "Nursery 1",
  "Nursery 2",
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SS 1",
  "SS 2",
  "SS 3",
]

export function AdmissionForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [pinValidated, setPinValidated] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1: PIN Validation
    pin: "",

    // Step 2: Student Information
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    classLevel: "",
    previousSchool: "",
    address: "",

    // Step 3: Parent/Guardian Information
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    parentAddress: "",
    emergencyContact: "",
    relationship: "",

    // Step 4: Required Documents
    documents: {
      birthCertificate: null as File | null,
      schoolReportCard: null as File | null,
      passportPhotos: [] as File[],
      parentID: null as File | null,
      proofOfResidence: null as File | null,
      medicalCertificate: null as File | null,
    },

    // Step 5: Medical Information
    bloodGroup: "",
    medicalConditions: "",
    allergies: "",
  })

  const handlePINValidation = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/pins/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: formData.pin.trim().toUpperCase(),
          pinType: "admission",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Invalid PIN")
      }

      setPinValidated(true)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : "PIN validation failed")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Prepare FormData for multipart submission with documents
      const formDataToSubmit = new FormData();
      
      // Add all form fields
      formDataToSubmit.append('pin', formData.pin.trim().toUpperCase());
      formDataToSubmit.append('firstName', formData.firstName);
      formDataToSubmit.append('lastName', formData.lastName);
      formDataToSubmit.append('dateOfBirth', formData.dateOfBirth);
      formDataToSubmit.append('gender', formData.gender);
      formDataToSubmit.append('classLevel', formData.classLevel);
      formDataToSubmit.append('previousSchool', formData.previousSchool);
      formDataToSubmit.append('address', formData.address);
      formDataToSubmit.append('parentName', formData.parentName);
      formDataToSubmit.append('parentPhone', formData.parentPhone);
      formDataToSubmit.append('parentEmail', formData.parentEmail);
      formDataToSubmit.append('parentAddress', formData.parentAddress);
      formDataToSubmit.append('emergencyContact', formData.emergencyContact);
      formDataToSubmit.append('relationship', formData.relationship);
      formDataToSubmit.append('bloodGroup', formData.bloodGroup);
      formDataToSubmit.append('medicalConditions', formData.medicalConditions);
      formDataToSubmit.append('allergies', formData.allergies);

      // Add documents
      if (formData.documents.birthCertificate) {
        formDataToSubmit.append('documents.birthCertificate', formData.documents.birthCertificate);
      }
      if (formData.documents.schoolReportCard) {
        formDataToSubmit.append('documents.schoolReportCard', formData.documents.schoolReportCard);
      }
      formData.documents.passportPhotos.forEach((photo, idx) => {
        formDataToSubmit.append('documents.passportPhotos', photo);
      });
      if (formData.documents.parentID) {
        formDataToSubmit.append('documents.parentID', formData.documents.parentID);
      }
      if (formData.documents.proofOfResidence) {
        formDataToSubmit.append('documents.proofOfResidence', formData.documents.proofOfResidence);
      }
      if (formData.documents.medicalCertificate) {
        formDataToSubmit.append('documents.medicalCertificate', formData.documents.medicalCertificate);
      }

      const response = await fetch('/api/admissions/submit', {
        method: 'POST',
        body: formDataToSubmit,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      console.log("[v0] Admission application submitted successfully:", data)

      const ref = encodeURIComponent(data.applicationRef as string)
      router.push(`/admissions/success?ref=${ref}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Step {step} of 5:{" "}
          {step === 1
            ? "PIN Validation"
            : step === 2
              ? "Student Information"
              : step === 3
                ? "Parent/Guardian Information"
                : step === 4
                  ? "Required Documents"
                  : "Medical Information"}
        </CardTitle>
        <CardDescription>
          {step === 1
            ? "Enter your admission PIN to begin"
            : step === 2
              ? "Provide student details"
              : step === 3
                ? "Provide parent/guardian details"
                : step === 4
                  ? "Upload required admission documents"
                  : "Provide medical information"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: PIN Validation */}
        {step === 1 && (
          <form
            onSubmit={handlePINValidation}
            className="space-y-6"
          >
            {/* Info Alert */}
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                You need an Admission PIN to apply. Purchase one from our PIN shop if you haven&apos;t already.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-900">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">Admission PIN Code *</Label>
                <p className="text-xs text-muted-foreground">
                  Format: XXXX-XXXX-XXXX (e.g., ADM1-2345-6789)
                </p>
                <Input
                  id="pin"
                  type="text"
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value.toUpperCase() })}
                  placeholder="Enter your admission PIN code"
                  disabled={loading}
                  className="font-mono"
                />
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-semibold mb-3">Don&apos;t have a PIN?</p>
                <Link href="/pin-shop">
                  <Button type="button" variant="outline" className="w-full">
                    Go to PIN Shop - Buy Admission PIN
                  </Button>
                </Link>
              </div>
            </div>

            <Button type="submit" disabled={loading || !formData.pin} className="w-full bg-green-600 hover:bg-green-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  Validate PIN & Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* Step 2: Student Information */}
        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setStep(3)
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classLevel">Applying for Class *</Label>
              <Select
                value={formData.classLevel}
                onValueChange={(value) => updateFormData("classLevel", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class level" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="previousSchool">Previous School (if applicable)</Label>
              <Input
                id="previousSchool"
                value={formData.previousSchool}
                onChange={(e) => updateFormData("previousSchool", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Residential Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Parent/Guardian Information */}
        {step === 3 && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setStep(4)
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="parentName">Parent/Guardian Full Name *</Label>
              <Input
                id="parentName"
                value={formData.parentName}
                onChange={(e) => updateFormData("parentName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship to Student *</Label>
              <Select
                value={formData.relationship}
                onValueChange={(value) => updateFormData("relationship", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Father">Father</SelectItem>
                  <SelectItem value="Mother">Mother</SelectItem>
                  <SelectItem value="Guardian">Guardian</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentPhone">Phone Number *</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => updateFormData("parentPhone", e.target.value)}
                  placeholder="+234-XXX-XXX-XXXX"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentEmail">Email Address *</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => updateFormData("parentEmail", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentAddress">Parent/Guardian Address *</Label>
              <Textarea
                id="parentAddress"
                value={formData.parentAddress}
                onChange={(e) => updateFormData("parentAddress", e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact Number *</Label>
              <Input
                id="emergencyContact"
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => updateFormData("emergencyContact", e.target.value)}
                placeholder="+234-XXX-XXX-XXXX"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1 bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {/* Step 4: Required Documents */}
        {step === 4 && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setStep(5)
            }}
            className="space-y-6"
          >
            <Alert className="bg-blue-50 border-blue-200">
              <FileUp className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                Please upload clear, legible copies of the following required documents
              </AlertDescription>
            </Alert>

            {/* Birth Certificate */}
            <div className="space-y-2">
              <Label>Birth Certificate or Age Declaration *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setFormData((prev) => ({
                        ...prev,
                        documents: { ...prev.documents, birthCertificate: e.target.files![0] },
                      }))
                    }
                  }}
                  className="hidden"
                  id="birthCertificate"
                />
                <label htmlFor="birthCertificate" className="cursor-pointer">
                  {formData.documents.birthCertificate ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>{formData.documents.birthCertificate.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-8 w-8" />
                      <span>Click to upload or drag and drop</span>
                      <span className="text-xs">PDF, JPG, PNG (max 5MB)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* School Report Card */}
            <div className="space-y-2">
              <Label>Previous School Report Card (if applicable)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setFormData((prev) => ({
                        ...prev,
                        documents: { ...prev.documents, schoolReportCard: e.target.files![0] },
                      }))
                    }
                  }}
                  className="hidden"
                  id="schoolReportCard"
                />
                <label htmlFor="schoolReportCard" className="cursor-pointer">
                  {formData.documents.schoolReportCard ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>{formData.documents.schoolReportCard.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-8 w-8" />
                      <span>Click to upload or drag and drop</span>
                      <span className="text-xs">PDF, JPG, PNG (max 5MB)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Passport Photos */}
            <div className="space-y-2">
              <Label>Two Recent Passport Photographs *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setFormData((prev) => ({
                        ...prev,
                        documents: { ...prev.documents, passportPhotos: Array.from(e.target.files || []) },
                      }))
                    }
                  }}
                  className="hidden"
                  id="passportPhotos"
                />
                <label htmlFor="passportPhotos" className="cursor-pointer">
                  {formData.documents.passportPhotos.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>{formData.documents.passportPhotos.length} photo(s) uploaded</span>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {formData.documents.passportPhotos.map((file, idx) => (
                          <span key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                            {file.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-8 w-8" />
                      <span>Click to upload or drag and drop</span>
                      <span className="text-xs">JPG, PNG (max 5MB each)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Parent ID */}
            <div className="space-y-2">
              <Label>Parent/Guardian Valid ID Card *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setFormData((prev) => ({
                        ...prev,
                        documents: { ...prev.documents, parentID: e.target.files![0] },
                      }))
                    }
                  }}
                  className="hidden"
                  id="parentID"
                />
                <label htmlFor="parentID" className="cursor-pointer">
                  {formData.documents.parentID ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>{formData.documents.parentID.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-8 w-8" />
                      <span>Click to upload or drag and drop</span>
                      <span className="text-xs">PDF, JPG, PNG (max 5MB)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Proof of Residence */}
            <div className="space-y-2">
              <Label>Proof of Residence *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setFormData((prev) => ({
                        ...prev,
                        documents: { ...prev.documents, proofOfResidence: e.target.files![0] },
                      }))
                    }
                  }}
                  className="hidden"
                  id="proofOfResidence"
                />
                <label htmlFor="proofOfResidence" className="cursor-pointer">
                  {formData.documents.proofOfResidence ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>{formData.documents.proofOfResidence.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-8 w-8" />
                      <span>Click to upload or drag and drop</span>
                      <span className="text-xs">PDF, JPG, PNG (max 5MB)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Medical Certificate */}
            <div className="space-y-2">
              <Label>Medical Fitness Certificate *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setFormData((prev) => ({
                        ...prev,
                        documents: { ...prev.documents, medicalCertificate: e.target.files![0] },
                      }))
                    }
                  }}
                  className="hidden"
                  id="medicalCertificate"
                />
                <label htmlFor="medicalCertificate" className="cursor-pointer">
                  {formData.documents.medicalCertificate ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>{formData.documents.medicalCertificate.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-8 w-8" />
                      <span>Click to upload or drag and drop</span>
                      <span className="text-xs">PDF, JPG, PNG (max 5MB)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1 bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {/* Step 5: Medical Information */}
        {step === 5 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select value={formData.bloodGroup} onValueChange={(value) => updateFormData("bloodGroup", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalConditions">Known Medical Conditions</Label>
              <Textarea
                id="medicalConditions"
                value={formData.medicalConditions}
                onChange={(e) => updateFormData("medicalConditions", e.target.value)}
                placeholder="List any medical conditions (e.g., asthma, diabetes)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => updateFormData("allergies", e.target.value)}
                placeholder="List any known allergies"
                rows={3}
              />
            </div>

            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                By submitting this form, you confirm that all information provided is accurate and complete.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(4)} className="flex-1 bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
