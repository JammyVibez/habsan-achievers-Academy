'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PIN_PRICING, getStudentActivePINs, getRemainingDays } from '@/lib/pin-management';
import { ShoppingCart, CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';

interface PINShopProps {
  studentEmail?: string;
}

export function PINShop({ studentEmail = '' }: PINShopProps) {
  const [activePINs, setActivePINs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingPIN, setProcessingPIN] = useState<string | null>(null);
  const [email, setEmail] = useState(studentEmail);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch student's active PINs
  async function fetchActivePINs() {
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to fetch active PINs
      // const response = await fetch(`/api/pins/my-pins?email=${email}`);
      // const data = await response.json();
      // setActivePINs(data.pins);

      setActivePINs([]);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load your PINs' });
    } finally {
      setLoading(false);
    }
  }

  // Purchase PIN
  async function purchasePIN(pinType: 'admission' | 'result') {
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setProcessingPIN(pinType);
    setMessage(null);

    try {
      const response = await fetch('/api/pins/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: email,
          pinType,
          paymentMethod: 'paystack',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to payment link
        window.location.href = data.paymentLink;
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to initiate payment' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Payment initiation failed' });
    } finally {
      setProcessingPIN(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Input */}
      <Card>
        <CardHeader>
          <CardTitle>Your Email</CardTitle>
          <CardDescription>Enter your email to view and purchase PIN codes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Button onClick={fetchActivePINs} disabled={loading} variant="outline">
              {loading ? 'Loading...' : 'Check PINs'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message */}
      {message && (
        <Alert className={message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          <AlertCircle className={`h-4 w-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
          <AlertDescription className={message.type === 'success' ? 'text-green-900' : 'text-red-900'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Active PINs */}
      {activePINs.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Your Active PINs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activePINs.map((pinData) => (
                <div key={pinData.pin} className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{pinData.type === 'admission' ? 'Admission PIN' : 'Result PIN'}</p>
                      <p className="text-xs text-gray-600">PIN: {pinData.pin}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {getRemainingDays(new Date(pinData.expiryDate))} days remaining
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PIN Purchase Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {(['admission', 'result'] as const).map((type) => (
          <Card key={type} className="flex flex-col">
            <CardHeader>
              <CardTitle className={type === 'admission' ? 'text-blue-900' : 'text-purple-900'}>
                {type === 'admission' ? 'Admission PIN' : 'Result Checking PIN'}
              </CardTitle>
              <CardDescription>
                {PIN_PRICING[type].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Price:</p>
                <p className="text-3xl font-bold text-green-600">{PIN_PRICING[type].price.toLocaleString()} NGN</p>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm font-semibold text-gray-700">Benefits:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {type === 'admission' ? (
                    <>
                      <li>• Apply for school admission</li>
                      <li>• Valid for 1 year (365 days)</li>
                      <li>• One-time use per student</li>
                      <li>• Instant activation</li>
                    </>
                  ) : (
                    <>
                      <li>• Check your exam results</li>
                      <li>• Valid for 6 months (180 days)</li>
                      <li>• Multiple uses allowed</li>
                      <li>• Download report card in PDF</li>
                    </>
                  )}
                </ul>
              </div>

              <Button
                onClick={() => purchasePIN(type)}
                disabled={processingPIN === type}
                className={`w-full mt-auto ${
                  type === 'admission'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {processingPIN === type ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-1">Do I need both PINs?</h4>
            <p className="text-sm text-gray-600">
              No. Get an Admission PIN only if you're applying for admission. Get a Result PIN only if you want to check results.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">How long is the PIN valid?</h4>
            <p className="text-sm text-gray-600">
              Admission PINs are valid for 1 year, Result PINs for 6 months from purchase date.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Can I refund my PIN?</h4>
            <p className="text-sm text-gray-600">
              Refunds are not available once PIN is activated. Contact support@habsan.edu.ng for issues.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
