export function greetingPrefix(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function salaamGreeting(name?: string): string {
  const base = 'Assalamu Alaikum';
  return name ? `${base}, ${name}` : base;
}
