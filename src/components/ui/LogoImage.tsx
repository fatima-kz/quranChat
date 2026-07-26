import { Image, type ImageProps } from 'react-native';
import { useThemeStore } from '@/store/theme.store';

type Props = {
  size?: number;
} & Omit<ImageProps, 'source' | 'style'>;

export function LogoImage({ size = 120, ...props }: Props) {
  const isDark = useThemeStore((s) => s.resolved) === 'dark';
  
  return (
    <Image
      source={isDark 
        ? require('../../../assets/images/screen_darkmode.png') 
        : require('../../../assets/images/screen.png')
      }
      style={{ width: size, height: size, resizeMode: 'contain' }}
      {...props}
    />
  );
}
