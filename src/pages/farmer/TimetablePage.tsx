import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { FarmerSidebar } from '../../components/layout/FarmerSidebar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { CalendarDays, Clock, CheckSquare } from 'lucide-react';
import { MOCK_TIMETABLE } from '../../lib/mock-data';

export const TimetablePage: React.FC = () => {
  const { navigate } = useRouter();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const currentDay = MOCK_TIMETABLE[selectedDayIndex];

  return (
    <div className="flex min-h-screen text-white">
      <FarmerSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-surface border border-white/20 text-white text-xs font-bold mb-2">
              <CalendarDays className="w-3.5 h-3.5 text-white" />
              <span>Weekly Agronomic Schedule</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Farm Work Timetable
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-medium">
              Daily operation schedule coordinated with daylight and temperature curves.
            </p>
          </div>

          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => navigate('/farmer/todays-instructions')}
            icon={<CheckSquare className="w-4 h-4 text-white" />}
          >
            Today's Checklist
          </GlassButton>
        </div>

        {/* Day selection tabs */}
        <div className="flex overflow-x-auto gap-2 pb-1">
          {MOCK_TIMETABLE.map((schedule, idx) => (
            <button
              key={schedule.day}
              id={`timetable-day-${schedule.day.toLowerCase()}`}
              onClick={() => setSelectedDayIndex(idx)}
              className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer text-left border ${selectedDayIndex === idx
                  ? 'bg-white text-slate-950 shadow-lg border-white font-extrabold'
                  : 'glass-surface hover:bg-white/15 text-white/80 border-white/20'
                }`}
            >
              <span className="block text-[11px] opacity-75 uppercase tracking-wider">
                {schedule.date}
              </span>
              <span className="text-sm font-extrabold">{schedule.day}</span>
            </button>
          ))}
        </div>

        {/* Timeline Card */}
        <GlassCard variant="elevated" className="p-6 sm:p-8 border border-white/20">
          <div className="border-b border-white/15 pb-4 mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">
                {currentDay.day} Schedule
              </h3>
              <span className="text-xs text-white/70 font-semibold">{currentDay.date} • Standard Field Shifts</span>
            </div>
            <span className="text-xs font-extrabold text-white bg-white/20 border border-white/30 px-3 py-1 rounded-full">
              {currentDay.tasks.length} Operations Planned
            </span>
          </div>

          {/* Timeline List */}
          <div className="relative pl-6 sm:pl-8 space-y-4 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/30">
            {currentDay.tasks.map((task, idx) => (
              <div key={idx} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl glass-surface border border-white/25 hover:border-white/50 transition-all">
                <div className="absolute -left-6 sm:-left-8 top-5 w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-900 shadow-xs" />

                <div className="flex items-center gap-3">
                  <div className="px-2.5 py-1 rounded-lg glass-surface border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-white" />
                    <span>{task.time}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {task.activity}
                  </h4>
                </div>

                <span className="self-start sm:self-auto text-[11px] font-bold text-white glass-surface border border-white/25 px-2.5 py-1 rounded-md">
                  {task.tag}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </main>
    </div>
  );
};
