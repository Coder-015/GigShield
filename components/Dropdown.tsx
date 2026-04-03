import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useController, Control, FieldPath, FieldValues } from 'react-hook-form';

interface DropdownProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Dropdown<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  error,
  disabled = false,
  className = '',
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const { field } = useController({
    control,
    name,
  });

  const selectedOption = options.find(option => option.value === field.value);
  const displayValue = selectedOption?.label || placeholder;

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const selectOption = (value: string) => {
    field.onChange(value);
    setIsOpen(false);
  };

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-text-primary font-semibold mb-2 font-rounded">
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        onPress={toggleDropdown}
        disabled={disabled}
        className={`bg-card border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center ${
          error ? 'border-red' : ''
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <Text 
          className={`text-text-primary font-rounded flex-1 ${
            !displayValue ? 'text-text-secondary' : ''
          }`}
          numberOfLines={1}
        >
          {displayValue || placeholder}
        </Text>
        {isOpen ? (
          <ChevronUp size={20} color="#6B7280" />
        ) : (
          <ChevronDown size={20} color="#6B7280" />
        )}
      </TouchableOpacity>
      
      {isOpen && (
        <View className="absolute top-full left-0 right-0 z-50 mt-1">
          <View className="bg-card border border-gray-200 rounded-xl shadow-lg mt-2 max-h-48">
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => selectOption(option.value)}
                  className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                >
                  <Text className="text-text-primary font-rounded">
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
      
      {error && (
        <Text className="text-red text-sm mt-1 font-rounded">
          {error}
        </Text>
      )}
    </View>
  );
}
