import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export type LatLng = [number, number];

type Props = {
  coordinates: LatLng[];
  height?: number;
  className?: string;
};

export default function MapAreaView({ coordinates, height = 220 }: Props) {
  const cardBg = useThemeColor({ light: '#FFFFFF', dark: '#0f1724' }, 'card');
  const borderColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'cardBorder');
  const tint = useThemeColor({}, 'tint');
  const center = useMemo(() => {
    if (!coordinates || coordinates.length === 0) return [0, 0];
    const sum = coordinates.reduce(
      (acc, c) => [acc[0] + c[0], acc[1] + c[1]],
      [0, 0]
    );
    return [sum[0] / coordinates.length, sum[1] / coordinates.length];
  }, [coordinates]);

  const coordsJs = JSON.stringify(coordinates.map((c) => [c[0], c[1]]));
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>html,body,#map{height:100%;margin:0;padding:0}body{background:transparent}</style>
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
      const polygon = L.polygon(coords, { color: '${tint}', fillColor: '${tint}', fillOpacity: 0.18 }).addTo(map);
      map.fitBounds(polygon.getBounds(), { padding: [20, 20] });
    </script>
  </body>
</html>`;

  if (Platform.OS === 'web') {
    return (
      <ThemedView style={[styles.wrap, { backgroundColor: cardBg, borderColor: borderColor, height }]}> 
        <iframe title="Map Area Preview" srcDoc={html} style={{ width: '100%', height: '100%', border: 0, borderRadius: 12 }} />
      </ThemedView>
    );
  }

  // Native: WebView for consistent rendering
  return (
    <ThemedView style={[styles.wrap, { backgroundColor: cardBg, borderColor: borderColor, height }]}> 
      <WebView originWhitelist={["*"]} source={{ html }} style={styles.webview} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    // subtle elevation for readable separation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  webview: { width: '100%', height: '100%', backgroundColor: 'transparent', borderRadius: 12 },
  title: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  coords: { fontSize: 12, opacity: 0.9 },
});
