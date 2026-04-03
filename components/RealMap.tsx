import { Card, Subtitle, Title, Value } from '@/components/DesignSystem';
import { AlertTriangle, Info, MapPin, Shield } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Circle, Marker, Region } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import { darkMapStyle } from '@/constants/mapStyle';

const { width, height } = Dimensions.get('window');

// Mumbai zones with real coordinates and risk levels
const mumbaiZones: MapMarker[] = [
  {
    id: 'bandra',
    name: 'Bandra',
    coordinates: { latitude: 19.0596, longitude: 72.8295 },
    risk: 'high',
    description: 'Heavy rainfall expected today',
    claims: 12,
    avgPayout: 450,
  },
  {
    id: 'kurla',
    name: 'Kurla',
    coordinates: { latitude: 19.0728, longitude: 72.8826 },
    risk: 'medium',
    description: 'Moderate rainfall possible',
    claims: 8,
    avgPayout: 320,
  },
  {
    id: 'dharavi',
    name: 'Dharavi',
    coordinates: { latitude: 19.0360, longitude: 72.8497 },
    risk: 'low',
    description: 'Clear weather expected',
    claims: 3,
    avgPayout: 180,
  },
  {
    id: 'andheri',
    name: 'Andheri',
    coordinates: { latitude: 19.1199, longitude: 72.8464 },
    risk: 'high',
    description: 'Thunderstorm warning issued',
    claims: 15,
    avgPayout: 520,
  },
  {
    id: 'borivali',
    name: 'Borivali',
    coordinates: { latitude: 19.2317, longitude: 72.8577 },
    risk: 'medium',
    description: 'Light showers possible',
    claims: 6,
    avgPayout: 280,
  },
  {
    id: 'powai',
    name: 'Powai',
    coordinates: { latitude: 19.1198, longitude: 72.9085 },
    risk: 'low',
    description: 'No rainfall expected',
    claims: 2,
    avgPayout: 150,
  },
];

interface MapMarker {
  id: string;
  name: string;
  coordinates: { latitude: number; longitude: number };
  risk: 'high' | 'medium' | 'low';
  description: string;
  claims: number;
  avgPayout: number;
}

interface RealMapProps {
  onZonePress?: (zone: MapMarker) => void;
  showUserLocation?: boolean;
  onSimulate?: (zone: MapMarker) => void;
}

export default function RealMap({ onZonePress, showUserLocation = true, onSimulate }: RealMapProps) {
  const [selectedZone, setSelectedZone] = useState<MapMarker | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 19.0760, // Mumbai center
    longitude: 72.8777,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  });
  const mapRef = useRef<MapView>(null);

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

  const handleMarkerPress = (zone: MapMarker) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
          `Risk Level: ${selectedZone.risk.toUpperCase()}\n${selectedZone.description}\n\nActive Claims: ${selectedZone.claims}\nAvg claim payout: ₹${selectedZone.avgPayout}`,
          [{ text: 'OK' }]
        );
        break;
      case 'simulate':
        if (onSimulate) {
          onSimulate(selectedZone);
        } else {
          Alert.alert(
            'Simulate Rain',
            `Simulate rain in ${selectedZone.name} zone?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Simulate', onPress: () => console.log('Simulate rain in', selectedZone.name) }
            ]
          );
        }
        break;
    }
  };

  const renderMarker = (zone: MapMarker) => {
    const Icon = getRiskIcon(zone.risk);
    const color = getRiskColor(zone.risk);
    
    return (
      <Marker
        key={zone.id}
        coordinate={zone.coordinates}
        onPress={() => handleMarkerPress(zone)}
      >
        <View style={[styles.markerContainer, { backgroundColor: color }]}>
          <Icon size={20} color="#FFFFFF" />
        </View>
      </Marker>
    );
  };

  const renderRiskCircle = (zone: MapMarker) => {
    const color = getRiskColor(zone.risk);
    const fillColor = zone.risk === 'high' ? 'rgba(239, 68, 68, 0.3)' : 
                     zone.risk === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 
                     'rgba(16, 185, 129, 0.1)';
    
    return (
      <Circle
        key={`${zone.id}-circle`}
        center={zone.coordinates}
        radius={zone.risk === 'high' ? 1500 : zone.risk === 'medium' ? 1000 : 500}
        fillColor={fillColor}
        strokeColor={color}
        strokeWidth={1}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        customMapStyle={darkMapStyle}
        onRegionChangeComplete={setRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        loadingIndicatorColor="#F97316"
      >
        {/* Risk circles */}
        {mumbaiZones.map(renderRiskCircle)}
        
        {/* Zone markers */}
        {mumbaiZones.map(renderMarker)}
      </MapView>

      {/* Zone Details Panel */}
      {selectedZone && (
        <View style={styles.zoneDetails}>
          <Card style={styles.zoneCard}>
            <View style={styles.zoneHeader}>
              <View style={[styles.zoneIcon, { backgroundColor: getRiskColor(selectedZone.risk) }]}>
                {(() => {
                  const Icon = getRiskIcon(selectedZone.risk);
                  return <Icon size={24} color="#FFFFFF" />;
                })()}
              </View>
              <View style={styles.zoneInfo}>
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
            
            <Text style={styles.zoneDescription}>{selectedZone.description}</Text>
            
            <View style={styles.zoneStats}>
              <View style={styles.statItem}>
                <Value emphasis="medium">{selectedZone.claims}</Value>
                <Subtitle>Claims</Subtitle>
              </View>
              <View style={styles.statItem}>
                <Value emphasis="medium">₹{selectedZone.avgPayout}</Value>
                <Subtitle>Avg Payout</Subtitle>
              </View>
            </View>
            
            <View style={styles.zoneActions}>
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
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  zoneDetails: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  zoneCard: {
    padding: 16,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  zoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  zoneInfo: {
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
  zoneDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontFamily: 'System',
  },
  zoneStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  zoneActions: {
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
    top: 50,
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
