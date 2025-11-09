import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaPlus, FaTrash, FaClock, FaCalendar } from 'react-icons/fa';
import axios from 'axios';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';

interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
}

interface AvailabilityPattern {
  dayOfWeek: string;
  slots: TimeSlot[];
  isAvailable: boolean;
}

const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AvailabilityCalendar: React.FC = () => {
  const { user } = useAuth();
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const [newSlotEnd, setNewSlotEnd] = useState('17:00');
  const [weeklyPattern, setWeeklyPattern] = useState<AvailabilityPattern[]>(
    dayLabels.map((day) => ({ dayOfWeek: day, isAvailable: false, slots: [] }))
  );
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dayIndex = useCallback((day: string) => dayLabels.indexOf(day), []);

  const loadAvailability = useCallback(async () => {
    if (!user) return;
    try {
      const response = await axios.get(`/api/cleaners/${user.id}/availability`);
      const slots = response.data.slots || [];
      const pattern = dayLabels.map((day, index) => {
        const daySlots = slots.filter((slot: any) => slot.dayOfWeek === index);
        return {
          dayOfWeek: day,
          isAvailable: daySlots.length > 0,
          slots: daySlots.map((slot: any) => ({ id: slot.id ?? Date.now() + slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime })),
        };
      });
      setWeeklyPattern(pattern);
    } catch (err) {
      console.error('Failed to load availability', err);
      setError('Unable to load availability.');
    }
  }, [user]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const toggleDayAvailability = (day: string) => {
    setWeeklyPattern((prev) =>
      prev.map((p) =>
        p.dayOfWeek === day
          ? {
              ...p,
              isAvailable: !p.isAvailable,
              slots: !p.isAvailable ? p.slots : [],
            }
          : p
      )
    );
  };

  const addTimeSlot = (day: string) => {
    setSelectedDay(day);
    setShowAddSlotModal(true);
  };

  const handleAddSlot = () => {
    if (!selectedDay) return;
    const newSlot: TimeSlot = {
      id: Date.now(),
      startTime: newSlotStart,
      endTime: newSlotEnd,
    };
    setWeeklyPattern((prev) =>
      prev.map((p) =>
        p.dayOfWeek === selectedDay ? { ...p, isAvailable: true, slots: [...p.slots, newSlot] } : p
      )
    );
    setShowAddSlotModal(false);
    setSelectedDay(null);
  };

  const removeTimeSlot = (day: string, slotId: number) => {
    setWeeklyPattern((prev) =>
      prev.map((p) =>
        p.dayOfWeek === day ? { ...p, slots: p.slots.filter((slot) => slot.id !== slotId) } : p
      )
    );
  };

  const saveAvailability = async () => {
    if (!user) return;
    setSaving(true);
    setStatus(null);
    setError(null);
    try {
      const blocks = weeklyPattern.flatMap((pattern) =>
        pattern.isAvailable
          ? pattern.slots.map((slot) => ({
              dayOfWeek: dayIndex(pattern.dayOfWeek),
              startTime: slot.startTime,
              endTime: slot.endTime,
            }))
          : []
      );
      await axios.put('/api/cleaners/me/availability', {
        cleanerId: user.id,
        blocks,
      });
      setStatus('Availability saved');
    } catch (err) {
      console.error('Save availability failed', err);
      setError('Failed to save availability.');
    } finally {
      setSaving(false);
    }
  };

  const totalSlots = useMemo(() => weeklyPattern.reduce((acc, pattern) => acc + pattern.slots.length, 0), [weeklyPattern]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Availability Calendar</h1>
            <p className="text-gray-600 text-sm">Active slots: {totalSlots}</p>
          </div>
          <button onClick={saveAvailability} disabled={saving} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center">
            <FaCalendar className="mr-2" /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
        {status && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{status}</div>}

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Recurring Schedule</h2>
          <div className="space-y-4">
            {weeklyPattern.map((pattern) => (
              <div key={pattern.dayOfWeek} className={`border rounded-lg p-4 ${pattern.isAvailable ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={pattern.isAvailable} onChange={() => toggleDayAvailability(pattern.dayOfWeek)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all" />
                    </label>
                    <span className="font-semibold text-lg text-gray-900">{pattern.dayOfWeek}</span>
                  </div>
                  {pattern.isAvailable && (
                    <button onClick={() => addTimeSlot(pattern.dayOfWeek)} className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                      <FaPlus className="mr-1" /> Add Time Slot
                    </button>
                  )}
                </div>
                {pattern.isAvailable && (
                  <div className="space-y-2">
                    {pattern.slots.length === 0 ? (
                      <p className="text-gray-500 text-sm">No time slots set for this day</p>
                    ) : (
                      pattern.slots.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                          <div className="flex items-center text-gray-700">
                            <FaClock className="mr-2 text-blue-600" />
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </div>
                          <button onClick={() => removeTimeSlot(pattern.dayOfWeek, slot.id)} className="text-red-600 hover:text-red-700">
                            <FaTrash />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal isOpen={showAddSlotModal} onClose={() => setShowAddSlotModal(false)} title={`Add time slot for ${selectedDay}`}> 
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
              <input type="time" value={newSlotStart} onChange={(e) => setNewSlotStart(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
              <input type="time" value={newSlotEnd} onChange={(e) => setNewSlotEnd(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
          </div>
          <button onClick={handleAddSlot} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Add slot</button>
        </div>
      </Modal>
    </div>
  );
};

export default AvailabilityCalendar;
