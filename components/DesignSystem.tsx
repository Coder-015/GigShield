import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';

// Card Component
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  margin?: number;
  marginBottom?: number;
}

export function Card({ children, style, padding = 16, margin = 0, marginBottom = 0 }: CardProps) {
  return (
    <View style={[
      styles.card,
      { padding, margin, marginBottom },
      style
    ]}>
      {children}
    </View>
  );
}

// Typography Components
interface TitleProps {
  children: React.ReactNode;
  style?: TextStyle;
  size?: 'large' | 'medium' | 'small';
}

export function Title({ children, style, size = 'large' }: TitleProps) {
  return (
    <Text style={[
      styles.title,
      size === 'large' && styles.titleLarge,
      size === 'medium' && styles.titleMedium,
      size === 'small' && styles.titleSmall,
      style
    ]}>
      {children}
    </Text>
  );
}

interface SubtitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export function Subtitle({ children, style }: SubtitleProps) {
  return (
    <Text style={[styles.subtitle, style]}>
      {children}
    </Text>
  );
}

interface ValueProps {
  children: React.ReactNode;
  style?: TextStyle;
  emphasis?: 'high' | 'medium' | 'low';
}

export function Value({ children, style, emphasis = 'medium' }: ValueProps) {
  return (
    <Text style={[
      styles.value,
      emphasis === 'high' && styles.valueHigh,
      emphasis === 'medium' && styles.valueMedium,
      emphasis === 'low' && styles.valueLow,
      style
    ]}>
      {children}
    </Text>
  );
}

// Button Component
interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ children, onPress, variant = 'primary', size = 'medium', disabled = false, style }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'outline' && styles.buttonOutline,
        size === 'small' && styles.buttonSmall,
        size === 'medium' && styles.buttonMedium,
        size === 'large' && styles.buttonLarge,
        disabled && styles.buttonDisabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[
        styles.buttonText,
        variant === 'primary' && styles.buttonTextPrimary,
        variant === 'secondary' && styles.buttonTextSecondary,
        variant === 'outline' && styles.buttonTextOutline,
        disabled && styles.buttonTextDisabled
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

// Stats Grid Component
interface StatsGridProps {
  children: React.ReactNode;
}

export function StatsGrid({ children }: StatsGridProps) {
  return (
    <View style={styles.statsGrid}>
      {children}
    </View>
  );
}

interface StatBoxProps {
  label: string;
  value: string | number;
  style?: ViewStyle;
}

export function StatBox({ label, value, style }: StatBoxProps) {
  return (
    <View style={[styles.statBox, style]}>
      <Value emphasis="high">{value}</Value>
      <Subtitle>{label}</Subtitle>
    </View>
  );
}

const styles = StyleSheet.create({
  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Typography
  title: {
    fontWeight: 'bold',
    color: '#1C1C1E',
    fontFamily: 'System',
  },
  titleLarge: {
    fontSize: 28,
  },
  titleMedium: {
    fontSize: 20,
  },
  titleSmall: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'System',
  },
  value: {
    fontWeight: '600',
    color: '#1C1C1E',
    fontFamily: 'System',
  },
  valueHigh: {
    fontSize: 24,
    color: '#1C1C1E',
  },
  valueMedium: {
    fontSize: 18,
    color: '#1C1C1E',
  },
  valueLow: {
    fontSize: 16,
    color: '#6B7280',
  },
  
  // Button
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#F97316',
  },
  buttonSecondary: {
    backgroundColor: '#6B7280',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F97316',
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: '#FFFFFF',
  },
  buttonTextOutline: {
    color: '#F97316',
  },
  buttonTextDisabled: {
    color: '#9CA3AF',
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  statBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
});
