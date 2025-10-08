import React, { useState, useEffect } from 'react';
import { Users, BookOpen, FolderOpen, Bell, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalInstructors: 0,
    totalCategories: 0,
    totalCourses: 0,
    purchasesThisMonth: 0,
    categoryStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await apiService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Dashboard stats error:', error);

      setStats({
        totalInstructors: 0,
        totalCategories: 4,
        totalCourses: 0,
        purchasesThisMonth: 0,
        categoryStats: [
          { categoryName: 'Full Stack', courseCount: 0, percentage: 0 },
          { categoryName: 'Backend', courseCount: 0, percentage: 0 },
          { categoryName: 'Frontend', courseCount: 0, percentage: 0 },
          { categoryName: 'UI-UX Design', courseCount: 0, percentage: 0 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const walletData = [
    { month: 'SEP', deposits: 85, withdrawals: 45 },
    { month: 'OCT', deposits: 95, withdrawals: 55 },
    { month: 'NOV', deposits: 108, withdrawals: 60 },
    { month: 'DEC', deposits: 120, withdrawals: 70 },
    { month: 'JAN', deposits: 110, withdrawals: 65 }
  ];

  const COLORS = ['#1e40af', '#3b82f6', '#e5e7eb'];

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Instructors',
      value: stats.totalInstructors,
      icon: Users
    },
    {
      name: 'Categories',
      value: stats.totalCategories,
      icon: FolderOpen
    },
    {
      name: 'Courses',
      value: stats.totalCourses,
      icon: BookOpen
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="relative">
          <Bell className="h-6 w-6 text-gray-600" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className="text-gray-600">{stat.name}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Icon className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {}
      <div className="grid grid-cols-2 gap-6">
        {}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Wallet</h3>
            <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors">
              <Calendar className="h-4 w-4" />
              <span>This month</span>
            </button>
          </div>

          <div className="mb-6">
            <p className="text-3xl font-bold text-blue-600 mb-2">$37.5K</p>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm text-gray-600">Wallet Balance</span>
              <div className="flex items-center space-x-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+2.45%</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">On your account</span>
            </div>
          </div>

          {}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Deposits</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
              <span className="text-sm text-gray-600">Withdrawals</span>
            </div>
          </div>

          {}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={walletData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="deposits"
                  stroke="#1e40af"
                  strokeWidth={3}
                  dot={{ fill: '#1e40af', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#1e40af', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="withdrawals"
                  stroke="#93c5fd"
                  strokeWidth={3}
                  dot={{ fill: '#93c5fd', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Statistics</h3>

          {}
          <div className="h-48 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="percentage"
                >
                  {stats.categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {}
          <div className="space-y-3">
            {stats.categoryStats.map((category, index) => (
              <div key={category.categoryName} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm text-gray-600">{category.categoryName}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{category.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
