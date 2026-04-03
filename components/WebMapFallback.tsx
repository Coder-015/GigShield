import { Card, Subtitle, Title, Value } from '@/components/DesignSystem';
import { AlertTriangle, Info, MapPin, Shield } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

// Mumbai zones with risk levels
const mumbaiZones: MapMarker[] = [
  {
    id: 'bandra',
    name: 'Bandra',
    risk: 'high',
    description: 'Heavy rainfall expected today',
    claims: 12,
    avgPayout: 450,
  },
  {
    id: 'kurla',
    name: 'Kurla',
    risk: 'medium',
    description: 'Moderate rainfall possible',
    claims: 8,
    avgPayout: 320,
  },
  {
    id: 'dharavi',
    name: 'Dharavi',
    risk: 'low',
    description: 'Clear weather expected',
    claims: 3,
    avgPayout: 180,
  },
  {
    id: 'andheri',
    name: 'Andheri',
    risk: 'high',
    description: 'Thunderstorm warning issued',
    claims: 15,
    avgPayout: 520,
  },
  {
    id: 'borivali',
    name: 'Borivali',
    risk: 'medium',
    description: 'Light showers possible',
    claims: 6,
    avgPayout: 280,
  },
  {
    id: 'powai',
    name: 'Powai',
    risk: 'low',
    description: 'No rainfall expected',
    claims: 2,
    avgPayout: 150,
  },
];

interface MapMarker {
  id: string;
  name: string;
  risk: 'high' | 'medium' | 'low';
  description: string;
  claims: number;
  avgPayout: number;
}

interface WebMapFallbackProps {
  onZonePress?: (zone: MapMarker) => void;
  showUserLocation?: boolean;
}

export default function WebMapFallback({ onZonePress, showUserLocation = true }: WebMapFallbackProps) {
  const [selectedZone, setSelectedZone] = useState<MapMarker | null>(null);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high':
        return AlertTriangle;
      case 'medium':
        return Shield;
      case 'low':
        return MapPin;
      default:
        return MapPin;
    }
  };

  const handleZonePress = (zone: MapMarker) => {
    setSelectedZone(zone);
    if (onZonePress) {
      onZonePress(zone);
    }
  };

  const handleZoneAction = (action: string) => {
    if (!selectedZone) return;
    
    switch (action) {
      case 'details':
        Alert.alert(
          `${selectedZone.name} Zone Details`,
          `Risk Level: ${selectedZone.risk.toUpperCase()}\n${selectedZone.description}\n\nClaims this month: ${selectedZone.claims}\nAverage payout: ₹${selectedZone.avgPayout}`,
          [{ text: 'OK' }]
        );
        break;
      case 'simulate':
        Alert.alert(
          'Simulate Rain',
          `Simulate rain in ${selectedZone.name} zone?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Simulate', onPress: () => console.log('Simulate rain in', selectedZone.name) }
          ]
        );
        break;
    }
  };

  const renderZone = (zone: MapMarker) => {
    const Icon = getRiskIcon(zone.risk);
    const color = getRiskColor(zone.risk);
    
    return (
      <TouchableOpacity
        key={zone.id}
        style={[
          styles.zoneCard,
          selectedZone?.id === zone.id && styles.selectedZoneCard
        ]}
        onPress={() => handleZonePress(zone)}
      >
        <View style={[styles.zoneIcon, { backgroundColor: color }]}>
          <Icon size={20} color="#FFFFFF" />
        </View>
        <View style={styles.zoneInfo}>
          <Text style={styles.zoneName}>{zone.name}</Text>
          <Text style={styles.zoneRisk}>{zone.risk.toUpperCase()} RISK</Text>
          <Text style={styles.zoneDescription}>{zone.description}</Text>
        </View>
        <View style={styles.zoneStats}>
          <Text style={styles.zoneClaims}>{zone.claims} claims</Text>
          <Text style={styles.zonePayout}>₹{zone.avgPayout}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title size="large">Mumbai Weather Map</Title>
        <Subtitle>Real-time risk assessment for delivery zones</Subtitle>
      </View>

      {/* Zone Grid */}
      <ScrollView style={styles.zonesContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.zonesGrid}>
          {mumbaiZones.map(renderZone)}
        </View>
      </ScrollView>

      {/* Zone Details Panel */}
      {selectedZone && (
        <View style={styles.zoneDetails}>
          <Card style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <View style={[styles.detailsIcon, { backgroundColor: getRiskColor(selectedZone.risk) }]}>
                {(() => {
                  const Icon = getRiskIcon(selectedZone.risk);
                  return <Icon size={24} color="#FFFFFF" />;
                })()}
              </View>
              <View style={styles.detailsInfo}>
                <Title size="medium">{selectedZone.name}</Title>
                <Subtitle>Risk Level: {selectedZone.risk.toUpperCase()}</Subtitle>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedZone(null)}
              >
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.detailsDescription}>{selectedZone.description}</Text>
            
            <View style={styles.detailsStats}>
              <View style={styles.statItem}>
                <Value emphasis="medium">{selectedZone.claims}</Value>
                <Subtitle>Claims</Subtitle>
              </View>
              <View style={styles.statItem}>
                <Value emphasis="medium">₹{selectedZone.avgPayout}</Value>
                <Subtitle>Avg Payout</Subtitle>
              </View>
            </View>
            
            <View style={styles.detailsActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.detailsButton]}
                onPress={() => handleZoneAction('details')}
              >
                <Info size={16} color="#FFFFFF" />
                <Text style={styles.actionText}>Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.simulateButton]}
                onPress={() => handleZoneAction('simulate')}
              >
                <AlertTriangle size={16} color="#FFFFFF" />
                <Text style={styles.actionText}>Simulate</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      )}

      {/* Map Legend */}
      <View style={styles.legend}>
        <Card style={styles.legendCard}>
          <Title size="small">Risk Levels</Title>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>High</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Medium</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Low</Text>
            </View>
          </View>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF7',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  zonesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  zonesGrid: {
    gap: 12,
    paddingBottom: 20,
  },
  zoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedZoneCard: {
    borderWidth: 2,
    borderColor: '#F97316',
  },
  zoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
    fontFamily: 'System',
  },
  zoneRisk: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'System',
  },
  zoneDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'System',
  },
  zoneStats: {
    alignItems: 'flex-end',
  },
  zoneClaims: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'System',
  },
  zonePayout: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    fontFamily: 'System',
  },
  zoneDetails: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  detailsCard: {
    padding: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsInfo: {
    flex: 1,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'System',
  },
  detailsDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontFamily: 'System',
  },
  detailsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  detailsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  detailsButton: {
    backgroundColor: '#3B82F6',
  },
  simulateButton: {
    backgroundColor: '#F97316',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  legend: {
    position: 'absolute',
    top: 100,
    right: 20,
  },
  legendCard: {
    padding: 12,
    minWidth: 120,
  },
  legendItems: {
    gap: 8,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#1C1C1E',
    fontFamily: 'System',
  },
});
