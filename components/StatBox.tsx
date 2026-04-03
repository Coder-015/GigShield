import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatBoxProps {
  label: string;
  value: string | number;
  color?: string;
}

export function StatBox({ label, value, color = '#1C1C1E' }: StatBoxProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'System',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
});
