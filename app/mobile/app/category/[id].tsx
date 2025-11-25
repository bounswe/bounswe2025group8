import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { getTasks, type Task } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export default function CategoryPage() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryId = params.id as string;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const { user } = useAuth();

  // Filter out completed and cancelled tasks
  const filterActiveTasks = (tasksList: Task[]): Task[] => {
    return tasksList.filter(task => {
      const status = task.status?.toUpperCase() || '';
      return status !== 'COMPLETED' && status !== 'CANCELLED';
    });
  };

  useEffect(() => {
    fetchTasks();
  }, [categoryId]);

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      const fetchedTasks = response.results || [];
      const activeTasks = filterActiveTasks(fetchedTasks);
      const categoryTasks = activeTasks.filter((task: Task) => task.category === categoryId);

      setTasks(categoryTasks);
      if (categoryTasks.length > 0) {
        setCategoryName(categoryTasks[0].category_display || categoryTasks[0].category);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{categoryName}</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 80 }]}>
        {tasks.length === 0 ? (
          <Text style={[styles.noTasks, { color: colors.text }]}>No requests found for this category.</Text>
        ) : (
          tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[styles.card, { backgroundColor: colors.card }]}
              onPress={() =>
                router.push({
                  pathname: (task.creator && task.creator.id === user?.id) ? '/r-request-details' : '/v-request-details',
                  params: { id: task.id },
                })
              }
            >
              <Image source={require('../../assets/images/help.png')} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{task.title}</Text>
                <Text style={[styles.cardMeta, { color: `${colors.text}99` }]}>{task.location}</Text>
                <View style={styles.pillRow}>
                  <View
                    style={[
                      styles.urgencyBadge,
                      {
                        backgroundColor:
                          task.urgency_level === 3
                            ? '#e74c3c'
                            : task.urgency_level === 2
                            ? '#f1c40f'
                            : '#2ecc71',
                      },
                    ]}
                  >
                    <Text style={styles.urgencyText}>
                      {task.urgency_level === 3 ? 'High' : task.urgency_level === 2 ? 'Medium' : 'Low'}
                    </Text>
                  </View>
                  <View style={[styles.categoryPill, { backgroundColor: colors.primary }]}>
                    <Text style={styles.categoryText}>{task.category_display || task.category}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backBtn: {
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  noTasks: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    paddingRight: 32,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  cardMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  urgencyBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginRight: 8,
  },
  urgencyText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  categoryPill: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
});
