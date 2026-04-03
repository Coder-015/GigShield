import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'medium',
  color = '#F97316',
  text,
  className = '',
}: LoadingSpinnerProps) {
  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 48;
      default:
        return 32;
    }
  };

  return (
    <View className={`flex-1 justify-center items-center ${className}`}>
      <ActivityIndicator
        size={getSizeValue()}
        color={color}
        className="mb-2"
      />
      {text && (
        <Text className="text-text-secondary text-center font-rounded mt-2">
          {text}
        </Text>
      )}
    </View>
  );
}
