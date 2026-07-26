import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
import { ThemeApplier } from './ThemeApplier';

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeApplier />
        {children}
      </AuthProvider>
    </QueryProvider>
  );
}
