import React, { useState } from 'react';
import { FaDollarSign, FaCalendar, FaDownload, FaChartBar, FaArrowUp } from 'react-icons/fa';
import Card from '../../components/Card';
import { format, subDays } from 'date-fns';

interface Transaction {
  id: number;
  customerName: string;
  service: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'upcoming';
  payoutDate?: string;
}

const PaymentTracking: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  const transactions: Transaction[] = [
    {
      id: 1,
      customerName: 'John Smith',
      service: 'Deep Cleaning',
      amount: 135,
      date: '2024-01-20',
      status: 'completed',
      payoutDate: '2024-01-26',
    },
    {
      id: 2,
      customerName: 'Emily Davis',
      service: 'Regular Cleaning',
      amount: 90,
      date: '2024-01-18',
      status: 'completed',
      payoutDate: '2024-01-26',
    },
    {
      id: 3,
      customerName: 'Michael Brown',
      service: 'Move-out Cleaning',
      amount: 180,
      date: '2024-01-15',
      status: 'completed',
      payoutDate: '2024-01-19',
    },
    {
      id: 4,
      customerName: 'Sarah Wilson',
      service: 'Deep Cleaning',
      amount: 135,
      date: '2024-01-22',
      status: 'pending',
    },
    {
      id: 5,
      customerName: 'David Lee',
      service: 'Regular Cleaning',
      amount: 90,
      date: '2024-01-25',
      status: 'upcoming',
    },
  ];

  const weeklyEarnings = transactions
    .filter(t => t.status === 'completed' && new Date(t.date) > subDays(new Date(), 7))
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyEarnings = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingEarnings = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const upcomingEarnings = transactions
    .filter(t => t.status === 'upcoming')
    .reduce((sum, t) => sum + t.amount, 0);

  const nextPayoutDate = '2024-01-26';
  const nextPayoutAmount = transactions
    .filter(t => t.status === 'completed' && t.payoutDate === nextPayoutDate)
    .reduce((sum, t) => sum + t.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Date', 'Customer', 'Service', 'Amount', 'Status', 'Payout Date'].join(','),
      ...transactions.map(t => [
        t.date,
        t.customerName,
        t.service,
        t.amount,
        t.status,
        t.payoutDate || 'N/A',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Payment Tracking</h1>
          <button
            onClick={exportToCSV}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaDownload className="mr-2" />
            Export Report
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-3xl font-bold text-green-600">${weeklyEarnings}</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <FaArrowUp className="mr-1" />
                  <span>+15% from last week</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaDollarSign className="text-green-600 text-2xl" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-blue-600">${monthlyEarnings}</p>
                <div className="flex items-center text-sm text-blue-600 mt-1">
                  <FaArrowUp className="mr-1" />
                  <span>+8% from last month</span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaChartBar className="text-blue-600 text-2xl" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">${pendingEarnings}</p>
                <p className="text-xs text-gray-500 mt-1">After service completion</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaDollarSign className="text-yellow-600 text-2xl" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-purple-600">${upcomingEarnings}</p>
                <p className="text-xs text-gray-500 mt-1">Scheduled bookings</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaCalendar className="text-purple-600 text-2xl" />
              </div>
            </div>
          </Card>
        </div>

        {/* Next Payout */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Next Guaranteed Payout</h2>
              <p className="text-gray-600 mb-3">
                Your weekly payout will be processed on {format(new Date(nextPayoutDate), 'MMMM d, yyyy')}
              </p>
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-3xl font-bold text-green-600">${nextPayoutAmount}</p>
                </div>
                <div className="h-12 border-l border-gray-300"></div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="text-lg font-semibold">Bank Transfer</p>
                </div>
              </div>
            </div>
            <div className="bg-green-600 text-white p-4 rounded-full">
              <FaDollarSign className="text-4xl" />
            </div>
          </div>
        </Card>

        {/* Period Filter */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Earnings History</h2>
            <div className="flex gap-2">
              {(['week', 'month', 'year'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payout Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.customerName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.service}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${transaction.amount}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.payoutDate ? format(new Date(transaction.payoutDate), 'MMM d, yyyy') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Payment Info */}
        <Card className="bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">How Payouts Work</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
              <span>Payments are held securely until service completion and customer confirmation</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
              <span>Guaranteed weekly payouts every Friday via bank transfer</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
              <span>No hidden fees - you keep 90% of every booking (10% platform fee)</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
              <span>Track all your earnings in real-time through this dashboard</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default PaymentTracking;

