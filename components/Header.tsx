import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBell?: boolean;
}

export function Header({ title, subtitle, showBell = true }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {showBell && (
        <TouchableOpacity style={styles.bellButton}>
          <Bell size={20} color="#6B7280" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'System',
  },
  bellButton: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});
