import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AffiliateShareTeacher() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [generatedCode, setGeneratedCode] = useState('');
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated' || !session?.user?.email) {
      router.push('/signIn');
      return;
    }

    const verifyUserType = async () => {
      try {
        const response = await fetch('/api/affiliateShare', { credentials: 'include' });
        if (!response.ok) {
          router.push('/signIn');
          return;
        }
        fetchAffiliateCodes();
      } catch (err) {
        router.push('/signIn');
      }
    };

    verifyUserType();
  }, [status, session, router]);

  const fetchAffiliateCodes = async () => {
    try {
      const response = await fetch('/api/affiliateShare', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch codes');
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
    try {
      const response = await fetch('/api/affiliateShare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate code');
      setGeneratedCode(data.code);
      toast.success(`Affiliate share code ${data.code} generated successfully!`);
      await fetchAffiliateCodes();
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Teacher Affiliate Share Program
        </h1>
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          <div className="mb-8">
            <p className="text-lg text-gray-700 mb-4">
              Generate an affiliate code and earn 5% commission on every purchase made using your code. 
              Users get a 10% discount!
            </p>
            <button
              onClick={handleGenerateCode}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-md"
            >
              Generate Affiliate Code
            </button>
            {generatedCode && (
              <div className="mt-6 p-6 bg-green-50 border-2 border-green-200 text-green-800 rounded-xl shadow-inner">
                <p className="text-xl">Generated Code: <strong className="font-bold text-2xl">{generatedCode}</strong></p>
                <p className="text-md mt-2">Share this code to earn commissions!</p>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedCode)}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Affiliate Codes</h2>
            {codes.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {codes.map((code) => (
                  <div key={code._id} className="p-6 bg-gray-50 border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <p className="text-lg">Code: <strong className="text-xl font-semibold">{code.code}</strong></p>
                    <p className="text-md mt-2">User Discount: {code.discountPercentage}%</p>
                    <p className="text-md mt-1">Your Commission: {code.teacherCommission}%</p>
                    <p className="text-md mt-1">Total Earnings: ${code.totalEarnings.toFixed(2)}</p>
                    <p className="text-md mt-1">Uses: {code.uses.length}</p>
                    {code.uses.length > 0 && (
                      <div className="mt-4">
                        <p className="font-semibold">Usage History:</p>
                        <ul className="list-disc pl-5">
                          {code.uses.map((use, index) => (
                            <li key={index} className="text-sm">
                              {use.userEmail} - Purchase: ${use.purchaseAmount} - 
                              Discount: ${use.discountAmount.toFixed(2)} - 
                              Your Commission: ${use.commissionAmount.toFixed(2)} - 
                              {new Date(use.date).toLocaleString()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-2">Created: {new Date(code.createdAt).toLocaleString()}</p>
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

export default AffiliateShareTeacher;