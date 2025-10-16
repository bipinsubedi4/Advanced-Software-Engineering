import React, { useState } from 'react';
import { FaPlus, FaTrash, FaClock, FaCalendar } from 'react-icons/fa';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

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

interface BlockedDate {
  id: number;
  date: string;
  reason: string;
}

const AvailabilityCalendar: React.FC = () => {
  const [showBlockDateModal, setShowBlockDateModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const [newSlotEnd, setNewSlotEnd] = useState('17:00');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const [weeklyPattern, setWeeklyPattern] = useState<AvailabilityPattern[]>(
    daysOfWeek.map(day => ({
      dayOfWeek: day,
      isAvailable: !['Saturday', 'Sunday'].includes(day),
      slots: day === 'Monday' || day === 'Wednesday' ? [
        { id: 1, startTime: '09:00', endTime: '17:00' },
      ] : day === 'Tuesday' || day === 'Thursday' || day === 'Friday' ? [
        { id: 2, startTime: '08:00', endTime: '12:00' },
        { id: 3, startTime: '13:00', endTime: '18:00' },
      ] : [],
    }))
  );

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([
    { id: 1, date: '2024-01-30', reason: 'Personal appointment' },
    { id: 2, date: '2024-02-05', reason: 'Vacation' },
  ]);

  const toggleDayAvailability = (day: string) => {
    setWeeklyPattern(prev =>
      prev.map(p =>
        p.dayOfWeek === day ? { ...p, isAvailable: !p.isAvailable } : p
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

    setWeeklyPattern(prev =>
      prev.map(p =>
        p.dayOfWeek === selectedDay
          ? { ...p, slots: [...p.slots, newSlot] }
          : p
      )
    );

    setShowAddSlotModal(false);
    setNewSlotStart('09:00');
    setNewSlotEnd('17:00');
    setSelectedDay(null);
  };

  const removeTimeSlot = (day: string, slotId: number) => {
    setWeeklyPattern(prev =>
      prev.map(p =>
        p.dayOfWeek === day
          ? { ...p, slots: p.slots.filter(s => s.id !== slotId) }
          : p
      )
    );
  };

  const handleBlockDate = (e: React.FormEvent) => {
    e.preventDefault();
    const newBlockedDate: BlockedDate = {
      id: Date.now(),
      date: blockDate,
      reason: blockReason,
    };
    setBlockedDates([...blockedDates, newBlockedDate]);
    setShowBlockDateModal(false);
    setBlockDate('');
    setBlockReason('');
  };

  const unblockDate = (id: number) => {
    setBlockedDates(prev => prev.filter(d => d.id !== id));
  };

  const saveAvailability = () => {
    console.log('Saving availability:', { weeklyPattern, blockedDates });
    // Handle save logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Availability Calendar</h1>
          <button
            onClick={saveAvailability}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Changes
          </button>
        </div>

        {/* Weekly Recurring Pattern */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Recurring Schedule</h2>
          <p className="text-gray-600 mb-6">Set your regular weekly availability pattern</p>
          
          <div className="space-y-4">
            {weeklyPattern.map(pattern => (
              <div
                key={pattern.dayOfWeek}
                className={`border rounded-lg p-4 ${
                  pattern.isAvailable ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pattern.isAvailable}
                        onChange={() => toggleDayAvailability(pattern.dayOfWeek)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                    <span className="font-semibold text-lg text-gray-900">{pattern.dayOfWeek}</span>
                  </div>
                  
                  {pattern.isAvailable && (
                    <button
                      onClick={() => addTimeSlot(pattern.dayOfWeek)}
                      className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <FaPlus className="mr-1" /> Add Time Slot
                    </button>
                  )}
                </div>

                {pattern.isAvailable && (
                  <div className="space-y-2">
                    {pattern.slots.length === 0 ? (
                      <p className="text-gray-500 text-sm">No time slots set for this day</p>
                    ) : (
                      pattern.slots.map(slot => (
                        <div key={slot.id} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                          <div className="flex items-center text-gray-700">
                            <FaClock className="mr-2 text-blue-600" />
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </div>
                          <button
                            onClick={() => removeTimeSlot(pattern.dayOfWeek, slot.id)}
                            className="text-red-600 hover:text-red-700"
                          >
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

        {/* Blocked Dates */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Blocked Dates</h2>
            <button
              onClick={() => setShowBlockDateModal(true)}
              className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaPlus className="mr-2" /> Block Date
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">Dates when you're unavailable (vacations, appointments, etc.)</p>
          
          {blockedDates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaCalendar className="mx-auto text-4xl mb-2 text-gray-300" />
              <p>No blocked dates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedDates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(blocked => (
                <div key={blocked.id} className="flex items-center justify-between bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {format(new Date(blocked.date), 'MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600">{blocked.reason}</p>
                  </div>
                  <button
                    onClick={() => unblockDate(blocked.id)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Add Time Slot Modal */}
      <Modal
        isOpen={showAddSlotModal}
        onClose={() => setShowAddSlotModal(false)}
        title={`Add Time Slot - ${selectedDay}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={newSlotStart}
              onChange={(e) => setNewSlotStart(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="time"
              value={newSlotEnd}
              onChange={(e) => setNewSlotEnd(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowAddSlotModal(false)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSlot}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Slot
            </button>
          </div>
        </div>
      </Modal>

      {/* Block Date Modal */}
      <Modal
        isOpen={showBlockDateModal}
        onClose={() => setShowBlockDateModal(false)}
        title="Block a Date"
      >
        <form onSubmit={handleBlockDate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              rows={3}
              placeholder="e.g., Vacation, Personal appointment..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowBlockDateModal(false)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Block Date
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AvailabilityCalendar;

