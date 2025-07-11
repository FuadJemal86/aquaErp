import api from '@/services/api';
import React, { useState, useEffect } from 'react';

// Type definitions based on your Prisma models
interface BuyCredit {
  id: number;
  transaction_id: string;
  total_money: number;
  description?: string;
  issued_date: string;
  return_date: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


interface BuyTransaction {
  id: number;
  price_per_quantity: number;
  quantity: number;
  payment_method: string;
  total_money: number;
  supplier_name: string;
  transaction_id: string;
  createdAt: string;
  updatedAt: string;
  type_id: number;
  bank_id?: number;
  return_date?: string;
  Product_type: {
    id: number;
    name: string;
  };
}


const BuyCreditReport: React.FC = () => {
  const [credits, setCredits] = useState<BuyCredit[]>([]);
  const [selectedCredit, setSelectedCredit] = useState<BuyCredit | null>(null);
  const [creditDetails, setCreditDetails] = useState<BuyTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Fetch buy credit report
  const fetchBuyCredits = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/get-all-buy-credits');

      // Axios wraps response in .data property
      const result = response.data;

      console.log('API Response:', result); // Debug log

      if (result.status && result.data && Array.isArray(result.data)) {
        setCredits(result.data);
        setError(null);
      } else if (result.status === false) {
        setError(result.error || 'Failed to fetch buy credit report');
        setCredits([]);
      } else {
        setError('Invalid response format');
        setCredits([]);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Buy credit report not found');
      } else if (err.response?.status === 500) {
        setError('Internal server error');
      } else {
        setError('Network error occurred');
      }
      setCredits([]);
      console.error('Error fetching buy credits:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch credit details by transaction_id
  const fetchCreditDetails = async (transactionId: string) => {
    try {
      setDetailLoading(true);
      const response = await api.get(`/admin/get-buy-transaction-details/${transactionId}`);

      // Axios wraps response in .data property
      const result = response.data;

      if (result.status && result.data && Array.isArray(result.data)) {
        setCreditDetails(result.data);
        setShowDetails(true);
      } else if (result.status === false) {
        setError(result.error || 'Failed to fetch credit details');
        setCreditDetails([]);
      } else {
        setError('Invalid response format');
        setCreditDetails([]);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Buy credit detail not found');
      } else if (err.response?.status === 500) {
        setError('Internal server error');
      } else {
        setError('Network error occurred while fetching details');
      }
      setCreditDetails([]);
      console.error('Error fetching credit details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = (credit: BuyCredit) => {
    setSelectedCredit(credit);
    fetchCreditDetails(credit.transaction_id);
  };

  // Handle close details
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedCredit(null);
    setCreditDetails([]);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Filter active credits with safety check
  const activeCredits = Array.isArray(credits) ? credits.filter(credit => credit.isActive) : [];

  // Debug log to see what credits contains
  console.log('Credits state:', credits, 'Type:', typeof credits, 'IsArray:', Array.isArray(credits));

  useEffect(() => {
    fetchBuyCredits();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading buy credit report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {error}
        <button
          onClick={fetchBuyCredits}
          className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Buy Credit Report</h1>
        <p className="text-gray-600">Total Credits: {activeCredits.length}</p>
      </div>

      {activeCredits.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No buy credit records found.
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issued Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeCredits.map((credit) => (
                  <tr key={credit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {credit.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(credit.total_money)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${credit.status === 'ACCEPTED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {credit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(credit.issued_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(credit.return_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {credit.description || 'No description'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(credit)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Credit Details Modal */}
      {showDetails && selectedCredit && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto p-5 border w-full max-w-4xl shadow-2xl rounded-lg bg-white/95 backdrop-blur-md">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Credit Details - {selectedCredit.transaction_id}
                </h3>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {detailLoading ? (
                <div className="flex justify-center py-8">
                  <div className="text-lg">Loading details...</div>
                </div>
              ) : creditDetails.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Credit Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="ml-2 font-medium">{formatCurrency(selectedCredit.total_money)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className="ml-2 font-medium">{selectedCredit.status}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Issued Date:</span>
                        <span className="ml-2 font-medium">{formatDate(selectedCredit.issued_date)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Return Date:</span>
                        <span className="ml-2 font-medium">{formatDate(selectedCredit.return_date)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Transaction Details</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Product
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Quantity
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Price per Unit
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Total
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Supplier
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {creditDetails.map((detail) => (
                            <tr key={detail.id}>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {detail.Product_type.name}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {detail.quantity}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {formatCurrency(detail.price_per_quantity)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {formatCurrency(detail.total_money)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {detail.supplier_name}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No transaction details found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyCreditReport;