import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { plans } from '@/constants/mockData';

export default function PlanSelection() {
  const [selectedPlan, setSelectedPlan] = useState('standard');

  const handleActivatePolicy = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="pt-8 pb-6">
          <Text className="text-3xl font-bold text-text-primary font-rounded">
            Choose your plan
          </Text>
          <Text className="text-text-secondary mt-2 font-rounded">
            Select the coverage that fits your earnings
          </Text>
        </View>

        {/* Plan Cards */}
        <View className="space-y-4 mb-8">
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
              className={`relative bg-card rounded-2xl p-6 border-2 ${
                selectedPlan === plan.id ? 'border-primary' : 'border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <View className="absolute -top-3 right-4 bg-primary px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold font-rounded">Most Popular</Text>
                </View>
              )}

              {/* Plan Content */}
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <Text className="text-2xl font-bold text-text-primary font-rounded">
                    {plan.name}
                  </Text>
                  <Text className="text-text-secondary font-rounded mt-1">
                    {plan.description}
                  </Text>
                </View>
                <View className="text-right">
                  <Text className="text-3xl font-bold text-primary font-rounded">
                    Rs. {plan.price}
                  </Text>
                  <Text className="text-text-secondary text-sm font-rounded">/week</Text>
                </View>
              </View>

              {/* Coverage Highlight */}
              <View className="bg-gray-50 rounded-xl p-3">
                <Text className="text-text-primary font-medium font-rounded">
                  Coverage up to Rs. {plan.coverage}/day
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Activate Policy Button */}
        <TouchableOpacity
          onPress={handleActivatePolicy}
          className="bg-primary rounded-2xl py-4 flex-row justify-center items-center mb-8"
        >
          <Text className="text-white text-lg font-bold font-rounded">Activate Policy</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
