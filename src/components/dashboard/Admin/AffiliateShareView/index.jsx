import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AffiliateShareView() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated' || !session?.user?.email) {
      router.push('/signIn');
      return;
    }

    const verifyAdmin = async () => {
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

    verifyAdmin();
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

  const handleDeleteCode = async (code) => {
    if (!confirm(`Are you sure you want to delete code ${code}?`)) return;

    try {
      const response = await fetch('/api/affiliateShare', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete code');
      toast.success(`Code ${code} deleted successfully!`);
      await fetchAffiliateCodes();
    } catch (err) {
      toast.error(`Failed to delete code: ${err.message}`);
    }
  };

  const filteredCodes = codes.filter(code => 
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-8 bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
          Admin Affiliate Share Dashboard
        </h1>
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search by code or teacher email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Affiliate Program Overview</h2>
            {filteredCodes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCodes.map((code) => (
                  <div key={code._id} className="p-6 bg-gray-50 border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-lg font-semibold">Code: <span className="text-xl text-purple-600">{code.code}</span></p>
                      <button
                        onClick={() => handleDeleteCode(code.code)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-md">Teacher: <span className="font-medium">{code.createdBy}</span></p>
                    <p className="text-md mt-2">Discount: <span className="text-green-600">{code.discountPercentage}%</span></p>
                    <p className="text-md mt-1">Commission: <span className="text-blue-600">{code.teacherCommission}%</span></p>
                    <p className="text-md mt-1">Total Earnings: <span className="font-bold text-gray-800">${code.totalEarnings.toFixed(2)}</span></p>
                    <p className="text-md mt-1">Uses: <span className="font-medium">{code.uses.length}</span></p>
                    {code.uses.length > 0 && (
                      <div className="mt-4">
                        <p className="font-semibold text-gray-700">Usage Details:</p>
                        <ul className="list-disc pl-5 text-sm text-gray-600 max-h-40 overflow-y-auto">
                          {code.uses.map((use, index) => (
                            <li key={index}>
                              {use.userEmail} - Purchase: ${use.purchaseAmount} - 
                              Discount: ${use.discountAmount.toFixed(2)} - 
                              Commission: ${use.commissionAmount.toFixed(2)} - 
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
              <p className="text-gray-600 text-center">No affiliate codes found.</p>
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

export default AffiliateShareView;