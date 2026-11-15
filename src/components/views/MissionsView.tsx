'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  AlertTriangle,
  X,
  Sparkles,
  ListTodo,
} from 'lucide-react';
import { api } from '@/lib/apiClient';

export function MissionsView() {
  const [missions, setMissions] = useState<any[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form states
  const [formData, setFormData] = useState<any>({
    code: '',
    name: '',
    region: 'Jezero Crater (Delta Front)',
    status: 'active',
    objectives: '',
    scientific_targets: '',
    notes: '',
    progress_percent: 0,
  });

  const [taskFormData, setTaskFormData] = useState<any>({
    title: '',
    description: '',
    category: 'sampling',
    priority: 'high',
    progress_percent: 0,
    target_lat: 18.38,
    target_lon: 77.58,
  });

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const data = await api.getMissions();
      setMissions(data);
      if (data.length > 0 && selectedMissionId === null) {
        setSelectedMissionId(data[0].id);
      }
      setError(null);
    } catch (err: any) {
      console.warn('Missions fetch notice:', err);
      setError(err.message || 'Connecting to missions backend...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const selectedMission = missions.find((m) => m.id === selectedMissionId) || missions[0];

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMission(formData);
      setIsCreateOpen(false);
      setFormData({
        code: '',
        name: '',
        region: 'Jezero Crater (Delta Front)',
        status: 'active',
        objectives: '',
        scientific_targets: '',
        notes: '',
        progress_percent: 0,
      });
      await fetchMissions();
    } catch (err: any) {
      alert(`Create failed: ${err.message}. (Admin privileges required; sign in via Settings)`);
    }
  };

  const handleUpdateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMission) return;
    try {
      await api.updateMission(selectedMission.id, formData);
      setIsEditOpen(false);
      await fetchMissions();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleDeleteMission = async (id: number) => {
    try {
      await api.deleteMission(id);
      setDeleteConfirmId(null);
      setSelectedMissionId(null);
      await fetchMissions();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMission) return;
    try {
      await api.addMissionTask(selectedMission.id, taskFormData);
      setIsAddTaskOpen(false);
      setTaskFormData({
        title: '',
        description: '',
        category: 'sampling',
        priority: 'high',
        progress_percent: 0,
        target_lat: 18.38,
        target_lon: 77.58,
      });
      await fetchMissions();
    } catch (err: any) {
      alert(`Add task failed: ${err.message}`);
    }
  };

  const handleUpdateTaskProgress = async (taskId: number, newProgress: number) => {
    try {
      const newStatus = newProgress >= 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'pending';
      await api.updateTask(taskId, { progress_percent: newProgress, status: newStatus });
      await fetchMissions();
    } catch (err: any) {
      alert(`Task update notice: ${err.message}`);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 font-mono select-none text-zinc-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
              Mission Operations & Campaign Traverses
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-wider mt-0.5">
            SURFACE EXPLORATION MISSIONS
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Manage planetary campaigns, scientific sampling objectives, and task progress.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              code: `MARS-SOL-${Math.floor(Math.random() * 900 + 100)}`,
              name: '',
              region: 'Jezero Crater (Western Delta)',
              status: 'active',
              objectives: '',
              scientific_targets: '',
              notes: '',
              progress_percent: 0,
            });
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-bold text-xs tracking-wide shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Mission Campaign</span>
        </button>
      </div>

      {/* Main Grid: Mission List (Left) + Detail & Task Manager (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Mission Cards */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Registered Campaigns ({missions.length})
          </span>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {missions.map((mission) => {
              const isSelected = mission.id === selectedMission?.id;
              const statusColors: Record<string, string> = {
                active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                completed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
                planned: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                paused: 'bg-zinc-700/30 text-zinc-400 border-zinc-700/50',
              };

              return (
                <div
                  key={mission.id}
                  onClick={() => setSelectedMissionId(mission.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-zinc-900 border-cyan-500 shadow-[0_0_15px_rgba(0,240,255,0.2)] text-white'
                      : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50 text-zinc-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">
                      {mission.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        statusColors[mission.status] || statusColors.active
                      }`}
                    >
                      {mission.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-100 mt-1">{mission.name}</h3>
                  <span className="text-[11px] text-zinc-400 block mt-0.5 font-sans">
                    {mission.region}
                  </span>

                  {/* Progress bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-500">Progress</span>
                      <span className="text-cyan-400 font-bold">{mission.progress_percent}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-cyan-400 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${mission.progress_percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Mission Detail View & Tasks Workspace */}
        {selectedMission ? (
          <div className="lg:col-span-8 rounded-xl bg-zinc-950/90 border border-zinc-800 p-5 space-y-5 shadow-2xl">
            {/* Mission Detail Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    {selectedMission.code}
                  </span>
                  <span className="text-xs text-zinc-400">Sol {selectedMission.sol_start} — {selectedMission.sol_end || 'Current'}</span>
                </div>
                <h2 className="text-lg font-black text-white tracking-wide mt-1">
                  {selectedMission.name}
                </h2>
                <span className="text-xs text-mars-400">{selectedMission.region}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFormData(selectedMission);
                    setIsEditOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setDeleteConfirmId(selectedMission.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-xs font-semibold text-red-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Scientific Objectives & Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-800 flex flex-col gap-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  Campaign Objectives
                </span>
                <p className="text-zinc-300 font-sans leading-relaxed">
                  {selectedMission.objectives || 'No detailed objectives filed.'}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-800 flex flex-col gap-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  Scientific Targets & Mineralogy
                </span>
                <p className="text-zinc-300 font-sans leading-relaxed">
                  {selectedMission.scientific_targets || 'General geological survey.'}
                </p>
              </div>
            </div>

            {/* Tasks Checklist & Progress Management */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Operational Tasks ({selectedMission.tasks?.length || 0})
                  </span>
                </div>
                <button
                  onClick={() => setIsAddTaskOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-cyan-400 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {selectedMission.tasks?.map((task: any) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/80 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            task.status === 'completed'
                              ? 'bg-emerald-400'
                              : task.status === 'in_progress'
                              ? 'bg-cyan-400 animate-pulse'
                              : 'bg-zinc-500'
                          }`}
                        />
                        <span className="text-xs font-bold text-white">{task.title}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400">
                        {task.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 font-sans">{task.description}</p>

                    {/* Progress slider */}
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[10px] text-zinc-500 w-12">Progress:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={task.progress_percent}
                        onChange={(e) => handleUpdateTaskProgress(task.id, parseInt(e.target.value))}
                        className="flex-1 accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                      />
                      <span className="text-[10px] font-bold text-cyan-400 w-8 text-right">
                        {task.progress_percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 flex flex-col items-center justify-center p-12 text-zinc-500">
            <span>Select a mission from the list</span>
          </div>
        )}
      </div>

      {/* CREATE MISSION MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateMission}
            className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Create New Mission Campaign
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Mission Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Exploration Region</label>
                <input
                  type="text"
                  required
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Objectives</label>
                <textarea
                  rows={3}
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Scientific Targets</label>
                <input
                  type="text"
                  value={formData.scientific_targets}
                  onChange={(e) => setFormData({ ...formData, scientific_targets: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded bg-zinc-900 text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-cyan-500 text-black font-bold hover:bg-cyan-400"
              >
                Create Campaign
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT MISSION MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdateMission}
            className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Edit Mission Campaign
              </h3>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                >
                  <option value="active">Active</option>
                  <option value="planned">Planned</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Objectives</label>
                <textarea
                  rows={3}
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 rounded bg-zinc-900 text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-cyan-500 text-black font-bold hover:bg-cyan-400"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddTask}
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Add Mission Task
              </h3>
              <button
                type="button"
                onClick={() => setIsAddTaskOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Category</label>
                <select
                  value={taskFormData.category}
                  onChange={(e) => setTaskFormData({ ...taskFormData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                >
                  <option value="sampling">Sampling (Core extraction / scoop)</option>
                  <option value="analysis">Analysis (Spectroscopy / chemistry)</option>
                  <option value="observation">Observation (Panorama / radar)</option>
                  <option value="traverse">Traverse (Driving waypoint)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAddTaskOpen(false)}
                className="px-4 py-2 rounded bg-zinc-900 text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-cyan-500 text-black font-bold hover:bg-cyan-400"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-950 border border-red-500/50 rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Deletion</span>
            </div>
            <p className="text-xs text-zinc-300 font-sans">
              Are you sure you want to delete this mission? All linked tasks will be permanently removed from PostgreSQL.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded bg-zinc-900 text-zinc-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMission(deleteConfirmId)}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                Delete Mission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
