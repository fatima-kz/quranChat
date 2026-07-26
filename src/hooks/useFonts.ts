import {
  useFonts as useExpoFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  SourceSerif4_400Regular,
  SourceSerif4_400Regular_Italic,
  SourceSerif4_600SemiBold,
  SourceSerif4_600SemiBold_Italic,
  SourceSerif4_700Bold,
} from '@expo-google-fonts/source-serif-4';

export function useFonts(): boolean {
  const [loaded] = useExpoFonts({
    PlusJakartaSansRegular: PlusJakartaSans_400Regular,
    PlusJakartaSansMedium: PlusJakartaSans_500Medium,
    PlusJakartaSansSemiBold: PlusJakartaSans_600SemiBold,
    PlusJakartaSansBold: PlusJakartaSans_700Bold,
    SourceSerif4Regular: SourceSerif4_400Regular,
    SourceSerif4Italic: SourceSerif4_400Regular_Italic,
    SourceSerif4SemiBold: SourceSerif4_600SemiBold,
    SourceSerif4SemiBoldItalic: SourceSerif4_600SemiBold_Italic,
    SourceSerif4Bold: SourceSerif4_700Bold,
  });

  return loaded;
}
