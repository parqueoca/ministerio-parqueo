
import React, { useMemo } from 'react';
import { Server, ServerStatus } from '../types';
import { Users, UserCheck, UserX, LayoutDashboard } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  servers: Server[];
}

const COLORS = ['#2563eb', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

const Dashboard: React.FC<DashboardProps> = ({ servers }) => {
  const activeCount = servers.filter(s => s.status === ServerStatus.ACTIVO).length;
  const inactiveCount = servers.filter(s => s.status === ServerStatus.INACTIVO).length;

  const groupData = useMemo(() => {
    const counts: Record<string, number> = {};
    servers.forEach(s => {
      const g = String(s.group || 'Sin Grupo');
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value], i) => ({ 
      name, 
      value, 
      color: COLORS[i % COLORS.length] 
    }));
  }, [servers]);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-2 px-1">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Estadísticas</h2>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Visión General</p>
        </div>
        <div className="w-10 h-10 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center">
          <LayoutDashboard size={20} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="card-chrome p-6 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform"><Users size={120} /></div>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Users size={28} />
            </div>
            <div>
              <p className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter">{servers.length}</p>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Servidores</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card-chrome p-5 rounded-[2rem] border-emerald-50 dark:border-emerald-900/20">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-md shadow-emerald-500/20">
              <UserCheck size={20} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{activeCount}</p>
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1">Activos</p>
          </div>

          <div className="card-chrome p-5 rounded-[2rem] border-rose-50 dark:border-rose-900/20">
            <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-md shadow-rose-500/20">
              <UserX size={20} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{inactiveCount}</p>
            <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mt-1">Inactivos</p>
          </div>
        </div>
      </div>

      <div className="card-chrome p-6 rounded-[2.5rem]">
        <div className="flex justify-between items-center mb-6 border-b border-slate-50 dark:border-slate-800 pb-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400">
            Fuerza por Grupos
          </h3>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={groupData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={5}
                dataKey="value"
              >
                {groupData.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }}
                itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          {groupData.map(d => (
            <div key={d.name} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: d.color}}></span>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">{d.name}</p>
                <p className="text-[13px] font-extrabold text-slate-900 dark:text-slate-100">{d.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
