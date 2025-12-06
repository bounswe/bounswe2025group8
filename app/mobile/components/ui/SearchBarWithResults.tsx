import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, ScrollView, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { locationMatches } from '../../utils/address';

export type Category = { id: string; title: string; count: number; image: ImageSourcePropType };
export type Request = { id: string; title: string; urgency: string; meta?: string; category?: string; color?: string; image?: ImageSourcePropType };
export type Profile = { id: string; name: string; image?: ImageSourcePropType };
export type Location = { id: string; title: string; count: number; image?: ImageSourcePropType };

interface Props {
  categories?: Category[];
  requests?: Request[];
  profiles?: Profile[];
  locations?: Location[];
  onSelect?: (item: Category | Request | Profile | Location, tab: string) => void;
  onFocus?: () => void;
}

const TABS = ['Category', 'Request', 'Profile', 'Location'] as const;
const URGENCY_LEVELS = ['All', 'High', 'Medium', 'Low'] as const;

export default function SearchBarWithResults({
  categories = [],
  requests = [],
  profiles = [],
  locations = [],
  onSelect,
  onFocus,
}: Props) {
  const [tab, setTab] = useState<typeof TABS[number]>('Category');
  const [search, setSearch] = useState('');
  const [urgency, setUrgency] = useState<typeof URGENCY_LEVELS[number]>('All');
  const [sortAsc, setSortAsc] = useState(true);
  const { colors } = useTheme();

  const lowerSearch = search.trim().toLowerCase();

  function sortByName<T extends { title?: string; name?: string }>(arr: T[]): T[] {
    return arr.slice().sort((a, b) => {
      const aName = a.title ?? a.name ?? '';
      const bName = b.title ?? b.name ?? '';
      return sortAsc ? aName.localeCompare(bName) : bName.localeCompare(aName);
    });
  }

  let filtered: (Category | Request | Profile | Location)[] = [];
  if (tab === 'Category') {
    filtered = sortByName(
      categories.filter((cat) => cat.title.toLowerCase().includes(lowerSearch))
    );
  } else if (tab === 'Request') {
    filtered = sortByName(
      requests.filter((req) => {
        const matches = req.title.toLowerCase().includes(lowerSearch);
        const urgencyMatch = urgency === 'All' || req.urgency === urgency;
        return matches && urgencyMatch;
      })
    );
  } else if (tab === 'Profile') {
    filtered = sortByName(
      profiles.filter((profile) => profile.name.toLowerCase().includes(lowerSearch))
    );
  } else if (tab === 'Location') {
    filtered = sortByName(
      locations.filter((loc) => locationMatches(loc.title, lowerSearch))
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchBar}>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
          placeholder={`Search ${tab}`}
          placeholderTextColor={colors.text + '99'}
          value={search}
          onChangeText={setSearch}
          onFocus={onFocus}
          testID="search-input"
        />
        <TouchableOpacity onPress={() => setSortAsc((v) => !v)}>
          <Text style={[styles.sortBtn, { color: colors.primary }]}>{sortAsc ? 'A-Z' : 'Z-A'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && { borderBottomColor: colors.primary }]}
            onPress={() => setTab(t)}
            testID={`search-tab-${t}`}
          >
            <Text style={[styles.tabText, { color: colors.text }, tab === t && { color: colors.primary }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {tab === 'Request' && (
        <View style={styles.urgencyRow}>
          {URGENCY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.urgencyBtn,
                { backgroundColor: colors.card },
                urgency === level && { backgroundColor: colors.primary },
              ]}
              onPress={() => setUrgency(level)}
            >
              <Text
                style={[
                  styles.urgencyText,
                  { color: colors.text },
                  urgency === level && { color: colors.background, fontWeight: 'bold' },
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <ScrollView style={styles.results} contentContainerStyle={{ flexGrow: 1, width: '100%' }}>
        {filtered.length === 0 && (
          <Text style={[styles.noResults, { color: colors.text }]}>No results found.</Text>
        )}
        {filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.resultRow,
              { borderBottomColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center' },
            ]}
            onPress={() => onSelect && onSelect(item, tab)}
            testID={`search-result-${item.id}`}
          >
            {(tab === 'Category' || tab === 'Profile' || tab === 'Location') && (
              <Image
                source={
                  tab === 'Profile'
                    ? ((item as Profile).image || require('../../assets/images/empty_profile_photo.png'))
                    : tab === 'Category'
                      ? ((item as Category).image || require('../../assets/images/help.png'))
                      : ((item as Location).image || require('../../assets/images/help.png'))
                }
                style={{ width: 36, height: 36, borderRadius: tab === 'Profile' ? 18 : 8, marginRight: 12, backgroundColor: colors.border }}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.resultTitle, { color: colors.text }]}>
                {'title' in item ? item.title : (item as Profile).name}
              </Text>
              {'urgency' in item && (
                <Text style={[styles.resultMeta, { color: colors.text }]}>{item.urgency} urgency</Text>
              )}
              {'count' in item && (
                <Text style={[styles.resultMeta, { color: colors.text }]}>{item.count} {tab === 'Location' ? 'requests' : 'requests'}</Text>
              )}
              {'meta' in item && item.meta && (
                <Text style={[styles.resultMeta, { color: colors.text }]}>{item.meta}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', paddingHorizontal: 16 },
  tabs: { flexDirection: 'row', marginBottom: 8, width: '100%' },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontWeight: '500' },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 8, marginRight: 8 },
  sortBtn: { fontWeight: 'bold' },
  urgencyRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  urgencyBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, marginHorizontal: 4 },
  urgencyText: {},
  results: { flex: 1, width: '100%' },
  resultRow: { padding: 12, borderBottomWidth: 1 },
  resultTitle: { fontWeight: '600', fontSize: 16 },
  resultMeta: { fontSize: 12 },
  noResults: { textAlign: 'center', marginTop: 24 },
});
