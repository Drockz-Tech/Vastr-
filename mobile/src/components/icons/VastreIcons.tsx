import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import type { ColorValue } from 'react-native';

export type VastreIconName = 'home' | 'closet' | 'lookbook' | 'trips' | 'insights';

export type VastreIconProps = {
  name: VastreIconName;
  size?: number;
  color: ColorValue;
  focused?: boolean;
};

/** Original Vastré navigation artwork. All marks share a quiet 48 × 48 line style. */
export function VastreIcon({ name, size = 26, color, focused = false }: VastreIconProps) {
  const strokeWidth = focused ? 1.9 : 1.75;
  const common = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" accessibilityLabel={`${name} icon`}>
      {name === 'home' ? <>
        {/* A single curved hook, with a wide tailored hanger and shoulder seam. */}
        <Path d="M24 9.5c-3.2 0-5.1 2.1-5.1 4.8 0 2.3 1.5 3.6 3.8 4.1 1.4.3 2.2 1.2 2.2 2.5" {...common} />
        <Path d="M24.9 20.8 41 31.7c1 .7.5 2.3-.7 2.3H7.7c-1.2 0-1.7-1.6-.7-2.3l16.1-10.9c.5-.4 1.3-.4 1.8 0Z" {...common} />
        <Path d="m15.2 29.8 8.8 4.2 8.8-4.2" {...common} opacity={focused ? 0.8 : 0.65} />
      </> : null}

      {name === 'closet' ? <>
        <Rect x="9" y="9" width="30" height="31" rx="2.2" {...common} />
        <Line x1="24" y1="10" x2="24" y2="39" {...common} />
        <Line x1="20.3" y1="22" x2="20.3" y2="26" {...common} />
        <Line x1="27.7" y1="22" x2="27.7" y2="26" {...common} />
        <Path d="M15 9V6.8h18V9M13 40v2m22-2v2" {...common} />
      </> : null}

      {name === 'lookbook' ? <>
        <Rect x="10" y="8" width="25" height="30" rx="2" {...common} opacity={focused ? 0.72 : 0.68} />
        <Rect x="16" y="12" width="23" height="29" rx="2" {...common} />
        <Circle cx="23" cy="20" r="1.7" {...common} />
        <Path d="m18.5 36 6.1-7.4 3.6 4 3.5-4.1 5.2 7.5H18.5Z" {...common} />
      </> : null}

      {name === 'trips' ? <>
        <Rect x="10" y="16" width="28" height="24" rx="3" {...common} />
        <Path d="M18 16v-4.2c0-1.5 1.2-2.8 2.8-2.8h6.4c1.6 0 2.8 1.3 2.8 2.8V16M10 23h28M16 23v17m16-17v17" {...common} />
        <Path d="m20 31 4-3 4 3-4 3-4-3Z" {...common} />
      </> : null}

      {name === 'insights' ? <>
        <Path d="M9 38.5h30" {...common} />
        <Path d="M14 36V27h5v9m5 0V21h5v15m5 0V15h5v21" {...common} />
        <Path d="M12 20.5c5-6.4 11.4-8.5 19.2-6.1 2.4.7 4.4.6 6.8-.5" {...common} />
        <Circle cx="12" cy="20.5" r="1.4" fill={color} stroke="none" />
      </> : null}
    </Svg>
  );
}
