import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

type Event = { id: string; date: Date; note?: string };

type Props = {
  events: Event[];
  year?: number;
  month?: number; // 0-based
};

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function ScheduleCalendar({ events, year, month }: Props) {
  const today = new Date();
  const displayYear = year ?? today.getFullYear();
  const displayMonth = typeof month === 'number' ? month : today.getMonth();

  const [currentYear, setCurrentYear] = useState(displayYear);
  const [currentMonth, setCurrentMonth] = useState(displayMonth);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const cardBg = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'cardBorder');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const accent = useThemeColor({}, 'accent');

  const eventsByDay = useMemo(() => {
    const map = new Map<number, Event[]>();
    events.forEach((e) => {
      const d = new Date(e.date);
      if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return;
      const day = d.getDate();
      map.set(day, (map.get(day) || []).concat(e));
    });
    return map;
  }, [events, currentMonth, currentYear]);

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = daysInMonth(currentYear, currentMonth);

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  function goMonth(delta: number) {
    const next = new Date(currentYear, currentMonth + delta, 1);
    setCurrentYear(next.getFullYear());
    setCurrentMonth(next.getMonth());
    setSelectedDay(null);
  }

  const selectedEvents = selectedDay ? eventsByDay.get(selectedDay) ?? [] : [];

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBg, borderColor: border }]}> 
      <View style={styles.headerRow}>
        <Pressable onPress={() => goMonth(-1)} style={styles.navBtn}><Text style={{ color: text }}>{'‹'}</Text></Pressable>
        <ThemedText type="subtitle">{`${currentMonth + 1}/${currentYear}`}</ThemedText>
        <Pressable onPress={() => goMonth(1)} style={styles.navBtn}><Text style={{ color: text }}>{'›'}</Text></Pressable>
      </View>

      <View style={styles.grid}>
        {dayNames.map((d) => (
          <Text key={d} style={[styles.dayName, { color: text }]}>{d}</Text>
        ))}

        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <View key={`pad-${i}`} style={styles.cell} />
        ))}

        {Array.from({ length: totalDays }).map((_, idx) => {
          const day = idx + 1;
          const has = eventsByDay.has(day);
          const isSelected = selectedDay === day;
          return (
            <Pressable
              key={day}
              style={[
                styles.cell,
                isSelected && { backgroundColor: tint + '22', borderRadius: 6 },
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.cellText, { color: text }]}>{day}</Text>
              {has && <View style={[styles.dot, { backgroundColor: accent }]} />}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.detailRow}>
        <ThemedText type="subtitle">{selectedDay ? `Events on ${selectedDay}/${currentMonth + 1}` : 'Tap a day to view events'}</ThemedText>
      </View>
      {selectedDay && (
        <View style={styles.eventList}>
          {selectedEvents.map((e) => (
            <Pressable
              key={e.id}
              onPress={() => Alert.alert('Event', `${e.note ?? ''}\n${new Date(e.date).toLocaleString()}`)}
              style={[styles.eventItem, { borderColor: border, backgroundColor: cardBg }]}
            >
              <Text style={{ color: text, fontWeight: '600' }}>{new Date(e.date).toLocaleDateString('id-ID')}</Text>
              <Text style={{ color: text }}>{e.note}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 10, borderWidth: 1, padding: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  navBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayName: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 12, marginBottom: 6 },
  cell: { width: `${100 / 7}%`, height: 44, alignItems: 'center', justifyContent: 'center' },
  cellSelected: { backgroundColor: '#e6f0ff', borderRadius: 6 },
  cellText: { fontSize: 13 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0a84ff', marginTop: 6 },
  detailRow: { marginTop: 8, marginBottom: 6 },
  eventList: { gap: 8 },
  eventItem: { padding: 8, borderWidth: 1, borderRadius: 8, marginBottom: 6 },
});
