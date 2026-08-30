import { useId } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Ellipse,
  Path,
  G,
  Circle,
  Polygon,
} from 'react-native-svg';

export function LogoMark({ size = 40 }) {
  // Each instance needs its own gradient id — reusing "seatflickGrad" breaks
  // rendering when more than one <Logo> is mounted at once (e.g. a screen
  // left mounted behind the current one in the navigation stack).
  const gradId = `seatflickGrad-${useId()}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Defs>
        <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#ffb64d" />
          <Stop offset="100%" stopColor="#ff9800" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="100" cy="70" rx="50" ry="30" fill={`url(#${gradId})`} opacity={0.9} />
      <Path d="M 60 100 Q 60 130 100 135 Q 140 130 140 100 Z" fill={`url(#${gradId})`} />
      <G opacity={0.85}>
        <Circle cx="100" cy="95" r="35" fill="none" stroke="#0f0f1e" strokeWidth={2} />
        <Polygon points="85,80 85,110 120,95" fill="#0f0f1e" />
      </G>
    </Svg>
  );
}

// The full lockup: icon + "Seatflick" wordmark.
export function Logo({ size = 40 }) {
  return (
    <View style={styles.row}>
      <LogoMark size={size} />
      <Text style={[styles.word, { fontSize: size * 0.62 }]}>
        <Text style={styles.seat}>Seat</Text>
        <Text style={styles.flick}>flick</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  word: { marginLeft: 8, fontWeight: '300' },
  seat: { color: '#ffb64d', fontWeight: '600' },
  flick: { color: '#fff', fontWeight: '300' },
});