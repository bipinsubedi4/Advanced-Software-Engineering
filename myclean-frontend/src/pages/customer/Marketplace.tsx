import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { FaClipboardList, FaPlus, FaUser } from 'react-icons/fa';

interface Bid {
  id: number;
  cleanerId: number;
  message?: string | null;
  proposedPrice?: number | null;
  status: string;
  cleaner?: {
    id: number;
    name: string;
    profileImage?: string | null;
  };
}

interface PublicJob {
  id: number;
  title: string;
  description: string;
  serviceType: string;
  city: string;
  state: string;
  postalCode: string;
  preferredDate?: string;
  preferredStartTime?: string;
  preferredEndTime?: string;
  budgetMin?: number;
  budgetMax?: number;
  status: string;
  bids: Bid[];
  createdAt: string;
}

const initialJobForm = {
  title: '',
  description: '',
  serviceType: '',
  preferredDate: '',
  preferredStartTime: '09:00',
  preferredEndTime: '11:00',
  city: '',
  state: '',
  postalCode: '',
  budgetMin: '',
  budgetMax: '',
};

const CustomerMarketplace: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialJobForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [acceptBid, setAcceptBid] = useState<Bid | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [acceptForm, setAcceptForm] = useState({
    bookingDate: '',
    startTime: '09:00',
    endTime: '11:00',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    specialInstructions: '',
  });

  const fetchJobs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.get('/api/jobs/public', {
        params: {
          clientId: user.id,
          status: undefined,
        },
      });
      setJobs(response.data.jobs ?? []);
    } catch (err) {
      console.error('Failed to load jobs', err);
      setError('Failed to load your posted jobs.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post('/api/jobs/public', {
        clientId: user.id,
        title: form.title,
        description: form.description,
        serviceType: form.serviceType,
        preferredDate: form.preferredDate || undefined,
        preferredStartTime: form.preferredStartTime,
        preferredEndTime: form.preferredEndTime,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      });
      setSuccess('Job posted successfully!');
      setForm(initialJobForm);
      fetchJobs();
    } catch (err: any) {
      console.error('Create job failed', err);
      setError(err?.response?.data?.error || 'Failed to post job.');
    } finally {
      setSubmitting(false);
    }
  };

  const openAcceptModal = (job: PublicJob, bid: Bid) => {
    setAcceptBid(bid);
    setAcceptForm({
      bookingDate: job.preferredDate?.split('T')[0] || '',
      startTime: job.preferredStartTime || '09:00',
      endTime: job.preferredEndTime || '11:00',
      address: job.title,
      city: job.city,
      state: job.state,
      zipCode: job.postalCode,
      specialInstructions: job.description,
    });
  };

  const submitBidAcceptance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptBid || !user) return;
    setAccepting(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post(`/api/jobs/public/${acceptBid.id}/accept`, {
        clientId: user.id,
        bookingDate: acceptForm.bookingDate,
        startTime: acceptForm.startTime,
        endTime: acceptForm.endTime,
        address: acceptForm.address,
        city: acceptForm.city,
        state: acceptForm.state,
        zipCode: acceptForm.zipCode,
        specialInstructions: acceptForm.specialInstructions,
      });
      setSuccess('Bid accepted. Booking created!');
      setAcceptBid(null);
      fetchJobs();
    } catch (err: any) {
      console.error('Accept bid failed', err);
      setError(err?.response?.data?.error || 'Failed to accept bid.');
    } finally {
      setAccepting(false);
    }
  };

  const activeJobs = useMemo(() => jobs.filter((job) => job.status === 'BIDDING'), [jobs]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Public Job Marketplace</h1>
            <p className="text-gray-600">Post a job and invite verified cleaners to bid.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaClipboardList />
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-semibold text-gray-900">Post a New Job</h2>
                <p className="text-sm text-gray-600">Share the details with the marketplace.</p>
              </div>
            </div>
            <form className="space-y-3" onSubmit={handleCreateJob}>
              <input name="title" value={form.title} onChange={handleFieldChange} placeholder="Job title" className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
              <textarea name="description" value={form.description} onChange={handleFieldChange} placeholder="Describe the work" className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} required />
              <input name="serviceType" value={form.serviceType} onChange={handleFieldChange} placeholder="Service type (e.g. Deep clean)" className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleFieldChange} className="border border-gray-300 rounded-lg px-3 py-2" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="time" name="preferredStartTime" value={form.preferredStartTime} onChange={handleFieldChange} className="border border-gray-300 rounded-lg px-2 py-2" />
                  <input type="time" name="preferredEndTime" value={form.preferredEndTime} onChange={handleFieldChange} className="border border-gray-300 rounded-lg px-2 py-2" />
                </div>
              </div>
              <input name="city" value={form.city} onChange={handleFieldChange} placeholder="City" className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
              <div className="grid grid-cols-2 gap-3">
                <input name="state" value={form.state} onChange={handleFieldChange} placeholder="State" className="border border-gray-300 rounded-lg px-3 py-2" required />
                <input name="postalCode" value={form.postalCode} onChange={handleFieldChange} placeholder="Postcode" className="border border-gray-300 rounded-lg px-3 py-2" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="budgetMin" value={form.budgetMin} onChange={handleFieldChange} placeholder="Min budget" className="border border-gray-300 rounded-lg px-3 py-2" />
                <input name="budgetMax" value={form.budgetMax} onChange={handleFieldChange} placeholder="Max budget" className="border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                <FaPlus className="mr-2" /> {submitting ? 'Posting…' : 'Post Job'}
              </button>
            </form>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Open Jobs</h2>
                <span className="text-sm text-gray-500">{activeJobs.length} active</span>
              </div>
              {loading ? (
                <p className="text-gray-500">Loading…</p>
              ) : activeJobs.length === 0 ? (
                <p className="text-gray-500">No active jobs. Post one above!</p>
              ) : (
                <div className="space-y-4">
                  {activeJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.city}, {job.state}</p>
                          <p className="text-sm text-gray-500">Preferred: {job.preferredDate ? new Date(job.preferredDate).toLocaleDateString() : 'Flexible'} · {job.serviceType}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Budget</p>
                          <p className="text-lg font-bold text-blue-600">
                            {job.budgetMin || job.budgetMax ?
                              `$${job.budgetMin ?? job.budgetMax} - $${job.budgetMax ?? job.budgetMin}` :
                              'Open'}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 mt-3">{job.description}</p>
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Bids ({job.bids.length})</h4>
                        {job.bids.length === 0 ? (
                          <p className="text-sm text-gray-500">No bids yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {job.bids.map((bid) => (
                              <div key={bid.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <FaUser className="text-gray-500" />
                                    <span className="font-medium text-gray-900">{bid.cleaner?.name || 'Cleaner #' + bid.cleanerId}</span>
                                    <span className="text-xs uppercase px-2 py-1 rounded bg-gray-200 text-gray-600">{bid.status}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{bid.message || 'No message provided'}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-semibold text-gray-900">{bid.proposedPrice ? `$${bid.proposedPrice}` : 'N/A'}</p>
                                  {bid.status === 'PENDING' && (
                                    <button onClick={() => openAcceptModal(job, bid)} className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Accept bid</button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Modal isOpen={!!acceptBid} onClose={() => setAcceptBid(null)} title="Accept bid & create booking">
        {acceptBid && (
          <form className="space-y-3" onSubmit={submitBidAcceptance}>
            <p className="text-sm text-gray-600">Confirm the booking details for this cleaner. We'll link it to their active service automatically.</p>
            <input type="date" name="bookingDate" value={acceptForm.bookingDate} onChange={(e) => setAcceptForm({ ...acceptForm, bookingDate: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" required />
            <div className="grid grid-cols-2 gap-3">
              <input type="time" name="startTime" value={acceptForm.startTime} onChange={(e) => setAcceptForm({ ...acceptForm, startTime: e.target.value })} className="border border-gray-300 rounded px-3 py-2" required />
              <input type="time" name="endTime" value={acceptForm.endTime} onChange={(e) => setAcceptForm({ ...acceptForm, endTime: e.target.value })} className="border border-gray-300 rounded px-3 py-2" required />
            </div>
            <input name="address" value={acceptForm.address} onChange={(e) => setAcceptForm({ ...acceptForm, address: e.target.value })} placeholder="Service address" className="w-full border border-gray-300 rounded px-3 py-2" required />
            <div className="grid grid-cols-3 gap-3">
              <input name="city" value={acceptForm.city} onChange={(e) => setAcceptForm({ ...acceptForm, city: e.target.value })} placeholder="City" className="border border-gray-300 rounded px-3 py-2" required />
              <input name="state" value={acceptForm.state} onChange={(e) => setAcceptForm({ ...acceptForm, state: e.target.value })} placeholder="State" className="border border-gray-300 rounded px-3 py-2" required />
              <input name="zipCode" value={acceptForm.zipCode} onChange={(e) => setAcceptForm({ ...acceptForm, zipCode: e.target.value })} placeholder="Postcode" className="border border-gray-300 rounded px-3 py-2" required />
            </div>
            <textarea name="specialInstructions" value={acceptForm.specialInstructions} onChange={(e) => setAcceptForm({ ...acceptForm, specialInstructions: e.target.value })} rows={3} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Notes for the cleaner" />
            <button type="submit" disabled={accepting} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">{accepting ? 'Creating booking…' : 'Confirm booking'}</button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default CustomerMarketplace;
