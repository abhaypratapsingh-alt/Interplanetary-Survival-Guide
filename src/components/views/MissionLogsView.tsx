'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  Download,
  Plus,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  X,
  FileText,
} from 'lucide-react';
import { api } from '@/lib/apiClient';

export function MissionLogsView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    category: 'science',
    severity: 'info',
    description: '',
    mission_code: 'MARS-2026-JZ',
    data_source: 'Manual Flight Director Entry',
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getLogs({
        category: selectedCategory,
        severity: selectedSeverity,
        search: search || undefined,
      });
      setLogs(data);
    } catch (err) {
      console.warn('Logs load notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedCategory, selectedSeverity, search]);

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLog(formData);
      setIsAddOpen(false);
      setFormData({
        category: 'science',
        severity: 'info',
        description: '',
        mission_code: 'MARS-2026-JZ',
        data_source: 'Manual Flight Director Entry',
      });
      await fetchLogs();
    } catch (err: any) {
      alert(`Create log failed: ${err.message}`);
    }
  };

  const severityBadge: Record<string, { bg: string; text: string; border: string }> = {
    critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40' },
    error: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    warning: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    info: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 font-mono select-none text-zinc-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
              Flight Operations Chronology & Event Log
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-wider mt-0.5">
            MISSION EVENT & TELEMETRY LOGS
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Immutable database records of rover commands, science experiments, AutoNav traverses, and DSN communications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV */}
          <a
            href={api.getLogExportUrl()}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </a>

          {/* Add Entry */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-black transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Log Entry</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search log descriptions or mission codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-zinc-500 text-[10px] uppercase mr-1">Severity:</span>
          {['all', 'info', 'warning', 'error', 'critical'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2.5 py-1 rounded text-xs capitalize ${
                selectedSeverity === sev
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl bg-zinc-950/90 border border-zinc-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3">Timestamp (UTC)</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Data Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {logs.map((log) => {
                const badge = severityBadge[log.severity] || severityBadge.info;
                return (
                  <tr key={log.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-zinc-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap uppercase text-[10px] font-bold text-zinc-300">
                      {log.category}
                    </td>
                    <td className="px-4 py-3 text-white font-sans text-xs">
                      {log.description}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-cyan-400 text-[11px]">
                      {log.mission_code || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-zinc-500 text-[10px]">
                      {log.data_source}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD LOG MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateLog}
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Dispatch Manual Mission Log
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                >
                  <option value="science">Science</option>
                  <option value="telemetry">Telemetry</option>
                  <option value="navigation">Navigation</option>
                  <option value="hazard">Hazard</option>
                  <option value="system">System</option>
                  <option value="comm">Communication</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Event Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                  placeholder="Record observation, command result, or anomaly..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded bg-zinc-900 text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-cyan-500 text-black font-bold hover:bg-cyan-400"
              >
                Dispatch Log
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
