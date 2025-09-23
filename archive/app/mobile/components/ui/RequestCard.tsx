import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export interface RequestCardProps {
  title?: string; // Expect a string, but will handle defensively
  distance?: string;
  time?: string;
  category?: string;
  urgencyLevel?: string; // e.g., "High", "Medium", "Low", "Past"
  status?: string; // e.g., "Completed", "Accepted", "Pending", "Rejected", or a rating string for "Past"
  onPress?: () => void;
}

const RequestCard: React.FC<RequestCardProps> = (props) => {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];

  // Safely prepare display values
  const displayTitle = (typeof props.title === 'string' && props.title.trim() !== '')
    ? props.title.trim()
    : "Untitled Request"; // Provide a clear default if title is invalid

  const displayDistance = typeof props.distance === 'string' ? props.distance : 'N/A';
  const displayTime = typeof props.time === 'string' ? props.time : 'N/A';
  const displayCategory = typeof props.category === 'string' ? props.category : 'Uncategorized';
  const displayUrgencyLevel = typeof props.urgencyLevel === 'string' ? props.urgencyLevel : 'Medium';
  const displayStatus = typeof props.status === 'string' ? props.status : 'Unknown';

  const getLabelColors = (type: string, property: 'Background' | 'Text' | 'Border') => {
    const sType = String(type || '').trim();
    const capitalizedType = sType.charAt(0).toUpperCase() + sType.slice(1);
    const key = `status${capitalizedType}${property}` as keyof typeof themeColors;

    const effectiveUrgency = String(displayUrgencyLevel || '').trim();
    const effectiveTypeForFallback = effectiveUrgency === 'Past' && property !== 'Text' ? 'Past' : capitalizedType;
    const fallbackKeyBase = `status${effectiveUrgency === 'Past' ? 'Past' : effectiveTypeForFallback}`;

    return themeColors[key] || themeColors[`${fallbackKeyBase}${property}` as keyof typeof themeColors] ||
           (property === 'Text' ? themeColors.text :
            property === 'Background' ? 'transparent' : themeColors.border);
  };

  const urgencyLabelTextColor = getLabelColors(displayUrgencyLevel, 'Text');
  const urgencyLabelBackgroundColor = getLabelColors(displayUrgencyLevel, 'Background');
  const urgencyLabelBorderColor = getLabelColors(displayUrgencyLevel, 'Border');

  const statusTypeForColor = displayUrgencyLevel === 'Past' ? 'Past' : displayStatus;
  const statusLabelTextColor = getLabelColors(statusTypeForColor, 'Text');
  const statusLabelBackgroundColor = getLabelColors(statusTypeForColor, 'Background');
  const statusLabelBorderColor = getLabelColors(statusTypeForColor, 'Border');

  return (
    <View style={[styles.cardContainer, { backgroundColor: themeColors.card }]}>
      <View style={styles.topContainer}>
        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1}>{displayTitle}</Text>
          <Text style={[styles.distanceTimeText, { color: themeColors.textMuted }]} numberOfLines={1}>{`${displayDistance} • ${displayTime}`}</Text>
          <Text
            style={[
                styles.categoryLabel,
                { color: themeColors.primary, backgroundColor: themeColors.lightPurple }
            ]}
            numberOfLines={1}
          >
            {displayCategory}
          </Text>
        </View>
        {props.onPress && ( // Only show chevron if onPress is provided
          <TouchableOpacity onPress={props.onPress} style={styles.iconButton}>
            <Ionicons name="chevron-forward-outline" size={25} color={themeColors.primary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.bottomContainer}>
        <Text
          style={[
            styles.label,
            {
              color: urgencyLabelTextColor,
              backgroundColor: urgencyLabelBackgroundColor,
              borderColor: urgencyLabelBorderColor,
              borderWidth: 1,
            },
          ]}
        >
          {displayUrgencyLevel === 'Past' ? displayUrgencyLevel : `${displayUrgencyLevel} Urgency`}
        </Text>

        {displayUrgencyLevel !== 'Past' && (
            <Text
            style={[
                styles.label,
                {
                color: statusLabelTextColor,
                backgroundColor: statusLabelBackgroundColor,
                borderColor: statusLabelBorderColor,
                borderWidth: 1,
                },
            ]}
            >
            {displayStatus}
            </Text>
        )}
        {displayUrgencyLevel === 'Past' && (
             <Text
             style={[
               styles.label,
               {
                 color: getLabelColors('Past', 'Text'),
                 backgroundColor: getLabelColors('Past', 'Background'),
                 borderColor: getLabelColors('Past', 'Border'),
                 borderWidth: 1,
               },
             ]}
           >
             {`☆ ${displayStatus}`}
           </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'column',
    borderRadius: 12,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
  },
  distanceTimeText: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    marginTop: 2,
  },
  iconButton: { // Changed from styles.icon to give it a proper TouchableOpacity hit area
    padding: 5, // Added padding to make it easier to press
    marginLeft: 8,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  label: {
    textAlign: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    fontSize: 12,
    fontWeight: '500',
    borderRadius: 6,
    overflow: 'hidden',
  },
  // cardContainerError and titleText styles are removed as they were part of the more aggressive error display
  // and are not needed with the current default title handling.
});

export default RequestCard; 