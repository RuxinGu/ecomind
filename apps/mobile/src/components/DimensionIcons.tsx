import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type DimensionCode = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
export type DimensionBand = 'high' | 'mid' | 'low';

const lightPalette: Record<DimensionCode, string> = {
  A: '#0072B2',
  B: '#4B9DCC',
  C: '#009E73',
  D: '#CC79A7',
  E: '#C68900',
  F: '#2D2D2D',
  G: '#D55E00',
  H: '#9F972C'
};

export function scoreToBand(score: number | null | undefined): DimensionBand {
  if (typeof score !== 'number') return 'mid';
  if (score >= 3.67) return 'high';
  if (score >= 2.34) return 'mid';
  return 'low';
}

export function bandLabel(band: DimensionBand) {
  if (band === 'high') return 'High';
  if (band === 'mid') return 'Mid';
  return 'Low';
}

function Dot({ left, top, color }: { left: number; top: number; color: string }) {
  return <View style={[styles.dot, { left, top, backgroundColor: color }]} />;
}

function Circle({
  left,
  top,
  size,
  color
}: {
  left: number;
  top: number;
  size: number;
  color: string;
}) {
  return (
    <View
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: color
      }}
    />
  );
}

function Line({
  left,
  top,
  width,
  rotate,
  color
}: {
  left: number;
  top: number;
  width: number;
  rotate?: number;
  color: string;
}) {
  return (
    <View
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height: 2,
        borderRadius: 1,
        backgroundColor: color,
        transform: rotate ? [{ rotate: `${rotate}deg` }] : undefined
      }}
    />
  );
}

function MirrorBase({ color }: { color: string }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: 4,
        top: 3,
        width: 16,
        height: 18,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: color
      }}
    />
  );
}

function DimensionShape({
  dimension,
  band,
  color
}: {
  dimension: DimensionCode;
  band: DimensionBand;
  color: string;
}) {
  if (dimension === 'A') {
    return (
      <>
        <MirrorBase color={color} />
        <Line left={12} top={6} width={2} color={color} />
        {band === 'high' ? (
          <>
            <Line left={16} top={4} width={4} color={color} />
            <Line left={18} top={2} width={4} rotate={90} color={color} />
          </>
        ) : null}
        {band === 'mid' ? <Line left={16} top={7} width={4} rotate={-35} color={color} /> : null}
        {band === 'low' ? <Line left={16} top={15} width={5} color={color} /> : null}
      </>
    );
  }

  if (dimension === 'B') {
    return (
      <>
        <Line left={3} top={18} width={10} color={color} />
        {band === 'high' ? (
          <>
            <Line left={11} top={17} width={6} rotate={-35} color={color} />
            <Line left={11} top={17} width={6} rotate={0} color={color} />
            <Line left={11} top={17} width={6} rotate={35} color={color} />
            <Dot left={16} top={12} color={color} />
            <Dot left={17} top={16} color={color} />
            <Dot left={15} top={8} color={color} />
          </>
        ) : null}
        {band === 'mid' ? (
          <>
            <Line left={11} top={17} width={6} rotate={-25} color={color} />
            <Line left={11} top={14} width={6} rotate={25} color={color} />
            <Dot left={17} top={14} color={color} />
          </>
        ) : null}
        {band === 'low' ? <Dot left={14} top={16} color={color} /> : null}
      </>
    );
  }

  if (dimension === 'C') {
    return (
      <>
        <Line left={2} top={19} width={20} color={color} />
        {band === 'high' ? (
          <>
            <Line left={3} top={14} width={6} rotate={20} color={color} />
            <Line left={8} top={16} width={6} rotate={-20} color={color} />
            <Line left={13} top={15} width={6} rotate={10} color={color} />
          </>
        ) : null}
        {band === 'mid' ? (
          <>
            <Line left={3} top={12} width={6} rotate={28} color={color} />
            <Line left={8} top={16} width={6} rotate={-28} color={color} />
            <Line left={13} top={16} width={6} rotate={0} color={color} />
          </>
        ) : null}
        {band === 'low' ? (
          <>
            <Line left={2} top={10} width={8} rotate={35} color={color} />
            <Line left={8} top={15} width={8} rotate={-35} color={color} />
            <Line left={14} top={12} width={7} rotate={30} color={color} />
            <Dot left={19} top={6} color={color} />
          </>
        ) : null}
      </>
    );
  }

  if (dimension === 'D') {
    return (
      <>
        {band === 'high' ? (
          <>
            <Circle left={4} top={7} size={10} color={color} />
            <Circle left={10} top={7} size={10} color={color} />
          </>
        ) : null}
        {band === 'mid' ? (
          <>
            <Circle left={2} top={7} size={8} color={color} />
            <Circle left={14} top={7} size={8} color={color} />
          </>
        ) : null}
        {band === 'low' ? (
          <>
            <Circle left={2} top={7} size={8} color={color} />
            <Circle left={14} top={7} size={8} color={color} />
            <Line left={10} top={11} width={4} color={color} />
          </>
        ) : null}
      </>
    );
  }

  if (dimension === 'E') {
    return (
      <>
        <Circle left={3} top={3} size={18} color={color} />
        {band === 'high' ? <Dot left={11} top={11} color={color} /> : null}
        {band === 'mid' ? (
          <>
            <Dot left={8} top={9} color={color} />
            <Dot left={13} top={13} color={color} />
          </>
        ) : null}
        {band === 'low' ? (
          <>
            <Dot left={8} top={8} color={color} />
            <Dot left={14} top={8} color={color} />
            <Dot left={11} top={14} color={color} />
          </>
        ) : null}
      </>
    );
  }

  if (dimension === 'F') {
    const block = (left: number, top: number) => (
      <View
        style={{
          position: 'absolute',
          left,
          top,
          width: 8,
          height: 4,
          borderWidth: 2,
          borderColor: color,
          borderRadius: 1
        }}
      />
    );

    return (
      <>
        {band === 'high' ? (
          <>
            {block(8, 4)}
            {block(8, 10)}
            {block(8, 16)}
          </>
        ) : null}
        {band === 'mid' ? (
          <>
            {block(6, 4)}
            {block(9, 10)}
            {block(7, 16)}
          </>
        ) : null}
        {band === 'low' ? (
          <>
            <View
              style={{
                position: 'absolute',
                left: 3,
                top: 4,
                width: 18,
                height: 16,
                borderWidth: 1,
                borderColor: color,
                borderRadius: 3,
                opacity: 0.4
              }}
            />
            {block(4, 7)}
            {block(12, 5)}
            {block(8, 14)}
          </>
        ) : null}
      </>
    );
  }

  if (dimension === 'G') {
    const bubble = (left: number) => (
      <View
        style={{
          position: 'absolute',
          left,
          top: 5,
          width: 8,
          height: 6,
          borderRadius: 3,
          borderWidth: 2,
          borderColor: color
        }}
      />
    );

    return (
      <>
        {bubble(2)}
        {bubble(14)}
        {band === 'high' ? <Line left={9} top={15} width={7} rotate={20} color={color} /> : null}
        {band === 'mid' ? <Line left={10} top={12} width={4} color={color} /> : null}
        {band === 'low' ? (
          <>
            <View style={{ position: 'absolute', left: 10, top: 12, width: 2, height: 6, backgroundColor: color }} />
            <View style={{ position: 'absolute', left: 13, top: 12, width: 2, height: 6, backgroundColor: color }} />
          </>
        ) : null}
      </>
    );
  }

  return (
    <>
      {band === 'high' ? (
        <>
          <Line left={12} top={8} width={9} rotate={90} color={color} />
          <Circle left={7} top={8} size={5} color={color} />
          <Circle left={12} top={6} size={6} color={color} />
          <Line left={6} top={18} width={12} color={color} />
        </>
      ) : null}
      {band === 'mid' ? (
        <>
          <Line left={12} top={9} width={8} rotate={90} color={color} />
          <Circle left={10} top={8} size={5} color={color} />
          <Line left={7} top={18} width={10} color={color} />
        </>
      ) : null}
      {band === 'low' ? (
        <>
          <Circle left={9} top={11} size={6} color={color} />
          <Line left={7} top={9} width={10} color={color} />
        </>
      ) : null}
    </>
  );
}

export function DimensionBandIcon({
  dimension,
  band,
  size = 24,
  highContrast = false,
  label
}: {
  dimension: DimensionCode;
  band: DimensionBand;
  size?: number;
  highContrast?: boolean;
  label?: string;
}) {
  const color = highContrast ? '#111111' : lightPalette[dimension];

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label || `${dimension} ${band} icon`}
      style={[styles.iconRoot, { width: size, height: size }]}
    >
      <DimensionShape dimension={dimension} band={band} color={color} />
    </View>
  );
}

export function DimensionBandChip({
  dimension,
  band,
  title
}: {
  dimension: DimensionCode;
  band: DimensionBand;
  title: string;
}) {
  return (
    <View style={styles.chip}>
      <DimensionBandIcon dimension={dimension} band={band} label={`${title} ${bandLabel(band)}`} />
      <Text style={styles.chipText}>{bandLabel(band)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconRoot: {
    position: 'relative'
  },
  dot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7dfd0',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  chipText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 12
  }
});
