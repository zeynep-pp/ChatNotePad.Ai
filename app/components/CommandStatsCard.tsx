"use client";

import { useState, useEffect } from 'react';
import { CommandHistoryItem } from '../types';

interface CommandStatsCardProps {
  timeRange: '7d' | '30d' | '90d';
  onTimeRangeChange: (range: '7d' | '30d' | '90d') => void;
  commandHistory: CommandHistoryItem[];
  className?: string;
}

interface StatsData {
  totalCommands: number;
  successRate: number;
  avgProcessingTime: number;
  popularCommands: Array<{ command: string; count: number; successRate: number }>;
  dailyUsage: Array<{ date: string; count: number; successCount: number }>;
}

export default function CommandStatsCard({
  timeRange,
  onTimeRangeChange,
  commandHistory,
  className = ""
}: CommandStatsCardProps) {
  const [stats, setStats] = useState<StatsData>({
    totalCommands: 0,
    successRate: 0,
    avgProcessingTime: 0,
    popularCommands: [],
    dailyUsage: []
  });

  useEffect(() => {
    calculateStats();
  }, [commandHistory, timeRange]);

  const calculateStats = () => {
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    const filteredHistory = commandHistory.filter(item => 
      item.timestamp >= cutoffDate
    );

    if (filteredHistory.length === 0) {
      setStats({
        totalCommands: 0,
        successRate: 0,
        avgProcessingTime: 0,
        popularCommands: [],
        dailyUsage: []
      });
      return;
    }

    // Basic stats
    const totalCommands = filteredHistory.length;
    const successfulCommands = filteredHistory.filter(item => item.success).length;
    const successRate = (successfulCommands / totalCommands) * 100;
    
    // Average processing time
    const processingTimes = filteredHistory
      .filter(item => item.agentInfo?.processing_time_ms)
      .map(item => item.agentInfo!.processing_time_ms);
    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;

    // Popular commands
    const commandCounts = new Map<string, { count: number; successCount: number }>();
    filteredHistory.forEach(item => {
      const existing = commandCounts.get(item.command) || { count: 0, successCount: 0 };
      commandCounts.set(item.command, {
        count: existing.count + 1,
        successCount: existing.successCount + (item.success ? 1 : 0)
      });
    });

    const popularCommands = Array.from(commandCounts.entries())
      .map(([command, data]) => ({
        command,
        count: data.count,
        successRate: (data.successCount / data.count) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Daily usage for the last 7 days (regardless of timeRange for chart)
    const dailyUsage: Array<{ date: string; count: number; successCount: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayCommands = commandHistory.filter(item => 
        item.timestamp >= dayStart && item.timestamp < dayEnd
      );
      
      dailyUsage.push({
        date: dateStr,
        count: dayCommands.length,
        successCount: dayCommands.filter(item => item.success).length
      });
    }

    setStats({
      totalCommands,
      successRate,
      avgProcessingTime,
      popularCommands,
      dailyUsage
    });
  };

  const formatProcessingTime = (ms: number) => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${Math.round(ms)}ms`;
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 dark:text-green-400';
    if (rate >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Command Statistics
        </h3>
        <div className="flex space-x-1">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {stats.totalCommands === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">No data available for this time period</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalCommands}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Commands
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getSuccessRateColor(stats.successRate)}`}>
                {stats.successRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Success Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatProcessingTime(stats.avgProcessingTime)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Avg Processing Time
              </div>
            </div>
          </div>

          {/* Daily Usage Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Daily Usage (Last 7 Days)
            </h4>
            <div className="h-32 flex items-end justify-between space-x-1">
              {stats.dailyUsage.map((day, index) => {
                const maxCount = Math.max(...stats.dailyUsage.map(d => d.count), 1);
                const height = (day.count / maxCount) * 100;
                const successHeight = (day.successCount / maxCount) * 100;
                
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="w-full relative bg-gray-200 dark:bg-gray-700 rounded">
                      <div
                        className="bg-red-400 rounded-b"
                        style={{ height: `${height}%`, minHeight: day.count > 0 ? '2px' : '0' }}
                      />
                      <div
                        className="bg-green-400 rounded-b absolute bottom-0 left-0 right-0"
                        style={{ height: `${successHeight}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 transform -rotate-45 origin-center">
                      {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center space-x-4 mt-2 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Success</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Failed</span>
              </div>
            </div>
          </div>

          {/* Popular Commands */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Most Popular Commands
            </h4>
            <div className="space-y-2">
              {stats.popularCommands.map((cmd, index) => (
                <div
                  key={cmd.command}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {cmd.command.length > 30 ? `${cmd.command.substring(0, 30)}...` : cmd.command}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {cmd.count} uses • {cmd.successRate.toFixed(0)}% success
                    </div>
                  </div>
                  <div className="ml-2 text-right">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      #{index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}