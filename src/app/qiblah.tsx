import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated, Easing, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';

import { CText } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/theme.store';
import { useHaptics } from '@/hooks/useHaptics';
import { calculateQiblahBearing, calculateDistanceToMecca } from '@/utils/qiblah';

export default function QiblahScreen() {
  const c = useThemeColors();
  const isDark = useThemeStore((s) => s.resolved) === 'dark';
  const haptic = useHaptics();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [distance, setDistance] = useState<number | null>(null);
  const [qiblahBearing, setQiblahBearing] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  
  const [isAligned, setIsAligned] = useState(false);

  // Animated value for smooth rotation
  const spinAnim = useRef(new Animated.Value(0)).current;
  const lastHeading = useRef(0);

  useEffect(() => {
    let headingSub: Location.LocationSubscription | null = null;

    const setupCompass = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission is required to calculate Qiblah.');
          setLoading(false);
          return;
        }

        // Get initial location for distance and Qiblah math
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = loc.coords;
        
        const qBearing = calculateQiblahBearing(latitude, longitude);
        const dist = calculateDistanceToMecca(latitude, longitude);
        
        setQiblahBearing(qBearing);
        setDistance(dist);

        // Start watching device heading (compass)
        headingSub = await Location.watchHeadingAsync((headingData) => {
          // Use trueHeading if available, otherwise magHeading
          const currentHeading = headingData.trueHeading >= 0 ? headingData.trueHeading : headingData.magHeading;
          
          // Shortest path interpolation to avoid 360 -> 0 spinning wildly
          let diff = currentHeading - lastHeading.current;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          
          const newTarget = lastHeading.current + diff;
          
          Animated.timing(spinAnim, {
            toValue: newTarget,
            duration: 150,
            easing: Easing.linear,
            useNativeDriver: true,
          }).start();

          lastHeading.current = newTarget;
          setHeading(currentHeading);
        });

        setLoading(false);
      } catch (err) {
        console.warn(err);
        setErrorMsg('Unable to retrieve location or compass data on this device.');
        setLoading(false);
      }
    };

    setupCompass();

    return () => {
      if (headingSub) {
        headingSub.remove();
      }
    };
  }, [spinAnim]);

  // Check alignment
  useEffect(() => {
    if (qiblahBearing !== null) {
      // Allow a 2-degree margin of error for alignment
      let diff = Math.abs(heading - qiblahBearing);
      if (diff > 180) diff = 360 - diff;
      
      const aligned = diff <= 2.5;
      
      if (aligned && !isAligned) {
        // Just got aligned
        setIsAligned(true);
        haptic('success');
      } else if (!aligned && isAligned) {
        // Lost alignment
        setIsAligned(false);
      }
    }
  }, [heading, qiblahBearing, isAligned, haptic]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => { haptic('light'); router.back(); }} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color={c.text} />
          </Pressable>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.primary} />
          <CText style={{ color: c.textMuted, marginTop: 16 }}>Calibrating compass...</CText>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => { haptic('light'); router.back(); }} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color={c.text} />
          </Pressable>
        </View>
        <View style={styles.center}>
          <Ionicons name="location-outline" size={48} color={c.textMuted} style={{ marginBottom: 16 }} />
          <CText style={{ color: c.text, textAlign: 'center', marginHorizontal: 32 }}>{errorMsg}</CText>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate the rotation of the needle so it always points to Qiblah.
  // If the device is pointing at `heading` and the Qiblah is at `qiblahBearing`,
  // the needle must rotate by `qiblahBearing - heading` relative to the screen.
  // Because we rotate the whole compass ring by `-heading`, we can just draw the Qiblah
  // marker at `qiblahBearing` ON the ring!

  const ringRotation = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '-360deg'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSide}>
          <Pressable onPress={() => { haptic('light'); router.back(); }} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color={c.text} />
          </Pressable>
        </View>
        <CText variant="h3" style={{ color: c.text, flex: 1, textAlign: 'center' }}>
          Qiblah
        </CText>
        <View style={styles.headerSide} />
      </View>

      <View style={styles.compassWrap}>
        <View style={styles.infoTop}>
          <CText serif style={{ color: isAligned ? c.primary : c.text, fontSize: 44, lineHeight: 52, paddingVertical: 12, marginBottom: 8, paddingHorizontal: 16 }}>
            {Math.round(heading)}°
          </CText>
          <CText variant="caption" muted style={{ textTransform: 'uppercase', letterSpacing: 2 }}>
            {isAligned ? 'Aligned to Kaaba' : 'Current Heading'}
          </CText>
        </View>

        <View style={styles.dialContainer}>
          {/* A stationary fixed indicator at the top of the phone */}
          <Ionicons name="caret-up" size={24} color={isAligned ? c.primary : c.text} style={styles.phoneArrow} />
          <View style={[styles.phoneIndicator, { backgroundColor: isAligned ? c.primary : 'rgba(150,150,150,0.4)' }]} />

          {/* The rotating Compass Ring */}
          <Animated.View style={[styles.ring, { transform: [{ rotate: ringRotation }], borderColor: c.border }]}>
            
            {/* North, East, South, West marks */}
            <CText style={[styles.cardinal, styles.north, { color: c.textMuted }]}>N</CText>
            <CText style={[styles.cardinal, styles.east, { color: c.textMuted }]}>E</CText>
            <CText style={[styles.cardinal, styles.south, { color: c.textMuted }]}>S</CText>
            <CText style={[styles.cardinal, styles.west, { color: c.textMuted }]}>W</CText>

            {/* Qiblah Needle/Marker positioned on the ring at exact bearing */}
            {qiblahBearing !== null && (
              <View 
                style={[
                  styles.qiblahMarkerWrap, 
                  { transform: [{ rotate: `${qiblahBearing}deg` }] }
                ]}
              >
                <View style={[styles.qiblahMarker, { backgroundColor: c.primary }]} />
                <View style={styles.qiblahTip}>
                  <Ionicons name="caret-up" size={24} color={c.primary} />
                </View>
              </View>
            )}
          </Animated.View>
        </View>

        <View style={styles.infoBottom}>
          <Ionicons name="navigate-outline" size={20} color={c.textMuted} style={{ marginBottom: 8 }} />
          <CText style={{ color: c.text, fontSize: 18, fontWeight: '600' }}>
            {distance?.toLocaleString()} km
          </CText>
          <CText variant="caption" muted style={{ marginTop: 4 }}>
            Distance to Mecca
          </CText>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSide: {
    width: 44,
  },
  backBtn: {
    padding: 4,
  },
  compassWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  infoTop: {
    alignItems: 'center',
  },
  infoBottom: {
    alignItems: 'center',
  },
  dialContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  phoneIndicator: {
    position: 'absolute',
    top: -6,
    width: 2,
    height: 16,
    borderRadius: 1,
    zIndex: -1,
  },
  phoneArrow: {
    position: 'absolute',
    top: -24,
    zIndex: 10,
  },
  cardinal: {
    position: 'absolute',
    fontWeight: '700',
    fontSize: 18,
  },
  north: { top: 12 },
  east: { right: 16 },
  south: { bottom: 12 },
  west: { left: 16 },
  
  qiblahMarkerWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
  },
  qiblahMarker: {
    width: 3,
    height: 140, // Points from center up to the ring
    borderRadius: 2,
    marginTop: 0,
    opacity: 0.15,
  },
  qiblahTip: {
    position: 'absolute',
    top: -14,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
