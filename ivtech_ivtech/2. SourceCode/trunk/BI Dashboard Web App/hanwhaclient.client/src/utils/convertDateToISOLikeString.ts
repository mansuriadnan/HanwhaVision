export const convertDateToISOLikeString = (dateInput: Date): string=> {
  let date = dateInput;
  if (!(dateInput instanceof Date) || isNaN(dateInput.getTime())) {
     date = new Date(dateInput); // or return '' if you prefer empty string
  }
  const pad = (num: number): string => (num < 10 ? '0' + num : num.toString());

  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}.000Z`;
};
