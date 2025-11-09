import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { FaMapMarkerAlt, FaSync } from 'react-icons/fa';

interface PublicJob {
  id: number;
  title: string;
  description: string;
  city: string;
  state: string;
  postalCode: string;
  serviceType: string;
  preferredDate?: string;
  preferredStartTime?: string;
  preferredEndTime?: string;
  budgetMin?: number;
  budgetMax?: number;
}

const ProviderPublicJobsBoard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [cityFilter, setCityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<PublicJob | null>(null);
  const [bidMessage, setBidMessage] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/jobs/public', {
        params: { status: 'BIDDING', city: cityFilter || undefined },
      });
      setJobs(response.data.jobs ?? []);
    } catch (err) {
      console.error('Failed to load marketplace jobs', err);
      setError('Unable to load marketplace jobs.');
    } finally {
      setLoading(false);
    }
  }, [cityFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => job.title.toLowerCase().includes(search.toLowerCase()));
  }, [jobs, search]);

  const openBidModal = (job: PublicJob) => {
    setSelectedJob(job);
    setBidMessage('');
    setBidAmount('');
  };

  const submitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedJob) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post(`/api/jobs/public/${selectedJob.id}/bid`, {
        cleanerId: user.id,
        message: bidMessage,
        proposedPrice: bidAmount ? Number(bidAmount) : undefined,
      });
      setSuccess('Bid submitted!');
      setSelectedJob(null);
      fetchJobs();
    } catch (err: any) {
      console.error('Bid failed', err);
      setError(err?.response?.data?.error || 'Failed to place bid.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Available Public Jobs</h1>
            <p className="text-gray-600">Bid on marketplace requests that match your skills.</p>
          </div>
          <div className="flex items-center space-x-2">
            <input value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} placeholder="Filter by city" className="border border-gray-300 rounded-lg px-3 py-2" />
            <button onClick={fetchJobs} className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
              <FaSync className="mr-1" /> Refresh
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by job title" className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-2" />
        </div>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
        {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>}

        <Card>
          {loading ? (
            <p className="text-gray-500">Loading jobs…</p>
          ) : filteredJobs.length === 0 ? (
            <p className="text-gray-500">No jobs match your criteria.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                      <p className="text-gray-600">{job.serviceType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {job.budgetMin || job.budgetMax ?
                          `$${job.budgetMin ?? job.budgetMax} - $${job.budgetMax ?? job.budgetMin}` :
                          'Open'}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-2">{job.description}</p>
                  <div className="flex flex-wrap items-center text-sm text-gray-600 gap-3 mt-3">
                    <span className="flex items-center"><FaMapMarkerAlt className="mr-1" /> {job.city}, {job.state}</span>
                    <span>Preferred date: {job.preferredDate ? new Date(job.preferredDate).toLocaleDateString() : 'Flexible'}</span>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-xs text-gray-500">Job ID: {job.id}</div>
                    <button onClick={() => openBidModal(job)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Submit bid
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title="Submit a bid">
        {selectedJob && (
          <form className="space-y-3" onSubmit={submitBid}>
            <p className="text-sm text-gray-600">{selectedJob.title} · {selectedJob.city}</p>
            <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder="Proposed price" className="w-full border border-gray-300 rounded px-3 py-2" min="0" step="1" />
            <textarea value={bidMessage} onChange={(e) => setBidMessage(e.target.value)} placeholder="Message to the client (optional)" className="w-full border border-gray-300 rounded px-3 py-2" rows={3} />
            <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              {submitting ? 'Submitting…' : 'Send bid'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ProviderPublicJobsBoard;
