import React, { useMemo, useState } from 'react';
import { FaDollarSign, FaCalendar, FaDownload, FaChartBar, FaArrowUp, FaInfoCircle } from 'react-icons/fa';
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

  const transactions: Transaction[] = useMemo(() => [
    {
      id: 1,
      customerName: 'John Smith',
      service: 'Deep Cleaning',
      amount: 13500,
      date: '2024-01-20',
      status: 'completed',
      payoutDate: '2024-01-26',
    },
    {
      id: 2,
      customerName: 'Emily Davis',
      service: 'Regular Cleaning',
      amount: 9000,
      date: '2024-01-18',
      status: 'completed',
      payoutDate: '2024-01-26',
    },
    {
      id: 3,
      customerName: 'Michael Brown',
      service: 'Move-out Cleaning',
      amount: 18000,
      date: '2024-01-15',
      status: 'completed',
      payoutDate: '2024-01-19',
    },
    {
      id: 4,
      customerName: 'Sarah Wilson',
      service: 'Deep Cleaning',
      amount: 13500,
      date: '2024-01-22',
      status: 'pending',
    },
  ], []);

  const formatCurrency = (value: number) => `$${(value / 100).toFixed(2)}`;

  const weeklyEarnings = transactions
    .filter((t) => t.status === 'completed' && new Date(t.date) > subDays(new Date(), 7))
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyEarnings = transactions.filter((t) => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const pendingEarnings = transactions.filter((t) => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);
  const upcomingEarnings = transactions.filter((t) => t.status === 'upcoming').reduce((sum, t) => sum + t.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Date', 'Customer', 'Service', 'Amount', 'Status', 'Payout Date'].join(','),
      ...transactions.map((t) => [t.date, t.customerName, t.service, formatCurrency(t.amount), t.status, t.payoutDate || 'N/A'].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const nextPayoutDate = '2024-01-26';
  const nextPayoutAmount = transactions
    .filter((t) => t.status === 'completed' && t.payoutDate === nextPayoutDate)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Tracking</h1>
            <p className="text-gray-600">Monitor payouts and manage your Stripe account.</p>
          </div>
          <button onClick={exportToCSV} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <FaDownload className="mr-2" /> Export Report
          </button>
        </div>

        <Card className="bg-blue-50 border border-blue-100">
          <div className="flex items-start gap-4">
            <FaInfoCircle className="text-blue-600 text-3xl" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Mock payouts enabled</h2>
              <p className="text-sm text-blue-700">
                This project uses a mock payment gateway for demonstrations, so you don’t need to connect a real Stripe account. When a customer marks a booking as paid, we automatically update the booking and notify you.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(weeklyEarnings)}</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <FaArrowUp className="mr-1" /> <span>+15% from last week</span>
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
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(monthlyEarnings)}</p>
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
                <p className="text-3xl font-bold text-yellow-600">{formatCurrency(pendingEarnings)}</p>
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
                <p className="text-3xl font-bold text-purple-600">{formatCurrency(upcomingEarnings)}</p>
                <p className="text-xs text-gray-500 mt-1">Scheduled bookings</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaCalendar className="text-purple-600 text-2xl" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Next Guaranteed Payout</h2>
              <p className="text-gray-600 mb-3">Your weekly payout will be processed on {format(new Date(nextPayoutDate), 'MMMM d, yyyy')}</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(nextPayoutAmount)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')} className="border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="year">This year</option>
            </select>
          </div>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                <div>
                  <p className="font-medium text-gray-900">{transaction.customerName}</p>
                  <p className="text-sm text-gray-500">{transaction.service}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(transaction.amount)}</p>
                  <p className={`text-xs inline-flex mt-1 px-2 py-1 rounded ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentTracking;
