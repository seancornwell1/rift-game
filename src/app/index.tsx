import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#3dff8f';
const DIM_GREEN = 'rgba(61, 255, 143, 0.25)';
const BACKGROUND = '#04110b';
const SWEEP_TRAIL = [0, -6, -12, -18, -24, -30];

/** Placeholder home screen: the device's radar picking up a signal. */
export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const size = Math.min(width - 48, 340);
  const radius = size / 2;

  const [sweep] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const sweepLoop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    sweepLoop.start();
    pulseLoop.start();
    return () => {
      sweepLoop.stop();
      pulseLoop.stop();
    };
  }, [sweep, pulse]);

  const rotate = sweep.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const blipScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] });
  const blipRingOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] });
  const labelOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] });

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.header}>DIMENSIONAL RADAR · ONLINE</Text>

      <View style={[styles.radar, { width: size, height: size, borderRadius: radius }]}>
        {[0.25, 0.5, 0.75].map((scale) => (
          <View
            key={scale}
            style={[
              styles.ring,
              {
                width: size * scale,
                height: size * scale,
                borderRadius: (size * scale) / 2,
              },
            ]}
          />
        ))}
        <View style={[styles.crosshair, { width: size, height: 1 }]} />
        <View style={[styles.crosshair, { width: 1, height: size }]} />

        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
          {SWEEP_TRAIL.map((angle, index) => (
            <View
              key={angle}
              style={[
                StyleSheet.absoluteFill,
                { transform: [{ rotate: `${angle}deg` }], opacity: 1 - index / SWEEP_TRAIL.length },
              ]}>
              <View
                style={[
                  styles.sweepLine,
                  { left: radius, top: radius - 1, width: radius, height: index === 0 ? 2 : 3 },
                ]}
              />
            </View>
          ))}
        </Animated.View>

        <View style={[styles.blipAnchor, { left: radius * 1.45, top: radius * 0.55 }]}>
          <Animated.View
            style={[styles.blipRing, { opacity: blipRingOpacity, transform: [{ scale: blipScale }] }]}
          />
          <View style={styles.blip} />
        </View>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Rift Game</Text>
        <Animated.Text style={[styles.status, { opacity: labelOpacity }]}>
          SIGNAL DETECTED…
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 24,
  },
  header: {
    color: GREEN,
    opacity: 0.7,
    fontSize: 12,
    letterSpacing: 3,
    fontFamily: 'Menlo',
  },
  radar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: GREEN,
    backgroundColor: '#062417',
    shadowColor: GREEN,
    shadowOpacity: 0.6,
    shadowRadius: 24,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: DIM_GREEN,
  },
  crosshair: {
    position: 'absolute',
    backgroundColor: DIM_GREEN,
  },
  sweepLine: {
    position: 'absolute',
    backgroundColor: GREEN,
    shadowColor: GREEN,
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  blipAnchor: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blip: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff5ec8',
    shadowColor: '#ff5ec8',
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  blipRing: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ff5ec8',
  },
  titleBlock: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: GREEN,
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: 2,
    textShadowColor: GREEN,
    textShadowRadius: 12,
  },
  status: {
    color: GREEN,
    fontSize: 14,
    letterSpacing: 4,
    fontFamily: 'Menlo',
  },
});
