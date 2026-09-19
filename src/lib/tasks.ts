import { TaskInstruction } from './types';
import { MOCK_TODAYS_TASKS } from './mock-data';

const TASKS_STORAGE_KEY = 'agrisetu_farmer_tasks_v1';

/**
 * Retrieve current farmer tasks from localStorage or initialize with mock tasks.
 */
export function getFarmerTasks(): TaskInstruction[] {
  try {
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading farmer tasks from storage:', err);
  }
  return MOCK_TODAYS_TASKS;
}

/**
 * Save tasks array to localStorage.
 */
export function saveFarmerTasks(tasks: TaskInstruction[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.warn('Error saving farmer tasks to storage:', err);
  }
}

/**
 * Add a new task (e.g. from AI Crop Health diagnosis) to the front of the list.
 */
export function addFarmerTask(
  taskData: Omit<TaskInstruction, 'id'> & { id?: string }
): TaskInstruction {
  const current = getFarmerTasks();
  const newTask: TaskInstruction = {
    ...taskData,
    id: taskData.id || `task_ai_${Date.now()}`,
    completed: taskData.completed ?? false
  };

  const updated = [newTask, ...current];
  saveFarmerTasks(updated);
  return newTask;
}

/**
 * Toggle completion status of a task by ID.
 */
export function toggleFarmerTask(id: string): TaskInstruction[] {
  const current = getFarmerTasks();
  const updated = current.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveFarmerTasks(updated);
  return updated;
}
