import React, { useCallback, useEffect, useState } from 'react';
import { FaCheckCircle, FaCloudUploadAlt, FaShieldAlt } from 'react-icons/fa';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const statusCopy: Record<string, { label: string; color: string }> = {
  NOT_SUBMITTED: { label: 'Not submitted', color: 'text-gray-500' },
  PENDING_REVIEW: { label: 'Pending review', color: 'text-yellow-600' },
  APPROVED: { label: 'Verified', color: 'text-green-600' },
  REJECTED: { label: 'Rejected', color: 'text-red-600' },
};

const Verification: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'NOT_SUBMITTED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'>('NOT_SUBMITTED');
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    try {
      const response = await axios.get(`/api/providers/profile/${user.id}`);
      const profile = response.data.profile;
      setStatus(profile.verificationStatus || 'NOT_SUBMITTED');
      setDocumentUrl(profile.verificationDocumentUrl || null);
    } catch (err) {
      console.error('Failed to load verification status', err);
      setError('Unable to load verification status.');
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleFileUpload = async (file: File) => {
    if (!user) return;
    const form = new FormData();
    form.append('document', file);
    form.append('cleanerId', String(user.id));
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post('/api/cleaners/upload-verification', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Document uploaded! We will review it shortly.');
      loadProfile();
    } catch (err: any) {
      console.error('Upload failed', err);
      setError(err?.response?.data?.error || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileUpload(event.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center space-x-3">
          <FaShieldAlt className="text-blue-600 text-3xl" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trust & Verification</h1>
            <p className="text-gray-600">Upload your police check or ID to earn the verified badge.</p>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>}

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current status</p>
              <p className={`text-2xl font-semibold ${statusCopy[status].color}`}>{statusCopy[status].label}</p>
            </div>
            {status === 'APPROVED' && (
              <span className="flex items-center text-green-600 font-semibold">
                <FaCheckCircle className="mr-2" /> Verified cleaner
              </span>
            )}
          </div>
          {documentUrl && (
            <div className="mt-4 text-sm text-gray-600">
              Last document: <a href={documentUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">View upload</a>
            </div>
          )}
          <div className="mt-6">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg px-6 py-8 cursor-pointer hover:border-blue-400">
              <FaCloudUploadAlt className="text-3xl text-blue-600 mb-3" />
              <p className="text-gray-700 font-medium">Upload verification document</p>
              <p className="text-sm text-gray-500">PDF, JPG, PNG up to 10MB</p>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={onFileChange} disabled={uploading} />
            </label>
            {uploading && <p className="text-sm text-gray-500 mt-2">Uploading…</p>}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Why verification matters</h2>
          <p className="text-gray-600 text-sm">
            Verified cleaners receive a "trusted" badge on their profile and appear higher in search results. Clients are more likely to book cleaners who have completed verification.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Verification;
