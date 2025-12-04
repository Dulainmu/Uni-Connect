/**
 * Convert 12-hour time format (e.g., "09:30 AM") to minutes from midnight.
 * @param {string} time12h - Time in "HH:MM AM/PM" format
 * @returns {number} Minutes from midnight
 */
const convertToMinutes = (time12h) => {
  if (!time12h) return 0;
  
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);
  
  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  } else if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
};

/**
 * Convert minutes from midnight to 12-hour time format.
 * @param {number} minutes - Minutes from midnight
 * @returns {string} Time in "HH:MM AM/PM" format
 */
const convertTo12Hour = (minutes) => {
  let h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const mod = h >= 12 ? 'PM' : 'AM';
  
  if (h === 0) h = 12;
  else if (h > 12) h = h - 12;
  
  const mm = m.toString().padStart(2, '0');
  return `${h}:${mm} ${mod}`;
};

module.exports = {
  convertToMinutes,
  convertTo12Hour
};
