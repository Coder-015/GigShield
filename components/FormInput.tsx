import React from 'react';
import { TextInput, View, Text } from 'react-native';
import { useController, Control, FieldPath, FieldValues } from 'react-hook-form';
import { z } from 'zod';

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  className?: string;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  className = '',
}: FormInputProps<T>) {
  const { field } = useController({
    control,
    name,
  });

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-text-primary font-semibold mb-2 font-rounded">
          {label}
        </Text>
      )}
      
      <TextInput
        value={field.value}
        onChangeText={field.onChange}
        onBlur={field.onBlur}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={!disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        className={`bg-card border border-gray-200 rounded-xl px-4 py-3 text-text-primary font-rounded ${
          error ? 'border-red' : ''
        } ${disabled ? 'opacity-50' : ''}`}
      />
      
      {error && (
        <Text className="text-red text-sm mt-1 font-rounded">
          {error}
        </Text>
      )}
    </View>
  );
}
