import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Transaction, TransactionType } from '../types';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { translations } from '../constants/translations';

interface Props {
  transactions: Transaction[];
  darkMode?: boolean;
  lang: 'ar' | 'en';
}

export const StatsChart: React.FC<Props> = ({ transactions, darkMode, lang }) => {
  const [chartType, setChartType] = useState<'PIE' | 'BAR'>('PIE');
  const t = translations[lang];

  const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE || t.type === TransactionType.CREDIT_SPEND);
  const expenseDataMap = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(expenseDataMap).map(key => ({
    name: key,
    value: expenseDataMap[key]
  }));

  const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === TransactionType.EXPENSE || t.type === TransactionType.CREDIT_SPEND).reduce((s, t) => s + t.amount, 0);
  const totalSavings = transactions.filter(t => t.type === TransactionType.SAVING).reduce((s, t) => s + t.amount, 0);

  const barData = [
    { name: t.income, value: totalIncome, fill: '#10b981' },
    { name: t.expense, value: totalExpense, fill: '#f43f5e' },
    { name: t.saving, value: totalSavings, fill: '#3b82f6' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

  const tooltipStyle = {
    backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    color: darkMode ? '#f1f5f9' : '#1e293b',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(8px)',
    padding: '12px',
    border: '1px solid',
    fontSize: '14px'
  };

  return (
    <div className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-white/20 dark:border-slate-700/50 transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
            {chartType === 'PIE' ? (lang === 'ar' ? 'توزيع المصروفات' : 'Expense Distribution') : t.balance}
        </h3>
        <div className="flex bg-gray-100/80 dark:bg-slate-900/50 p-1.5 rounded-xl border border-gray-200/50 dark:border-slate-700/50">
            <button 
                onClick={() => setChartType('PIE')}
                className={`p-2 rounded-lg transition-all duration-300 ${chartType === 'PIE' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-300 scale-100' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600'}`}
            >
                <PieIcon size={18} />
            </button>
            <button 
                onClick={() => setChartType('BAR')}
                className={`p-2 rounded-lg transition-all duration-300 ${chartType === 'BAR' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-300 scale-100' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600'}`}
            >
                <BarChart3 size={18} />
            </button>
        </div>
      </div>

      <div className="h-64 w-full">
        {chartType === 'PIE' ? (
             pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={6}
                        dataKey="value"
                        stroke="none"
                    >
                        {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{padding: 0}} />
                    <Legend iconType="circle" formatter={(value) => <span className="text-gray-600 dark:text-slate-300 text-xs font-medium mr-2">{value}</span>} />
                    </PieChart>
                </ResponsiveContainer>
             ) : (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
                     <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-full mb-3">
                        <PieIcon size={32} className="opacity-50" />
                     </div>
                     <p className="text-sm font-medium">{t.noTransactions}</p>
                 </div>
             )
        ) : (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                    <XAxis dataKey="name" tick={{fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                    <YAxis hide />
                    <Tooltip cursor={{fill: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}} contentStyle={tooltipStyle} />
                    <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                    {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};