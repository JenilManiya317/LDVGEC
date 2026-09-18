import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { FarmerSidebar } from '../../components/layout/FarmerSidebar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { CheckSquare, Calendar, Clock, CheckCircle2, Filter, Sparkles } from 'lucide-react';
import { MOCK_TODAYS_TASKS } from '../../lib/mock-data';
import { TaskInstruction } from '../../lib/types';

export const TodaysInstructionsPage: React.FC = () => {
  const { navigate } = useRouter();
  const [tasks, setTasks] = useState<TaskInstruction[]>(MOCK_TODAYS_TASKS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  const displayedTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex min-h-screen text-white">
      <FarmerSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-surface text-white text-xs font-bold mb-2 border border-white/20">
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span>{todayFormatted}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Today's Field Instructions
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-medium">
              Synchronized agronomic tasks for your cultivated plots.
            </p>
          </div>

          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => navigate('/farmer/timetable')}
            icon={<Clock className="w-4 h-4 text-white" />}
          >
            Weekly Timetable
          </GlassButton>
        </div>

        {/* Progress Card */}
        <GlassCard variant="elevated" className="p-6 border border-white/20">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-sm font-extrabold text-white">
              Daily Progress: {completedCount} of {tasks.length} tasks completed
            </span>
            <span className="text-xs font-black text-white bg-white/20 border border-white/30 px-3 py-0.5 rounded-full">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/20">
            <div
              className="h-full bg-white rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </GlassCard>

        {/* Filter Controls & Task List */}
        <GlassCard variant="elevated" className="p-6 sm:p-8 space-y-4 border border-white/20">
          <div className="flex items-center justify-between pb-3 border-b border-white/15">
            <span className="text-xs font-extrabold uppercase tracking-wider text-white/80">
              Task Checklist
            </span>
            <div className="flex items-center gap-1 glass-surface p-1 rounded-xl border border-white/20">
              {(['all', 'pending', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${filter === f
                      ? 'bg-white text-slate-950 shadow-md font-extrabold'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {displayedTasks.map((task) => (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                onClick={() => toggleTask(task.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 select-none ${task.completed
                    ? 'glass-surface-subtle border-white/15 opacity-60'
                    : 'glass-surface border-white/25 hover:border-white/50 shadow-xs'
                  }`}
              >
                {/* Custom Checkbox */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${task.completed
                      ? 'bg-white text-slate-950 font-black'
                      : 'border-2 border-white/40 bg-black/30 hover:border-white'
                    }`}
                >
                  {task.completed && <CheckCircle2 className="w-4 h-4 text-slate-950" />}
                </div>

                {/* Task Details */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4
                      className={`text-sm font-bold ${task.completed ? 'line-through text-white/50' : 'text-white'
                        }`}
                    >
                      {task.title}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-white glass-surface px-2 py-0.5 rounded-md border border-white/25">
                      <Clock className="w-3 h-3 text-white" />
                      {task.time}
                    </span>
                  </div>

                  {task.notes && (
                    <p className="text-xs text-white/80 mt-1 leading-relaxed font-medium">
                      {task.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/70 font-medium">
            <span>Click any task to toggle state.</span>
            <span className="font-bold text-white">Auto-saved to farm diary</span>
          </div>
        </GlassCard>
      </main>
    </div>
  );
};
