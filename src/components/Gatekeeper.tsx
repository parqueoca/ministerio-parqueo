
import React, { useState } from 'react';
import { Lock, Delete } from 'lucide-react';

interface GatekeeperProps {
  correctPin: string;
  onAuthorized: () => void;
}

const MASTER_PIN = '7784'; // Código maestro universal

const Gatekeeper: React.FC<GatekeeperProps> = ({ correctPin, onAuthorized }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        if (newPin === correctPin || newPin === MASTER_PIN) {
          onAuthorized();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-white dark:bg-slate-950 flex flex-col items-center justify-between p-8 animate-fade-in overflow-hidden">
      {/* Logo & Header */}
      <div className="w-full flex flex-col items-center mt-12 space-y-4 animate-scale-up">
        <div className="w-28 h-28 bg-white dark:bg-white rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden border-4 border-slate-50 dark:border-slate-900">
           <img 
            src="./logo.png" 
            alt="CA Logo" 
            className="w-full h-full object-cover p-2"
            onError={(e) => {
              // Si falla al cargar el logo.png, mostramos el logo por defecto de initials
              e.currentTarget.src = "https://api.dicebear.com/7.x/initials/svg?seed=CA&backgroundColor=000000&textColor=ffffff";
            }}
           />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Ministerio Servicio Parqueo</h1>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1 italic">Cielos Abiertos</p>
        </div>
      </div>

      {/* PIN Display */}
      <div className="flex flex-col items-center space-y-6">
        <div className={`flex gap-5 transition-transform ${error ? 'animate-shake' : ''}`}>
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                pin.length > i 
                  ? 'bg-blue-600 border-blue-600 scale-125 shadow-lg shadow-blue-500/40' 
                  : 'bg-transparent border-slate-200 dark:border-slate-800'
              } ${error ? 'bg-rose-500 border-rose-500 shadow-rose-500/40' : ''}`}
            />
          ))}
        </div>
        {error && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest animate-fade-in">PIN Incorrecto</p>}
      </div>

      {/* Keypad */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-5 mb-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            type="button"
            onClick={() => handleKeyPress(num.toString())}
            className="w-full aspect-square rounded-[2rem] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-2xl font-black hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all border border-slate-100 dark:border-slate-800 shadow-sm"
          >
            {num}
          </button>
        ))}
        <div className="flex items-center justify-center">
           <Lock size={22} className="text-slate-200 dark:text-slate-800" />
        </div>
        <button
          type="button"
          onClick={() => handleKeyPress('0')}
          className="w-full aspect-square rounded-[2rem] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-2xl font-black hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="w-full aspect-square rounded-[2rem] flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all active:scale-90"
        >
          <Delete size={28} />
        </button>
      </div>

      {/* Footer Personalizado */}
      <div className="text-center pb-6">
        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] opacity-80">
          App creada por Juan Ramon Esteban
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 3; }
      `}</style>
    </div>
  );
};

export default Gatekeeper;
