
import React, { useState } from 'react';
import { ChevronLeft, Key, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PinManagerProps {
  currentPin: string;
  onSave: (newPin: string) => void;
  onClose: () => void;
}

const PinManager: React.FC<PinManagerProps> = ({ currentPin, onSave, onClose }) => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) return alert("El PIN debe ser de 4 dígitos.");
    if (newPin !== confirmPin) return alert("Los códigos no coinciden.");
    
    onSave(newPin);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-slate-950 h-full flex flex-col animate-slide-up transition-colors duration-300">
      <div className="flex items-center gap-3 p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur z-10">
        <button onClick={onClose} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Código de Acceso</h2>
      </div>

      <div className="p-8 flex-1 flex flex-col items-center space-y-12">
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
          <Key size={32} />
        </div>

        <form onSubmit={handleSave} className="w-full space-y-8">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nuevo PIN (4 dígitos)</label>
              <input
                type="password"
                maxLength={4}
                required
                pattern="\d{4}"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl text-3xl font-black text-center tracking-[1em] focus:ring-4 focus:ring-blue-600/20 border-none outline-none dark:text-white transition-all shadow-inner"
                placeholder="••••"
              />
            </div>

            <div className="space-y-2 text-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirmar PIN</label>
              <input
                type="password"
                maxLength={4}
                required
                pattern="\d{4}"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl text-3xl font-black text-center tracking-[1em] focus:ring-4 focus:ring-blue-600/20 border-none outline-none dark:text-white transition-all shadow-inner"
                placeholder="••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={newPin.length !== 4 || newPin !== confirmPin || isSaved}
            className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
              isSaved 
                ? 'bg-emerald-600 text-white' 
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
            }`}
          >
            {isSaved ? <CheckCircle2 size={20} /> : <ShieldCheck size={20} />}
            {isSaved ? 'PIN Actualizado' : 'Guardar Nuevo Código'}
          </button>
        </form>

        <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
          Este código se utiliza localmente para proteger el acceso a los datos del Ministerio en este dispositivo.
        </p>
      </div>
    </div>
  );
};

export default PinManager;
