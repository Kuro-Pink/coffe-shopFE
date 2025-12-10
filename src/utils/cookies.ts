export const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === 'undefined') return;
  
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const value = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1];
  
  return value || null;
};

export const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=; path=/; max-age=0`;
};