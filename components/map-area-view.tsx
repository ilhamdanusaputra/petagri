import { ThemedView } from '@/components/themed-view';
import React, { useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

export type LatLng = [number, number];

type Props = {
  coordinates: LatLng[];
  height?: number;
  className?: string;
};

export default function MapAreaView({ coordinates, height = 220 }: Props) {
  const center = useMemo(() => {
    if (!coordinates || coordinates.length === 0) return [0, 0];
    const sum = coordinates.reduce(
      (acc, c) => [acc[0] + c[0], acc[1] + c[1]],
      [0, 0]
    );
    return [sum[0] / coordinates.length, sum[1] / coordinates.length];
  }, [coordinates]);

  if (Platform.OS === 'web') {
    const coordsJs = JSON.stringify(coordinates.map((c) => [c[0], c[1]]));
    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>html,body,#map{height:100%;margin:0;padding:0}</style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const coords = ${coordsJs};
      const map = L.map('map').setView([${center[0]}, ${center[1]}], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      const polygon = L.polygon(coords, { color: '#2b8cff', fillColor: '#2b8cff', fillOpacity: 0.2 }).addTo(map);
      map.fitBounds(polygon.getBounds(), { padding: [20, 20] });
    </script>
  </body>
</html>`;

    return (
      <View style={[styles.webWrap, { height }]}> 
        <iframe
          title="Map Area Preview"
          srcDoc={html}
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      </View>
    );
  }

  // Native fallback: simple text + coords list
  return (
    <ThemedView style={[styles.nativeWrap, { height }]}> 
      <Text style={styles.title}>Map preview (open on web)</Text>
      <Text numberOfLines={4} style={styles.coords}>
        {coordinates && coordinates.length > 0 ? JSON.stringify(coordinates) : 'No coordinates provided'}
      </Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  webWrap: { width: '100%', overflow: 'hidden', borderRadius: 12 },
  nativeWrap: { padding: 12, borderRadius: 12, borderWidth: 1 },
  title: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  coords: { fontSize: 12, opacity: 0.9 },
});
