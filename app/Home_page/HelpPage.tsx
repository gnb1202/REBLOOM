import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
  Platform,
  ScrollView,
} from 'react-native';

import HomeScreenshot from '../../assets/images/HomeBackgroundImages/BasicHomepage.png';
import flowerbed from '../../assets/images/flowerbed/flowerbed.png';
import mailbox_A_black from '../../assets/images/furnitures/mailbox/mailbox_A_black.png';

/* ====== 🔧 Door hover zones (percent-based) ====== */
type PercentRect = { left: string; top: string; width: string; height: string };
const LEFT_DOOR_RECT: PercentRect = {
  left: '16%',
  top: '25%',
  width: '11.7%',
  height: '63%',
};
const RIGHT_DOOR_RECT: PercentRect = {
  left: '72.5%',
  top: '25%',
  width: '11.7%',
  height: '63%',
};
/* ============================================ */

const GlowHotspot = ({
  style,
  label,
  desc,
  glowColor = '#FFD700',
  borderRadius = 16,
  absolute = true,
  containerStyle,
}: {
  style?: StyleProp<ViewStyle>;
  label: string;
  desc?: string;
  glowColor?: string;
  borderRadius?: number;
  absolute?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}) => {
  const [hovered, setHovered] = useState(false);
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hovered) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
          Animated.timing(glow, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      glow.stopAnimation(() => glow.setValue(0));
    }
  }, [hovered, glow]);

  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,215,0,0.35)', 'rgba(255,255,255,0.95)'],
  });
  const shadowRadius = glow.interpolate({ inputRange: [0, 1], outputRange: [2, 14] });
  const shadowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.9] });

  return (
    <View style={[absolute ? styles.hotspotWrap : null, style]}>
      <View style={styles.hotspotRoot}>
        <Pressable
          onHoverIn={() => setHovered(true)}
          onHoverOut={() => setHovered(false)}
          style={[styles.hotspotBtn, containerStyle]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                borderRadius,
                borderWidth: 4,
                borderColor,
                shadowColor: glowColor,
                shadowOpacity,
                shadowRadius,
                shadowOffset: { width: 0, height: 0 },
              },
            ]}
          />
          <Text style={styles.hotspotLabel}>{label}</Text>
        </Pressable>

        {hovered && !!desc && (
          <View style={[styles.tooltipTop, absolute ? null : styles.tooltipInlineTop]}>
            {!absolute && <View style={[styles.tooltipArrowTop, styles.tooltipArrowInline]} />}
            {absolute && <View style={styles.tooltipArrowTop} />}
            <Text style={styles.tooltipText}>{desc}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

/** Generic hoverable image */
const HoverableImage = ({
  source,
  style,
  tooltip,
  glowColor = '#FFD700',
  hoverArea = 1,
  borderRadius = 8,
  tooltipPosition = {},
}: {
  source: any;
  style: StyleProp<ViewStyle>;
  tooltip?: string;
  glowColor?: string;
  hoverArea?: number;
  borderRadius?: number;
  tooltipPosition?: StyleProp<ViewStyle>;
}) => {
  const [hovered, setHovered] = useState(false);
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hovered) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
          Animated.timing(glow, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      glow.stopAnimation(() => glow.setValue(0));
    }
  }, [hovered, glow]);

  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,215,0,0.35)', 'rgba(255,255,255,0.95)'],
  });
  const shadowRadius = glow.interpolate({ inputRange: [0, 1], outputRange: [2, 14] });
  const shadowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.9] });

  const offset = ((1 - hoverArea) / 2) * 100;

  return (
    <View style={[{ position: 'absolute' }, style]}>
      <Image source={source} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
      <Pressable
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={{
          position: 'absolute',
          width: `${hoverArea * 100}%`,
          height: `${hoverArea * 100}%`,
          left: `${offset}%`,
          top: `${offset}%`,
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius,
              borderWidth: 4,
              borderColor,
              shadowColor: glowColor,
              shadowOpacity,
              shadowRadius,
              shadowOffset: { width: 0, height: 0 },
            },
          ]}
        />
      </Pressable>

      {hovered && !!tooltip && (
        <View style={[styles.tooltipTop, tooltipPosition]}>
          <View style={[styles.tooltipArrowTop, { left: 16 }]} />
          <Text style={styles.tooltipText}>{tooltip}</Text>
        </View>
      )}
    </View>
  );
};

/** Rectangular hover zone */
const RectHoverZone = ({
  style,
  desc,
  glowColor = '#FF4D6D',
  radius = 10,
}: {
  style: StyleProp<ViewStyle>;
  desc: string;
  glowColor?: string;
  radius?: number;
}) => {
  const [hovered, setHovered] = useState(false);
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!hovered) { glow.stopAnimation(() => glow.setValue(0)); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ])
    );
    loop.start(); return () => loop.stop();
  }, [hovered, glow]);

  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,77,109,0.35)', 'rgba(255,255,255,0.95)'],
  });
  const shadowRadius = glow.interpolate({ inputRange: [0, 1], outputRange: [2, 14] });
  const shadowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.9] });

  return (
    <View style={[{ position: 'absolute' }, style]}>
      <Pressable
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={{ width: '100%', height: '100%' }}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: radius,
              borderWidth: 4,
              borderColor,
              shadowColor: glowColor,
              shadowOpacity,
              shadowRadius,
              shadowOffset: { width: 0, height: 0 },
            },
          ]}
        />
      </Pressable>

      {hovered && !!desc && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '105%',
            backgroundColor: '#111827',
            paddingVertical: 8,
            paddingHorizontal: 10,
            borderRadius: 10,
            zIndex: 100,
          }}
        >
          <View
            style={{
              position: 'absolute',
              bottom: -6,
              left: 20,
              width: 10,
              height: 10,
              backgroundColor: '#111827',
              transform: [{ rotate: '45deg' }],
              borderRadius: 2,
            }}
          />
          <Text style={{ color: '#fff', fontSize: 12, lineHeight: 16 }}>{desc}</Text>
        </View>
      )}
    </View>
  );
};

const getFlowerbedRect = (W: number, H: number) => {
  const width = W * 0.42;
  const height = H * 0.45;
  const left = W * 0.43;
  const top = H * 1.06 - height;
  return { left, top, width, height };
};

export default function HelpPage() {
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  return (
    <View style={styles.container}>
      <View style={styles.topLeftRow}>
        <GlowHotspot
          absolute={false}
          label="?"
          desc="Help"
          glowColor="#00BFFF"
          containerStyle={{ width: 40, height: 40, borderRadius: 22, backgroundColor: '#FFFFFF' }}
          style={{ marginLeft: 12, marginTop: 6 }}
        />
        <GlowHotspot
          absolute={false}
          label="Health Check"
          desc="Record your health status"
          glowColor="#00BFFF"
          containerStyle={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#FFFFFF' }}
          style={{ marginLeft: 12, marginTop: 6 }}
        />
      </View>

      <View style={styles.topRightRow}>
        <GlowHotspot
          absolute={false}
          label="Room Modify"
          desc="Edit your room"
          glowColor="#F59E0B"
          containerStyle={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#FFFFFF' }}
        />
        <GlowHotspot
          absolute={false}
          label="Shop"
          desc="Go to the shop"
          glowColor="#FF4D6D"
          containerStyle={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#FFFFFF' }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody}>
        {Platform.OS !== 'web' && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>ℹ️ Hover effects are only visible on the web. No change on mobile.</Text>
          </View>
        )}

        <View
          style={styles.canvas}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setCanvasSize({ w: width, h: height });
          }}
        >
          <Image source={HomeScreenshot} resizeMode="contain" style={styles.screenshot} />

          {/* Left Door */}
          <RectHoverZone
            desc="Left Door: Entrance to Explore"
            glowColor="#FF4D6D"
            radius={12}
            style={{ ...LEFT_DOOR_RECT, position: 'absolute', zIndex: 8 } as any}
          />

          {/* Right Door */}
          <RectHoverZone
            desc="Right Door: Go to Work out"
            glowColor="#FF9F1C"
            radius={12}
            style={{ ...RIGHT_DOOR_RECT, position: 'absolute', zIndex: 8 } as any}
          />

          {/* Flowerbed */}
          {canvasSize.w > 0 && canvasSize.h > 0 && (() => {
            const rect = getFlowerbedRect(canvasSize.w, canvasSize.h);
            return (
              <HoverableImage
                source={flowerbed}
                tooltip="Flowerbed: Check grow flowers."
                glowColor="#A3E635"
                hoverArea={0.4}
                tooltipPosition={{ bottom: '76%', left: 250, maxWidth: 200 }}
                style={{
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                  zIndex: 6,
                }}
              />
            );
          })()}

          {/* Mailbox */}
          {canvasSize.w > 0 && canvasSize.h > 0 && (
            <HoverableImage
              source={mailbox_A_black}
              tooltip="Mailbox: Check for Quest and Health Report"
              glowColor="#00E0FF"
              hoverArea={0.7}
              tooltipPosition={{ bottom: '85%', left: 20, maxWidth: 250 }}
              style={{
                left: canvasSize.w * 0.37,
                top: canvasSize.h * 0.60,
                width: 150,
                height: 300,
                zIndex: 7,
              }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FB' },

  topLeftRow: {
    position: 'absolute',
    top: 50,
    left: '16%',
    zIndex: 20,
    flexDirection: 'row',
    gap: 10,
  },
  topRightRow: {
    position: 'absolute',
    top: 50,
    right: '17.5%',
    zIndex: 20,
    flexDirection: 'row',
    gap: 10,
  },

  scrollBody: { padding: 16, paddingBottom: 32 },

  notice: {
    padding: 12,
    backgroundColor: '#FFF6D9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0E1A0',
    marginBottom: 12,
    marginTop: 100,
  },
  noticeText: { color: '#7A6B00', fontSize: 13 },

  canvas: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1690 / 768,
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  screenshot: { width: '100%', height: '100%' },

  hotspotWrap: { position: 'absolute' },
  hotspotRoot: { position: 'relative', alignSelf: 'flex-start' },
  hotspotBtn: { backgroundColor: '#FFFFFF', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  hotspotLabel: { fontWeight: 'normal' },

  tooltipTop: {
    position: 'absolute',
    left: '0%',
    right: '0%',
    bottom: '105%',
    backgroundColor: '#111827',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  tooltipInlineTop: { bottom: '110%', maxWidth: 220 },
  tooltipText: { color: '#fff', fontSize: 12, lineHeight: 16 },

  tooltipArrowTop: {
    position: 'absolute',
    bottom: -6,
    left: 20,
    width: 10,
    height: 10,
    backgroundColor: '#111827',
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
  },
  tooltipArrowInline: { left: 16 },
});
