import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Request } from '../../components/ui/SearchBarWithResults';
import { Ionicons } from '@expo/vector-icons';

const requests: Request[] = [
  { id: 'a', title: 'Help for my math exam', urgency: 'Medium', meta: '550 m • 10 hours ago', category: 'Tutoring', image: require('../../assets/images/help.png') },
  { id: 'b', title: 'Help me see a doctor', urgency: 'High', meta: '2 km • 3 hours ago', category: 'Healthcare', image: require('../../assets/images/help.png') },
  { id: 'c', title: 'I need to clean my house', urgency: 'Low', meta: '750 m • 22 hours ago', category: 'House Cleaning', image: require('../../assets/images/help.png') },
  { id: 'd', title: 'Grocery shopping', urgency: 'Medium', meta: '900 m • 18 hours ago', category: 'Shopping', image: require('../../assets/images/help.png') },
  { id: 'e', title: 'Need help with yard work', urgency: 'Medium', meta: '2.5 km • 1 day ago', category: 'Uncategorized', image: require('../../assets/images/help.png') },
  { id: 'f', title: 'I need to wash my car', urgency: 'Low', meta: '650 m • 2 days ago', category: 'Uncategorized', image: require('../../assets/images/help.png') },
];

const categoryNames: Record<string, string> = {
  '1': 'House Cleaning',
  '2': 'Healthcare',
  '3': 'Tutoring',
  '4': 'Shopping',
  '5': 'Car Driver',
  '6': 'Home Repair',
  '7': 'Car Repair',
};

export default function CategoryPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryId = params.id as string;
  const categoryName = categoryNames[categoryId] || 'Category';

  // Filter requests by category name
  const filteredRequests = requests.filter(r => r.category === categoryName);

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 36 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{categoryName}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        {filteredRequests.length === 0 ? (
          <Text style={{ color: '#888', marginTop: 32, textAlign: 'center' }}>No requests found for this category.</Text>
        ) : (
          filteredRequests.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.card}
              onPress={() => router.push('/request/' + r.id as any)}
            >
              <Image source={typeof r.image === 'number' ? r.image : require('../../assets/images/help.png')} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{r.title}</Text>
                <Text style={styles.cardMeta}>{r.meta}</Text>
                <View style={styles.pillRow}>
                  <View style={[styles.urgencyBadge, { backgroundColor: r.urgency === 'High' ? '#e74c3c' : r.urgency === 'Medium' ? '#f1c40f' : '#2ecc71' }]}> 
                    <Text style={styles.urgencyText}>{r.urgency}</Text>
                  </View>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryText}>{r.category}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  backBtn: { marginRight: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  cardContent: { flex: 1, paddingRight: 32 },
  cardTitle: { fontWeight: '600', fontSize: 16 },
  cardMeta: { color: '#888', fontSize: 12, marginTop: 4 },
  pillRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  urgencyBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 2, marginRight: 8 },
  urgencyText: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  categoryPill: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 2, backgroundColor: '#6c63ff' },
  categoryText: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
}); 