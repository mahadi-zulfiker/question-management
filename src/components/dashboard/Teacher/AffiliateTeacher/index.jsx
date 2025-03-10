import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AffiliateTeacher() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Session Status:', status);
    console.log('Session Data:', session);

    if (status === 'loading') {
      console.log('Session is still loading...');
      return;
    }

    if (status === 'unauthenticated' || !session?.user?.email) {
      console.log('User is not authenticated or no email, redirecting to /signIn');
      router.push('/signIn');
      return;
    }

    // Fetch userType from the backend to double-check
    const verifyUserType = async () => {
      try {
        const response = await fetch('/api/affiliate?userType=Teacher', {
          credentials: 'include', // Ensure session cookies are sent
        });
        const data = await response.json(); // Parse response to get error details
        if (!response.ok) {
          console.log('Failed to verify userType, response:', data);
          router.push('/signIn');
          return;
        }
        console.log('User is authenticated as a teacher, fetching affiliate codes...');
        fetchAffiliateCodes();
      } catch (err) {
        console.error('Error verifying userType:', err);
        router.push('/signIn');
      }
    };

    verifyUserType();
  }, [status, session, router]);

  const fetchAffiliateCodes = async () => {
    try {
      const response = await fetch('/api/affiliate?userType=Teacher', {
        credentials: 'include', // Ensure session cookies are sent
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCodes(data);
      setLoading(false);
    } catch (err) {
      toast.error(`Failed to fetch affiliate codes: ${err.message}`);
      setLoading(false);
    }
  };

  const handleGenerateCode = async (e) => {
    e.preventDefault();
    if (!discountPercentage || !expiryDate) {
      toast.warning('Please fill all fields (Discount Percentage and Expiry Date)');
      return;
    }

    try {
      const response = await fetch('/api/affiliate?userType=Teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountPercentage: parseInt(discountPercentage), expiryDate }),
        credentials: 'include', // Ensure session cookies are sent
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate code');
      setGeneratedCode(data.code);
      toast.success(`Affiliate code ${data.code} generated successfully!`);
      await fetchAffiliateCodes(); // Refresh the list
    } catch (err) {
      toast.error(`Failed to generate code: ${err.message}`);
    }
  };

  if (status === 'loading' || loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Teacher Affiliate Code Generator
        </h1>
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          <form onSubmit={handleGenerateCode} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">Discount Percentage (%)</label>
              <input
                type="number"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                min="0"
                max="100"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                placeholder="Enter discount (0-100)"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-md"
            >
              Generate Affiliate Code
            </button>
          </form>
          {generatedCode && (
            <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 text-green-800 rounded-xl shadow-inner">
              <p className="text-xl">Generated Code: <strong className="font-bold text-2xl">{generatedCode}</strong></p>
              <p className="text-md mt-2">Share this code with users for a {discountPercentage}% discount!</p>
              <button
                onClick={() => navigator.clipboard.writeText(generatedCode)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>
          )}
          <div className="mt-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Existing Affiliate Codes</h2>
            {codes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {codes.map((code) => (
                  <div key={code._id} className="p-6 bg-gray-50 border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <p className="text-lg">Code: <strong className="text-xl font-semibold">{code.code}</strong></p>
                    <p className="text-md mt-2">Discount: {code.discountPercentage}%</p>
                    <p className="text-md mt-1">Expiry: {new Date(code.expiryDate).toLocaleString()}</p>
                    <p className="text-md mt-1">Used By: {code.usedBy.length > 0 ? code.usedBy.join(', ') : 'None'}</p>
                    <p className="text-sm text-gray-500 mt-1">Created By: {code.createdBy}</p>
                    <p className="text-sm text-gray-500 mt-1">Created: {new Date(code.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No affiliate codes generated yet.</p>
            )}
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default AffiliateTeacher;