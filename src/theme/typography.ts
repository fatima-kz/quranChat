export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontFamily: 'SourceSerif4Bold' },
  h1: { fontSize: 28, lineHeight: 34, fontFamily: 'SourceSerif4Bold' },
  h2: { fontSize: 22, lineHeight: 28, fontFamily: 'SourceSerif4SemiBold' },
  h3: { fontSize: 18, lineHeight: 24, fontFamily: 'PlusJakartaSansSemiBold' },
  body: { fontSize: 16, lineHeight: 24, fontFamily: 'PlusJakartaSansRegular' },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontFamily: 'PlusJakartaSansMedium' },
  small: { fontSize: 14, lineHeight: 20, fontFamily: 'PlusJakartaSansRegular' },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: 'PlusJakartaSansMedium' },
  ayah: { fontSize: 20, lineHeight: 32, fontFamily: 'SourceSerif4Regular' },
} as const;

export type TypographyKey = keyof typeof typography;

export function serifFamily(variant: TypographyKey): string {
  switch (variant) {
    case 'display':
    case 'h1':
    case 'h2':
      return 'SourceSerif4Bold';
    case 'ayah':
      return 'SourceSerif4Regular';
    default:
      return 'SourceSerif4SemiBold';
  }
}
