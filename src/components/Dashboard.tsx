
import React, { useMemo, useState } from 'react';
import { Server, ServerStatus } from '../types';
import { Users, UserCheck, UserX, LayoutDashboard, PieChart as PieIcon, X, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  servers: Server[];
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'];

const Dashboard: React.FC<DashboardProps> = ({ servers }) => {
  const [selectedGroup, setSelectedGroup] = useState<{ name: string, status: ServerStatus } | null>(null);

  const activeServers = servers.filter(s => s.status === ServerStatus.ACTIVO);
  const inactiveServers = servers.filter(s => s.status === ServerStatus.INACTIVO);

  const activeGroupData = useMemo(() => {
    const counts: Record<string, number> = {};
    activeServers.forEach(s => {
      const g = String(s.group || 'Sin Grupo');
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value], i) => ({ 
      name, 
      value, 
      color: COLORS[i % COLORS.length] 
    }));
  }, [activeServers]);

  const inactiveGroupData = useMemo(() => {
    const counts: Record<string, number> = {};
    inactiveServers.forEach(s => {
      const g = String(s.group || 'Sin Grupo');
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value], i) => ({ 
      name, 
      value, 
      color: COLORS[i % COLORS.length] 
    }));
  }, [inactiveServers]);

  const serversInSelectedGroup = useMemo(() => {
    if (!selectedGroup) return [];
    return servers.filter(s => s.group === selectedGroup.name && s.status === selectedGroup.status)
      .sort((a, b) => (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName));
  }, [selectedGroup, servers]);

  const renderChartSection = (title: string, data: any[], icon: any, colorClass: string, status: ServerStatus) => (
    <div className="card-chrome p-5 rounded-[2.5rem] flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 border-b border-slate-50 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${colorClass} bg-opacity-10`}>
                {React.createElement(icon, { size: 14, className: colorClass.replace('bg-', 'text-') })}
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                {title}
            </h3>
        </div>
      </div>
      
      <div className="h-48 w-full relative">
        {data.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                <PieIcon size={32} />
                <p className="text-[8px] font-bold uppercase mt-2">Sin datos</p>
            </div>
        ) : (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                        labelLine={false}
                        label={false}
                    >
                        {data.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ borderRadius: '15px', border: 'none', backgroundColor: '#1e293b', color: '#fff', fontSize: '10px' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 mt-4">
        {data.map(d => (
          <button 
            key={d.name} 
            onClick={() => setSelectedGroup({ name: d.name, status })}
            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/50 active:scale-[0.97] transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{backgroundColor: d.color}}></span>
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider truncate">{d.name}</p>
            </div>
            <div className="flex items-center gap-2">
                <p className="text-[12px] font-black text-slate-900 dark:text-slate-100">{d.value}</p>
                <ChevronRight size={12} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-2 px-1">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Estadísticas</h2>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Estado del Ministerio</p>
        </div>
        <div className="w-10 h-10 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center">
          <LayoutDashboard size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="card-chrome p-6 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform"><Users size={120} /></div>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Users size={28} />
            </div>
            <div>
              <p className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter">{servers.length}</p>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Servidores Registrados</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card-chrome p-5 rounded-[2.5rem] border-emerald-50 dark:border-emerald-900/20">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-md shadow-emerald-500/20">
              <UserCheck size={20} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{activeServers.length}</p>
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1">Activos</p>
          </div>

          <div className="card-chrome p-5 rounded-[2.5rem] border-rose-50 dark:border-rose-900/20">
            <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-md shadow-rose-500/20">
              <UserX size={20} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{inactiveServers.length}</p>
            <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mt-1">Inactivos</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderChartSection("Activos por Grupo", activeGroupData, UserCheck, "bg-blue-600", ServerStatus.ACTIVO)}
        {renderChartSection("Inactivos por Grupo", inactiveGroupData, UserX, "bg-rose-600", ServerStatus.INACTIVO)}
      </div>

      {/* Modal de Desglose de Servidores */}
      {selectedGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedGroup(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-scale-up flex flex-col max-h-[70vh]">
            <div className={`p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center ${selectedGroup.status === ServerStatus.ACTIVO ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'bg-rose-50/50 dark:bg-rose-900/10'}`}>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${selectedGroup.status === ServerStatus.ACTIVO ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedGroup.status === ServerStatus.ACTIVO ? 'Servidores Activos' : 'Servidores Inactivos'}
                </p>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedGroup.name}</h3>
              </div>
              <button onClick={() => setSelectedGroup(null)} className="p-2.5 text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-full shadow-sm transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
              {serversInSelectedGroup.length === 0 ? (
                <p className="text-center py-10 text-slate-400 text-xs italic">No hay servidores en esta categoría.</p>
              ) : (
                serversInSelectedGroup.map((server) => (
                  <div key={server.id} className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${selectedGroup.status === ServerStatus.ACTIVO ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {server.firstName[0]}
                    </div>
                    <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
                      {server.firstName} {server.lastName}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total: {serversInSelectedGroup.length} Servidores</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
