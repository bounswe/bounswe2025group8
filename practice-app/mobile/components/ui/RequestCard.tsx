import React from 'react';
import { View, Text, Image, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export interface RequestCardProps {
  title: string;
  distance: string;
  time: string;
  imageUrl: string;
  category: string;
  urgencyLevel: string;
  status: string;
  onPress?: () => void;
}

const backgroundColors: Record<string, string> = {
  High: '#de3b40', // High Urhgency background color
  Medium: '#efb034', // Medium Urgency background color
  Low: '#1dd75b', // Low Urgency background color
  Past: '#9095a0', // Past background color
  Accepted: '#636AE8', // Accepted background color
  Pending: 'transparent', // Pending background color
  Rejected: 'transparent', // Rejected background color
};

const textColors: Record<string, string> = {
  High: '#fff', // High Urgency text color
  Medium: '#5d4108', // Medium Urgency text color  
  Low: '#0a4d20', // Low Urgency text color
  Accepted: '#fff', // Accepted text color
  Pending: '#636AE8', // Pending text color
  Rejected: '#E8618C', // Rejected text color
};

const borderColors: Record<string, string> = {
  High: '#de3b40', // High Urgency border color
  Medium: '#efb034', // Medium Urgency border color
  Low: '#1dd75b', // Low Urgency border color
  Past: '#9095a0', // Past border color
  Accepted: '#636AE8', // Accepted border color
  Pending: '#636AE8', // Pending border color
  Rejected: '#E8618C', // Rejected border color
};

const RequestCard: React.FC<RequestCardProps> = ({ title, imageUrl, category, urgencyLevel, status, distance, time, onPress }) => {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];

  return (
    <View style={[styles.cardContainer, { backgroundColor: themeColors.background }]}>
      <View style={styles.topContainer}>
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
          <Text style={[styles.distanceTimeText, { color: colors.text }]}>{distance} • {time}</Text>
          <Text style={[styles.categoryLabel, { color: colors.primary, backgroundColor: themeColors.lightPurple }]}>{category}</Text>
        </View>
        <TouchableOpacity onPress={onPress} disabled={!onPress}>
          <Ionicons name="chevron-forward-outline" size={25} color={colors.primary} style={styles.icon} />
        </TouchableOpacity>
      </View>
      <View style={styles.bottomContainer}>
        {/* Urgency Label */}
        {(() => {
          return (
            <Text
              style={[
                styles.label,
                {
                  color: textColors[urgencyLevel] || '#fff',
                  backgroundColor: backgroundColors[urgencyLevel] || '#9095a0',
                  borderColor: borderColors[urgencyLevel] || '#9095a0',
                  borderWidth: 1,
                },
              ]}
            >
              {urgencyLevel === 'Past' ? urgencyLevel : `${urgencyLevel} Urgency`}
            </Text>
          );
        })()}
        {/* Status Label */}
        <Text
          style={[
            styles.label,
            {
              color: textColors[status] || '#efb034',
              backgroundColor: backgroundColors[status] || 'transparent',
              borderColor: borderColors[status] || '#efb034',
              borderWidth: 1,
              marginRight: !['Accepted', 'Pending', 'Rejected'].includes(status) ? 4 : 0,
            },
          ]}
        >
          {['Accepted', 'Pending', 'Rejected'].includes(status) ? status : `☆ ${Number(status).toFixed(1)}`}
        </Text>
      </View>
    </View>

  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'column',
    borderRadius: 24,
    width: '90%',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    borderRadius: 16,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 13,
    marginRight: 14,
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 60,
  },
  title: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 4,
  },
  distanceTimeText: {
    fontSize: 12,
    fontWeight: '300',
    marginBottom: 6,
  },
  categoryLabel: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    borderRadius: 7,
    paddingVertical: 3,
    marginTop: 2,
  },
  icon: {
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 12,
  },
  label: {
    textAlign: 'center',
    paddingVertical: 2,
    marginRight: 8,
    fontSize: 12,
    fontWeight: '400',
    borderRadius: 7,
    width: 120,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RequestCard; 