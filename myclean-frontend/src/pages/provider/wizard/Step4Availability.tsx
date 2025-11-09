import React from "react";
import { DayAvailability } from "./types";

type Step4AvailabilityProps = {
  availability: DayAvailability[];
  onChange: (next: DayAvailability[]) => void;
};

const nextId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

const Step4Availability: React.FC<Step4AvailabilityProps> = ({ availability, onChange }) => {
  const updateDay = (day: string, blocks: DayAvailability["blocks"]) => {
    onChange(
      availability.map((entry) => (entry.day === day ? { ...entry, blocks } : entry))
    );
  };

  const handleAddBlock = (day: string) => {
    const newBlock = { id: nextId(), startTime: "09:00", endTime: "17:00" };
    const entry = availability.find((item) => item.day === day);
    updateDay(day, [...(entry?.blocks ?? []), newBlock]);
  };

  const handleRemoveBlock = (day: string, blockId: string) => {
    const entry = availability.find((item) => item.day === day);
    if (!entry) return;
    updateDay(
      day,
      entry.blocks.filter((block) => block.id !== blockId)
    );
  };

  const handleTimeChange = (day: string, blockId: string, field: "startTime" | "endTime", value: string) => {
    const entry = availability.find((item) => item.day === day);
    if (!entry) return;
    updateDay(
      day,
      entry.blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              [field]: value,
            }
          : block
      )
    );
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        Add one or more time blocks for each day you’re available. Leave days empty if you do not work that day.
      </p>
      {availability.map((day) => (
        <div key={day.day} className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-800">{day.day}</p>
            <button
              type="button"
              onClick={() => handleAddBlock(day.day)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              + Add time block
            </button>
          </div>
          {day.blocks.length === 0 ? (
            <p className="text-sm text-gray-500">No availability added.</p>
          ) : (
            <div className="space-y-3">
              {day.blocks.map((block) => (
                <div
                  key={block.id}
                  className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-center bg-gray-50 border border-gray-200 rounded-lg p-3"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Starts</label>
                    <input
                      type="time"
                      value={block.startTime}
                      onChange={(event) => handleTimeChange(day.day, block.id, "startTime", event.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Ends</label>
                    <input
                      type="time"
                      value={block.endTime}
                      onChange={(event) => handleTimeChange(day.day, block.id, "endTime", event.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBlock(day.day, block.id)}
                    className="text-red-600 text-sm font-medium hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {availability.every((day) => day.blocks.length === 0) && (
        <p className="text-sm text-red-600">Add at least one availability block before finishing.</p>
      )}
    </div>
  );
};

export default Step4Availability;
