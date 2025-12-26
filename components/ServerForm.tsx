
import React, { useState, useEffect, useRef } from 'react';
import { Server, Group, ServerStatus } from '../types';
import { Save, ChevronLeft, Calendar, User, Camera, Loader2, Heart, MapPin, Phone, Mail } from 'lucide-react';
import { toTitleCase } from '../utils/formatters';
import { compressImage } from '../utils/imageHelpers';
import { uploadImageToStorage } from '../services/storageService';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface ServerFormProps {
  initialData?: Server | null;
  groups: Group[];
  onSave: (data: Omit<Server, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ServerForm: React.FC<ServerFormProps> = ({ initialData, groups, onSave, onCancel, isSubmitting }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Server, 'id' | 'createdAt' | 'fullName'>>({
    firstName: '',
    lastName: '',
    cedula: '',
    email: '',
    licencia_conducir: false,
    photo: '',
    birthDate: '',
    mobile: '',
    joinDate: new Date().toISOString().split('T')[0],
    size: '',
    bloodType: '',
    address: '',
    emergencyContactName: '',
    emergency_contact_relationship: '',
    emergencyContactPhone: '',
    group: '',
    note: '',
    status: ServerStatus.ACTIVO
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        photo: initialData.photo || '',
        cedula: initialData.cedula || '',
        email: initialData.email || '',
        licencia_conducir: !!initialData.licencia_conducir,
        birthDate: initialData.birthDate || '',
        mobile: initialData.mobile || (initialData as any).phone || '',
        joinDate: initialData.joinDate || '',
        size: initialData.size || '',
        bloodType: initialData.bloodType || '',
        address: initialData.address || '',
        emergencyContactName: initialData.emergencyContactName || '',
        emergency_contact_relationship: initialData.emergency_contact_relationship || '',
        emergencyContactPhone: initialData.emergencyContactPhone || '',
        group: initialData.group || '',
        note: initialData.note || '',
        status: initialData.status
      });
    } else if (groups.length > 0) {
      setFormData(prev => ({ ...prev, group: groups[0].name }));
    }
  }, [initialData, groups]);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    let finalValue = value;
    const titleCaseFields = ['firstName', 'lastName', 'address', 'emergencyContactName', 'emergency_contact_relationship', 'note'];
    
    if (titleCaseFields.includes(field as string) && typeof value === 'string') {
      finalValue = toTitleCase(value);
    }

    setFormData(prev => ({ ...prev, [field]: finalValue }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploadingImage(true);
        const compressedBase64 = await compressImage(file, 400, 0.8);
        if (isSupabaseConfigured()) {
            const res = await fetch(compressedBase64);
            const blob = await res.blob();
            const publicUrl = await uploadImageToStorage(blob);
            setFormData(prev => ({ ...prev, photo: publicUrl || compressedBase64 }));
        } else {
            setFormData(prev => ({ ...prev, photo: compressedBase64 }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const SectionTitle = ({ title, icon: Icon, colorClass = "text-blue-600" }: any) => (
    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">
      <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 ${colorClass}`}>
        <Icon size={16} />
      </div>
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
        {title}
      </h3>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 h-full flex flex-col animate-fade-in transition-colors duration-300">
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-20">
        <button onClick={onCancel} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {initialData ? 'Editar Servidor' : 'Nuevo Servidor'}
        </h2>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-8 flex-1 overflow-y-auto no-scrollbar pb-32">
        
        {/* Foto de Perfil */}
        <div className="flex flex-col items-center mb-4">
          <div 
            className="relative w-32 h-32 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-blue-500 group shadow-inner"
            onClick={() => !isUploadingImage && fileInputRef.current?.click()}
          >
            {isUploadingImage && (
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center z-10">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            )}
            {formData.photo ? (
              <img src={formData.photo} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center group-hover:scale-110 transition-transform">
                <Camera size={32} className="text-slate-300 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Subir Foto</span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </div>
        </div>

        {/* Sección: Información Básica */}
        <div className="space-y-6">
            <SectionTitle title="Datos Personales" icon={User} />
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Nombre</label>
                    <input
                        type="text" required
                        value={formData.firstName}
                        onChange={e => handleInputChange('firstName', e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 dark:text-white transition-all shadow-sm"
                        placeholder="Juan"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Apellido</label>
                    <input
                        type="text" required
                        value={formData.lastName}
                        onChange={e => handleInputChange('lastName', e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 dark:text-white transition-all shadow-sm"
                        placeholder="Pérez"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Cédula</label>
                    <input
                        type="text"
                        value={formData.cedula}
                        onChange={e => handleInputChange('cedula', e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 dark:text-white shadow-sm"
                        placeholder="000-0000000-0"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">WhatsApp / Celular</label>
                    <input
                        type="tel" required
                        value={formData.mobile}
                        onChange={e => handleInputChange('mobile', e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 dark:text-white shadow-sm font-bold"
                        placeholder="809-000-0000"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Fecha de Nacimiento</label>
                <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={e => handleInputChange('birthDate', e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 dark:text-white shadow-sm"
                />
            </div>
        </div>

        {/* Emergencia */}
        <div className="bg-rose-50/50 dark:bg-rose-950/20 p-6 rounded-3xl border border-rose-100 dark:border-rose-900/30">
            <SectionTitle title="En caso de Emergencia" icon={Heart} colorClass="text-rose-500" />
            
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-rose-600 uppercase ml-1 tracking-wider">Nombre Contacto</label>
                    <input
                        type="text"
                        value={formData.emergencyContactName}
                        onChange={e => handleInputChange('emergencyContactName', e.target.value)}
                        className="w-full p-4 bg-white dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-rose-400 dark:text-white shadow-sm"
                        placeholder="Nombre completo"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-rose-600 uppercase ml-1 tracking-wider">Teléfono Emergencia</label>
                    <input
                        type="tel"
                        value={formData.emergencyContactPhone}
                        onChange={e => handleInputChange('emergencyContactPhone', e.target.value)}
                        className="w-full p-4 bg-white dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-rose-400 dark:text-white shadow-sm"
                        placeholder="829-000-0000"
                    />
                </div>
            </div>
        </div>

        {/* Ministerio */}
        <div className="space-y-6">
            <SectionTitle title="Datos del Ministerio" icon={MapPin} />
            
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Grupo Asignado</label>
                <select
                    value={formData.group}
                    onChange={e => handleInputChange('group', e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 dark:text-white shadow-sm"
                >
                    {groups.map(group => (
                        <option key={group.id} value={group.name}>{group.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Estatus</label>
                    <select
                        value={formData.status}
                        onChange={e => handleInputChange('status', e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 dark:text-white shadow-sm"
                    >
                        {Object.values(ServerStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Talla Uniforme</label>
                    <select
                        value={formData.size}
                        onChange={e => handleInputChange('size', e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 dark:text-white shadow-sm"
                    >
                        <option value="">No aplica</option>
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                    </select>
                </div>
            </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-30 max-w-lg mx-auto border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-black text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={22} />}
              <span>{initialData ? 'Actualizar' : 'Guardar Servidor'}</span>
            </button>
        </div>
      </form>
    </div>
  );
};

export default ServerForm;
