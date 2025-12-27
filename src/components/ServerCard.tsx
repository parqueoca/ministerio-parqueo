
import React, { useState } from 'react';
import { Server, ServerStatus } from '../types';
import { Edit, MessageCircle, CheckCircle, Trash2, Calendar, Cake, Phone, User, Printer, Loader2 } from 'lucide-react';
import { formatDateDisplay, calculateAge, calculateTimeUntilBirthday } from '../utils/formatters';
import { generateSingleServerPDF } from '../services/pdfGenerator';

interface ServerCardProps {
  server: Server;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (server: Server) => void;
  onDelete: (id: string) => void;
}

const ServerCard: React.FC<ServerCardProps> = ({ server, isSelected, onToggleSelect, onEdit, onDelete }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  
  const statusColors = {
    [ServerStatus.ACTIVO]: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    [ServerStatus.INACTIVO]: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800',
  };

  const displayName = server.firstName && server.lastName 
    ? `${server.firstName} ${server.lastName}`
    : server.fullName || 'Sin Nombre';

  const displayPhone = server.mobile || (server as any).phone || '';

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    let cleanPhone = displayPhone.replace(/\D/g, '');
    
    // Si el número tiene 10 dígitos (formato DR/NA), añadimos el '1' para formato internacional
    if (cleanPhone.length === 10) {
      cleanPhone = '1' + cleanPhone;
    }
    
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    } else {
      alert("Este servidor no tiene un número de teléfono válido.");
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (displayPhone) {
      window.location.href = `tel:${displayPhone.replace(/\D/g, '')}`;
    }
  };

  const handlePrint = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPrinting) return;
    setIsPrinting(true);
    try {
      await generateSingleServerPDF(server);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div 
      className={`card-chrome rounded-3xl p-5 transition-all animate-slide-up ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => onToggleSelect(server.id)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4 min-w-0">
            <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center border overflow-hidden ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                {isSelected ? (
                   <CheckCircle size={24} className="text-white" />
                ) : server.photo ? (
                   <img src={server.photo} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                   <User size={26} className="text-slate-300 dark:text-slate-500" />
                )}
            </div>

            <div className="min-w-0">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-[15px] leading-tight truncate">{displayName}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">{server.group}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black border uppercase ${statusColors[server.status]}`}>
                    {server.status}
                    </span>
                </div>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-5">
         <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
              <Calendar size={10} className="text-blue-500" /> Fecha Nac.
            </div>
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
              {formatDateDisplay(server.birthDate)}
            </p>
         </div>
         <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
              <Cake size={10} className="text-pink-500" /> Cumpleaños
            </div>
            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 truncate">
              {calculateTimeUntilBirthday(server.birthDate)}
            </p>
         </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-2">
            <button 
                type="button"
                onClick={handleWhatsApp}
                className="p-3 bg-emerald-600 text-white rounded-xl shadow-md active:scale-95 transition-all"
            >
                <MessageCircle size={18} />
            </button>
            <button 
                type="button"
                onClick={handleCall}
                className="p-3 bg-blue-600 text-white rounded-xl shadow-md active:scale-95 transition-all"
            >
                <Phone size={18} />
            </button>
        </div>
        
        <div className="flex gap-1.5 relative z-10">
            <button 
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
            </button>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(server); }}
              className="p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <Edit size={18} />
            </button>
            <button 
              type="button"
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                onDelete(server.id); 
              }}
              className="btn-delete-active relative z-50 p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl active:scale-90 transition-transform"
            >
              <Trash2 size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ServerCard;
