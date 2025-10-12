import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTaskDetails, listVolunteers, type Task, type Volunteer, volunteerForTask, withdrawVolunteer } from '../lib/api';
import { useAuth } from '../lib/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RequestDetailsVolunteer() {
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];
  const router = useRouter();
  const { user } = useAuth();

  const id = params.id ? Number(params.id) : null;
  const [request, setRequest] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [acceptedVolunteers, setAcceptedVolunteers] = useState<Volunteer[]>([]);
  const [hasVolunteered, setHasVolunteered] = useState(false);
  const [volunteerRecord, setVolunteerRecord] = useState<{ id: number; status?: string } | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const storageKey = id && user?.id ? `volunteer-record-${id}-${user.id}` : null;
  const legacyStorageKey = id ? `volunteer-record-${id}` : null;
  const volunteerRecordRef = useRef<{ id: number; status?: string } | null>(null);

  useEffect(() => {
    volunteerRecordRef.current = volunteerRecord;
  }, [volunteerRecord]);

  const normalizeStatus = (status?: string | null) => (status || '').toUpperCase();
  const isActiveVolunteerStatus = (status?: string | null) => {
    const normalized = normalizeStatus(status);
    return normalized === 'PENDING' || normalized === 'ACCEPTED';
  };

  const getLabelColors = (type: string, property: 'Background' | 'Text' | 'Border') => {
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    const baseKey = type === 'Past' ? 'statusPast' : `status${capitalizedType}`;
    const key = `${baseKey}${property}` as keyof typeof themeColors;

    return (
      themeColors[key] ||
      (property === 'Text'
        ? themeColors.text
        : property === 'Background'
        ? 'transparent'
        : themeColors.border)
    );
  };

  const fetchRequestDetails = useCallback(async () => {
    if (!id) {
      setError('Request not found.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const details = await getTaskDetails(id);
      setRequest(details);

      const isCreatorView = user?.id && details.creator?.id === user.id;
      const currentRecord = volunteerRecordRef.current;

      const volunteers = await listVolunteers({ task: id, limit: 100 });

      const taskVolunteers = volunteers.filter((vol) => {
        const taskField = typeof (vol as any).task === 'number' ? (vol as any).task : (vol.task as any)?.id;
        return taskField === id;
      });

      const acceptedList = taskVolunteers.filter((vol) => (vol.status || '').toUpperCase() === 'ACCEPTED');
      const pendingList = taskVolunteers.filter((vol) => (vol.status || '').toUpperCase() === 'PENDING');
      setAcceptedVolunteers(acceptedList);
      setPendingCount(pendingList.length);

      const volunteerForUser = user
        ? taskVolunteers.find((vol) => vol.user?.id === user.id)
        : null;

      const assignedToCurrentUser = user?.id && details.assignee?.id === user.id;
      if (assignedToCurrentUser) {
        setHasVolunteered(true);
        setVolunteerRecord((prev) => {
          const base = prev ?? volunteerForUser ?? currentRecord ?? null;
          if (!base) {
            return volunteerForUser ?? prev;
          }
          const updated = { ...base, status: 'ACCEPTED' };
          if (storageKey && updated.id) {
            AsyncStorage.setItem(storageKey, JSON.stringify(updated)).catch((storageError) => {
              console.warn('Failed to persist volunteer state:', storageError);
            });
            if (legacyStorageKey) {
              AsyncStorage.removeItem(legacyStorageKey).catch(() => {});
            }
          }
          return updated;
        });
      } else if (volunteerForUser) {
        const normalizedStatus = normalizeStatus(volunteerForUser.status);
        setVolunteerRecord(volunteerForUser);
        const isActive = isActiveVolunteerStatus(normalizedStatus);
        setHasVolunteered(isActive);
        volunteerRecordRef.current = volunteerForUser;
        if (storageKey) {
          AsyncStorage.setItem(storageKey, JSON.stringify(volunteerForUser)).catch((storageError) => {
            console.warn('Failed to persist volunteer state:', storageError);
          });
          if (legacyStorageKey) {
            AsyncStorage.removeItem(legacyStorageKey).catch(() => {});
          }
        }
      } else {
        setHasVolunteered(false);
        setVolunteerRecord(null);
        if (storageKey) {
          AsyncStorage.removeItem(storageKey).catch(() => {});
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load request.';
      setError(message);
      setAcceptedVolunteers([]);
    } finally {
      setLoading(false);
    }
  }, [id, user?.id, storageKey]);

useEffect(() => {
  fetchRequestDetails();
}, [fetchRequestDetails]);

useFocusEffect(
  useCallback(() => {
    fetchRequestDetails();
  }, [fetchRequestDetails])
);

useEffect(() => {
  let isMounted = true;
  const hydrateVolunteerState = async () => {
    if (!storageKey) {
      if (isMounted) {
        setVolunteerRecord(null);
        setHasVolunteered(false);
      }
      if (legacyStorageKey) {
        AsyncStorage.removeItem(legacyStorageKey).catch(() => {});
      }
      return;
    }
    try {
      let value = await AsyncStorage.getItem(storageKey);
      if (!value && legacyStorageKey) {
        value = await AsyncStorage.getItem(legacyStorageKey);
        if (value) {
          await AsyncStorage.setItem(storageKey, value);
          await AsyncStorage.removeItem(legacyStorageKey);
        }
      }
      if (!isMounted) {
        return;
      }
      if (value) {
        try {
          const parsed = JSON.parse(value);
          setVolunteerRecord(parsed);
          setHasVolunteered(isActiveVolunteerStatus(parsed.status));
        } catch (parseError) {
          console.warn('Failed to parse stored volunteer record:', parseError);
          setVolunteerRecord(null);
          setHasVolunteered(false);
        }
      } else {
        setVolunteerRecord(null);
        setHasVolunteered(false);
      }
    } catch (storageError) {
      console.warn('Failed to read volunteer state from storage:', storageError);
      if (isMounted) {
        setVolunteerRecord(null);
        setHasVolunteered(false);
      }
    }
  };

  hydrateVolunteerState();

  return () => {
    isMounted = false;
  };
}, [storageKey]);

  const handleStarPress = (star: number) => setRating(star);

  const handleBeVolunteer = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please sign in to volunteer for tasks.', [
        { text: 'OK', onPress: () => router.push('/signin') },
      ]);
      return;
    }
    if (!request) return;

    if (statusNormalized !== 'POSTED') {
      Alert.alert('Request Closed', 'This request is not accepting new volunteers right now.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await volunteerForTask(request.id);
      Alert.alert('Success', response.message || 'You have successfully volunteered for this task!');
      setHasVolunteered(true);

      const recordPayload = (response as any)?.data ?? response.data;
      if (recordPayload && recordPayload.id) {
        const normalizedStatus = typeof recordPayload.status === 'string' ? recordPayload.status.toUpperCase() : 'PENDING';
        const newRecord = { id: recordPayload.id, status: normalizedStatus };
        setVolunteerRecord(newRecord);
        volunteerRecordRef.current = newRecord;
        if (storageKey) {
          AsyncStorage.setItem(storageKey, JSON.stringify(newRecord)).catch((storageError) => {
            console.warn('Failed to persist volunteer state:', storageError);
          });
          if (legacyStorageKey) {
            AsyncStorage.removeItem(legacyStorageKey).catch(() => {});
          }
        }
      }

      await fetchRequestDetails();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Could not volunteer for the task. Please try again.';
      if (errorMessage.toLowerCase().includes('invalid credentials')) {
        Alert.alert('Session expired', 'Please sign in again to continue.');
      } else if (errorMessage.toLowerCase().includes('not available')) {
        Alert.alert('Request Closed', 'This request is currently assigned. The creator must reopen it to accept new volunteers.');
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!volunteerRecord?.id) {
      Alert.alert('Unable to withdraw', 'Could not determine your volunteer application.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await withdrawVolunteer(volunteerRecord.id);
      Alert.alert('Success', response.message || 'Volunteer request withdrawn successfully.');
      const updatedRecord = { id: volunteerRecord.id, status: 'WITHDRAWN' as const };
      setHasVolunteered(false);
      setVolunteerRecord(updatedRecord);
      volunteerRecordRef.current = updatedRecord;
      if (storageKey) {
        AsyncStorage.setItem(storageKey, JSON.stringify(updatedRecord)).catch(() => {});
        if (legacyStorageKey) {
          AsyncStorage.removeItem(legacyStorageKey).catch(() => {});
        }
      }
      await fetchRequestDetails();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not withdraw volunteer request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={themeColors.primary}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}
      />
    );
  }
  if (error || !request) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}>
        <Text style={{ color: themeColors.pink, textAlign: 'center', fontSize: 18 }}>{error || 'Request not found.'}</Text>
      </View>
    );
  }

  const totalSlots = request.volunteer_number || 0;

  const urgencyLevelDisplay =
    request.urgency_level === 3 ? 'High' : request.urgency_level === 2 ? 'Medium' : request.urgency_level === 1 ? 'Low' : 'Medium';
  const statusDisplay = request.status_display || request.status || '';
  const statusDisplayLower = statusDisplay.toLowerCase();
  const requesterName = request.creator?.name || 'Unknown';
  const requesterAvatar = request.creator?.photo || 'https://placehold.co/70x70';
  const datetime = request.deadline ? new Date(request.deadline).toLocaleString() : '';
  const locationDisplay = request.location || 'N/A';
  const requiredPerson = totalSlots || 1;
  const phoneNumber = request.creator?.phone_number || '';
  const isCreatorView = user?.id === request.creator?.id;

  const isCreator = user && request.creator && user.id === request.creator.id;
  const acceptedIds = acceptedVolunteers
    .map((vol) => vol.user?.id)
    .filter((id): id is number => typeof id === 'number');
  const volunteerStatusLabel = normalizeStatus(volunteerRecord?.status).toLowerCase() || (hasVolunteered ? 'pending' : undefined);
  const userAssigned = request.assignee?.id === user?.id;
  const isAlreadyVolunteered =
    hasVolunteered || userAssigned || (!!user && acceptedIds.includes(user.id));
  const acceptedCount = acceptedVolunteers.length;
  const hasCapacity = totalSlots === 0 || acceptedCount < totalSlots;
  const statusNormalized = normalizeStatus(request.status);
  const isTaskOpen = statusNormalized === 'POSTED';
  const canVolunteer = !isCreator && isTaskOpen && !isAlreadyVolunteered && hasCapacity;

  const volunteersInfoText = totalSlots > 0
    ? `Slots filled: ${Math.min(acceptedCount, totalSlots)}/${totalSlots}`
    : `Volunteers needed: ${requiredPerson}`;

  const volunteerStatusMessage = !isCreatorView && (userAssigned || ['pending', 'accepted', 'rejected', 'withdrawn'].includes(volunteerStatusLabel ?? ''))
    ? (() => {
        if (userAssigned || volunteerStatusLabel === 'accepted') {
          return 'You have been assigned to this request.';
        }
        if (volunteerStatusLabel === 'rejected') {
          return 'Your volunteer request was declined.';
        }
        if (volunteerStatusLabel === 'withdrawn') {
          return 'You withdrew your volunteer request. Contact the requester if you wish to volunteer again.';
        }
        if (volunteerStatusLabel === 'pending') {
          return 'Your volunteer request is pending approval.';
        }
        return 'You have volunteered for this request.';
      })()
    : null;

  const showWithdrawButton =
    !isCreator &&
    volunteerRecord?.id &&
    isTaskOpen &&
    volunteerStatusLabel === 'pending';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View
        style={[
          styles.header,
          { backgroundColor: themeColors.card, borderBottomColor: themeColors.border, borderBottomWidth: 1 },
        ]}
      >
        <View style={styles.titleContainer}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/feed');
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColors.text }]}>{request.title}</Text>
        </View>
        <Text style={[styles.categoryLabel, { color: themeColors.primary, backgroundColor: themeColors.lightPurple }]}>
          {request.category_display || request.category}
        </Text>
        <Text
          style={[
            styles.label,
            {
              color: getLabelColors(urgencyLevelDisplay, 'Text'),
              backgroundColor: getLabelColors(urgencyLevelDisplay, 'Background'),
              borderColor: getLabelColors(urgencyLevelDisplay, 'Border'),
              borderWidth: 1,
            },
          ]}
        >
          {statusDisplayLower === 'past' ? statusDisplay : `${urgencyLevelDisplay} Urgency`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={[styles.detailsContainer, { backgroundColor: themeColors.card }]}>
          <TouchableOpacity
            style={styles.avatarRow}
            onPress={() => {
              if (request.creator?.id) {
                router.push({ pathname: '/profile', params: { userId: String(request.creator.id) } });
              }
            }}
            disabled={!request.creator?.id}
            activeOpacity={request.creator?.id ? 0.8 : 1}
          >
            <Image
              source={{ uri: requesterAvatar }}
              style={[styles.avatar, { backgroundColor: themeColors.gray }]}
            />
            <Text style={[styles.name, { color: themeColors.text }]}>{requesterName}</Text>
          </TouchableOpacity>
          <Text style={[styles.descriptionText, { color: themeColors.text }]}>{request.description}</Text>
          <View style={styles.infoContainer}>
            <DetailRow icon="time-outline" value={datetime} themeColors={themeColors} />
            <DetailRow icon="location-outline" value={locationDisplay} themeColors={themeColors} />
            <DetailRow
              icon="people-circle-outline"
              value={`Volunteers needed: ${requiredPerson}`}
              themeColors={themeColors}
            />
            <DetailRow icon="people-outline" value={volunteersInfoText} themeColors={themeColors} />
            {!isTaskOpen && (
              <DetailRow
                icon="remove-circle-outline"
                value="This request is not accepting new volunteers at the moment."
                themeColors={themeColors}
              />
            )}
            <DetailRow
              icon="hourglass-outline"
              value={pendingCount > 0 ? `${pendingCount} pending volunteer request${pendingCount === 1 ? '' : 's'}` : 'No pending volunteer requests'}
              themeColors={themeColors}
            />
            {volunteerStatusMessage && (
              <DetailRow
                icon="checkmark-circle-outline"
                value={volunteerStatusMessage}
                themeColors={themeColors}
              />
            )}
            {(statusDisplayLower === 'accepted' ||
              statusDisplayLower === 'completed' ||
              isCreator ||
              isAlreadyVolunteered
            ) &&
              phoneNumber && (
                <DetailRow icon="call-outline" value={phoneNumber} themeColors={themeColors} />
              )}
          </View>
        </View>

        <Text
          style={[
            styles.statusText,
            {
              color:
                statusDisplayLower === 'past'
                  ? themeColors.statusPastText
                  : getLabelColors(statusDisplay, 'Text'),
            },
          ]}
        >
          {statusDisplayLower === 'past' && request.assignee
            ? `☆ ${(Number((request.assignee as any)?.rating) || 0).toFixed(1)}`
            : statusDisplay}
        </Text>

        {actionLoading ? (
          <ActivityIndicator size="small" color={themeColors.primary} style={{ marginVertical: 16 }} />
        ) : (
          user &&
          !isCreator &&
          (statusDisplayLower === 'completed' ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: themeColors.pink }]}
              onPress={() => {
                if (!user) {
                  Alert.alert('Login Required', 'Please sign in to rate/review.', [
                    { text: 'OK', onPress: () => router.push('/signin') },
                  ]);
                  return;
                }
                setModalVisible(true);
              }}
            >
              <Text style={[styles.buttonText, { color: themeColors.card }]}>Rate & Review Requester</Text>
            </TouchableOpacity>
          ) : canVolunteer ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
              onPress={handleBeVolunteer}
              disabled={actionLoading}
            >
              <Text style={[styles.buttonText, { color: themeColors.card }]}>Be a Volunteer</Text>
            </TouchableOpacity>
          ) : null)
        )}

        {showWithdrawButton && (
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: themeColors.error }]}
            onPress={handleWithdraw}
            disabled={actionLoading}
          >
            <Text style={[styles.buttonText, { color: themeColors.error }]}>Withdraw Volunteer Request</Text>
          </TouchableOpacity>
        )}

        {request.creator?.id && (
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: themeColors.primary }]}
            onPress={() => router.push({ pathname: '/profile', params: { userId: String(request.creator?.id) } })}
          >
            <Text style={[styles.buttonText, { color: themeColors.primary }]}>View Requester Profile</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Rate Request</Text>
            <TextInput
              style={[
                styles.modalInput,
                { borderColor: themeColors.border, color: themeColors.text, backgroundColor: colors.background },
              ]}
              placeholder="Leave your review..."
              placeholderTextColor={themeColors.textMuted}
              multiline
              value={reviewText}
              onChangeText={setReviewText}
            />
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={28}
                    color={star <= rating ? themeColors.primary : themeColors.border}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: themeColors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: themeColors.primary }]}
                onPress={() => {
                  if (!reviewText.trim()) {
                    Alert.alert('Error', 'Review cannot be empty.');
                    return;
                  }
                  Alert.alert('Success', 'Review submitted!');
                  setModalVisible(false);
                  setReviewText('');
                  setRating(0);
                }}
              >
                <Text style={{ color: themeColors.card }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  value,
  themeColors,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  themeColors: typeof Colors.light;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={25} color={themeColors.textMuted} style={styles.icon} />
      <Text style={[styles.infoText, { color: themeColors.textMuted }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  categoryLabel: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  label: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  detailsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoContainer: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
  },
  statusText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
});
