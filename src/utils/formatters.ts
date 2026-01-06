
// Convierte cualquier fecha a dd/mm/aaaa (OBLIGATORIO)
export const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return '-';
  
  // Si ya tiene el formato dd/mm/aaaa, lo devolvemos tal cual
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString;
  
  // Si viene en formato aaaa-mm-dd
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  
  return dateString;
};

// Convierte tiempo 24h (HH:mm) a 12h (h:mm AM/PM)
export const formatTime12h = (time24: string): string => {
  if (!time24) return '-';
  try {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (e) {
    return time24;
  }
};

/**
 * Convierte texto a Title Case.
 */
export const toTitleCase = (str: string): string => {
  if (!str) return '';
  
  return str
    .split(' ')
    .map(word => {
      if (word.length === 0) return ''; 
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

export const normalizeString = (str: string): string => {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export const calculateAge = (dateString: string): string => {
  if (!dateString) return '';
  const today = new Date();
  
  let dateToCalc = dateString;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    const [d, m, y] = dateString.split('/');
    dateToCalc = `${y}-${m}-${d}`;
  }
  
  const parts = dateToCalc.split('-');
  if (parts.length !== 3) return '';
  const [year, month, day] = parts.map(Number);
  let age = today.getFullYear() - year;
  const m = today.getMonth() + 1 - month;
  if (m < 0 || (m === 0 && today.getDate() < day)) age--;
  return age.toString();
};

export const calculateTimeUntilBirthday = (dateString: string): string => {
  if (!dateString) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let dateToCalc = dateString;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    const [d, m, y] = dateString.split('/');
    dateToCalc = `${y}-${m}-${d}`;
  }
  
  const parts = dateToCalc.split('-');
  if (parts.length !== 3) return '';
  const [y, m, d] = parts.map(Number);
  const birthDate = new Date(y, m - 1, d);
  let nextBday = new Date(today.getFullYear(), m - 1, d);
  if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1);
  const ageToTurn = nextBday.getFullYear() - birthDate.getFullYear();
  if (nextBday.getTime() === today.getTime()) return `¡Hoy cumple ${ageToTurn}! 🎉`;
  let diffTime = nextBday.getTime() - today.getTime();
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return `Mañana (${ageToTurn})`;
  let months = nextBday.getMonth() - today.getMonth();
  if (months < 0) months += 12;
  if (months > 0) return `En ${months} mes${months > 1 ? 'es' : ''}`;
  return `En ${diffDays} días`;
};

/**
 * Verifica si una fecha es anterior a hoy (ignora la hora).
 */
export const isPastDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const serviceDate = new Date(dateString + 'T00:00:00');
  return serviceDate < today;
};
