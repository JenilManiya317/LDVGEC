import React, { useState, useEffect } from 'react';
import { useRouter } from '../../lib/router';
import { FarmerSidebar } from '../../components/layout/FarmerSidebar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { CheckSquare, Calendar, Clock, CheckCircle2, Filter, Sparkles, PlusCircle, ScanEye } from 'lucide-react';
import { TaskInstruction } from '../../lib/types';
import { getFarmerTasks, toggleFarmerTask } from '../../lib/tasks';

export const TodaysInstructionsPage: React.FC = () => {
  const { navigate } = useRouter();
  const [tasks, setTasks] = useState<TaskInstruction[]>(() => getFarmerTasks());
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    // Reload tasks when visiting page
    setTasks(getFarmerTasks());
  }, []);

  const handleToggleTask = (id: string) => {
    const updated = toggleFarmerTask(id);
    setTasks(updated);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const displayedTasks = tasks.filter((t) => {
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
              Synchronized agronomic tasks & AI biological remediation directives for your farm.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => navigate('/farmer/crop-health')}
              icon={<ScanEye className="w-4 h-4 text-white" />}
            >
              Scan Crop AI
            </GlassButton>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => navigate('/farmer/timetable')}
              icon={<Clock className="w-4 h-4 text-white" />}
            >
              Timetable
            </GlassButton>
          </div>
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
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    filter === f
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
            {displayedTasks.map((task) => {
              const isAiTask = task.id.startsWith('task_ai_') || task.priority === 'High';

              return (
                <div
                  key={task.id}
                  id={`task-item-${task.id}`}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 select-none ${
                    task.completed
                      ? 'glass-surface-subtle border-white/15 opacity-60'
                      : isAiTask
                      ? 'glass-surface border-amber-400/50 hover:border-amber-300 bg-amber-500/10 shadow-md'
                      : 'glass-surface border-white/25 hover:border-white/50 shadow-xs'
                  }`}
                >
                  {/* Custom Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      task.completed
                        ? 'bg-white text-slate-950 font-black'
                        : isAiTask
                        ? 'border-2 border-amber-300 bg-black/40 hover:border-white'
                        : 'border-2 border-white/40 bg-black/30 hover:border-white'
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="w-4 h-4 text-slate-950" />}
                  </div>

                  {/* Task Details */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-bold ${
                            task.completed ? 'line-through text-white/50' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </h4>
                        {isAiTask && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            AI Crop Health Action
                          </span>
                        )}
                      </div>
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
              );
            })}
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
