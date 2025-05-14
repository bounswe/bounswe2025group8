import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, ScrollView, StyleSheet, ImageSourcePropType } from 'react-native';

// Types
export type Category = { id: string; title: string; count: number; image: ImageSourcePropType };
export type Request = { id: string; title: string; urgency: string; meta?: string; category?: string; color?: string; image?: string };
export type Profile = { id: string; name: string; image?: ImageSourcePropType };

interface Props {
  categories?: Category[];
  requests?: Request[];
  profiles?: Profile[];
  onSelect?: (item: Category | Request | Profile, tab: string) => void;
  onFocus?: () => void;
}

const TABS = ['Categories', 'Requests', 'Profiles'] as const;
const URGENCY_LEVELS = ['All', 'High', 'Medium', 'Low'] as const;

export default function SearchBarWithResults({
  categories = [],
  requests = [],
  profiles = [],
  onSelect,
  onFocus,
}: Props) {
  const [tab, setTab] = useState<typeof TABS[number]>('Categories');
  const [search, setSearch] = useState('');
  const [urgency, setUrgency] = useState<typeof URGENCY_LEVELS[number]>('All');
  const [sortAsc, setSortAsc] = useState(true);

  // Filtering logic
  const lowerSearch = search.trim().toLowerCase();

  // Sort helper
  function sortByName<T extends { title?: string; name?: string }>(arr: T[]): T[] {
    return arr.slice().sort((a, b) => {
      const aName = a.title ?? a.name ?? '';
      const bName = b.title ?? b.name ?? '';
      return sortAsc ? aName.localeCompare(bName) : bName.localeCompare(aName);
    });
  }

  // Filtered data per tab
  let filtered: (Category | Request | Profile)[] = [];
  if (tab === 'Categories') {
    filtered = sortByName(
      categories.filter((cat) =>
        cat.title.toLowerCase().includes(lowerSearch)
      )
    );
  } else if (tab === 'Requests') {
    filtered = sortByName(
      requests.filter((req) => {
        const matches = req.title.toLowerCase().includes(lowerSearch);
        const urgencyMatch = urgency === 'All' || req.urgency === urgency;
        return matches && urgencyMatch;
      })
    );
  } else if (tab === 'Profiles') {
    filtered = sortByName(
      profiles.filter((profile) =>
        profile.name.toLowerCase().includes(lowerSearch)
      )
    );
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder={`Search ${tab}`}
          value={search}
          onChangeText={setSearch}
          onFocus={onFocus}
        />
        <TouchableOpacity onPress={() => setSortAsc((v) => !v)}>
          <Text style={styles.sortBtn}>{sortAsc ? 'A-Z' : 'Z-A'}</Text>
        </TouchableOpacity>
      </View>
      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Urgency filter for requests */}
      {tab === 'Requests' && (
        <View style={styles.urgencyRow}>
          {URGENCY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.urgencyBtn, urgency === level && styles.urgencyBtnActive]}
              onPress={() => setUrgency(level)}
            >
              <Text style={[styles.urgencyText, urgency === level && styles.urgencyTextActive]}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {/* Results */}
      <ScrollView style={styles.results} contentContainerStyle={{ flexGrow: 1, width: '100%' }}>
        {filtered.length === 0 && (
          <Text style={styles.noResults}>No results found.</Text>
        )}
        {filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.resultRow}
            onPress={() => onSelect && onSelect(item, tab)}
          >
            <Text style={styles.resultTitle}>{'title' in item ? item.title : (item as Profile).name}</Text>
            {'urgency' in item && (
              <Text style={styles.resultMeta}>{item.urgency} urgency</Text>
            )}
            {'count' in item && (
              <Text style={styles.resultMeta}>{item.count} requests</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', paddingHorizontal: 16, backgroundColor: 'transparent' },
  tabs: { flexDirection: 'row', marginBottom: 8, width: '100%' },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#6c63ff' },
  tabText: { color: '#888', fontWeight: '500' },
  tabTextActive: { color: '#6c63ff' },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginRight: 8 },
  sortBtn: { color: '#6c63ff', fontWeight: 'bold' },
  urgencyRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  urgencyBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, backgroundColor: '#eee', marginHorizontal: 4 },
  urgencyBtnActive: { backgroundColor: '#6c63ff' },
  urgencyText: { color: '#888' },
  urgencyTextActive: { color: '#fff', fontWeight: 'bold' },
  results: { flex: 1, width: '100%' },
  resultRow: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  resultTitle: { fontWeight: '600', fontSize: 16 },
  resultMeta: { color: '#888', fontSize: 12 },
  noResults: { textAlign: 'center', color: '#888', marginTop: 24 },
}); 