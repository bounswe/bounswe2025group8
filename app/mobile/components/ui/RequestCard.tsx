import React from 'react';
import { View, Text, Image, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export interface RequestCardProps {
  title: string;
  distance: string;
  time: string;
  imageUrl: string | number; // Allow string (URI) or number (require result)
  category: string;
  urgencyLevel: string; // e.g., "High", "Medium", "Low", "Past"
  status: string; // e.g., "Completed", "Accepted", "Pending", "Rejected", or a rating string for "Past"
  onPress?: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ title, imageUrl, category, urgencyLevel, status, distance, time, onPress }) => {
  const { colors } = useTheme(); // colors from @react-navigation/native theme
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light']; // Our comprehensive theme colors

  // Helper function to get status/urgency specific colors from themeColors
  const getLabelColors = (type: string, property: 'Background' | 'Text' | 'Border') => {
    // Capitalize first letter of type for key construction (e.g., High -> StatusHighBackground)
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    const key = `status${capitalizedType}${property}` as keyof typeof themeColors;
    
    // Fallback if a specific color is not defined (e.g. for numeric status for 'Past' urgency)
    // For 'Past' urgency, status might be a rating string. We'll use 'Past' colors for it.
    const effectiveType = urgencyLevel === 'Past' && property !== 'Text' ? 'Past' : capitalizedType;
    const fallbackKeyBase = `status${urgencyLevel === 'Past' ? 'Past' : effectiveType}`;

    return themeColors[key] || themeColors[`${fallbackKeyBase}${property}` as keyof typeof themeColors] || 
           (property === 'Text' ? themeColors.text : 
            property === 'Background' ? 'transparent' : themeColors.border);
  };

  // Determine colors for Urgency Label
  const urgencyLabelTextColor = getLabelColors(urgencyLevel, 'Text');
  const urgencyLabelBackgroundColor = getLabelColors(urgencyLevel, 'Background');
  const urgencyLabelBorderColor = getLabelColors(urgencyLevel, 'Border');

  // Determine colors for Status Label
  // If urgency is 'Past', status is a rating. We use 'Past' styling for its label.
  const statusTypeForColor = urgencyLevel === 'Past' ? 'Past' : status;
  const statusLabelTextColor = getLabelColors(statusTypeForColor, 'Text');
  const statusLabelBackgroundColor = getLabelColors(statusTypeForColor, 'Background');
  const statusLabelBorderColor = getLabelColors(statusTypeForColor, 'Border');


  return (
    <View style={[styles.cardContainer, { backgroundColor: themeColors.card }]}> {/* Use themeColors.card */}
      <View style={styles.topContainer}>
        <Image 
          source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl} 
          style={styles.cardImage} 
        />
        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1}>{title}</Text>
          <Text style={[styles.distanceTimeText, { color: themeColors.textMuted }]} numberOfLines={1}>{distance} • {time}</Text>
          <Text 
            style={[
                styles.categoryLabel,
                { color: themeColors.primary, backgroundColor: themeColors.lightPurple }
            ]}
            numberOfLines={1}
          >
            {category || 'Unknown'}
          </Text>
        </View>
        <TouchableOpacity onPress={onPress} disabled={!onPress}>
          <Ionicons name="chevron-forward-outline" size={25} color={themeColors.primary} style={styles.icon} />
        </TouchableOpacity>
      </View>
      <View style={styles.bottomContainer}>
        {/* Urgency Label */}
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
          {urgencyLevel === 'Past' ? urgencyLevel : `${urgencyLevel} Urgency`}
        </Text>

        {/* Status Label */}
        {/* Only show status label if urgency is not 'Past'. If 'Past', the status is the rating shown in urgency. */}
        {urgencyLevel !== 'Past' && (
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
            {typeof status === 'object' ? JSON.stringify(status) : String(status)} 
            </Text>
        )}
        {/* If urgency is 'Past', display the rating (status prop) with specific styling */}
        {urgencyLevel === 'Past' && (
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
             {`☆ ${status}`} {/* Assuming status is the rating string when urgency is Past */}
           </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'column',
    borderRadius: 12, // Slightly smaller radius
    width: '90%',
    alignSelf: 'center', // Center card
    marginBottom: 16,
    shadowColor: '#000', // Basic shadow for depth, consider theme-specific shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12, // Add some padding
    paddingTop: 12, // Add some padding
  },
  cardImage: {
    width: 60, // Slightly smaller image
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    // marginRight: 40, // Removed to allow chevron to be closer if text is short
  },
  title: {
    fontWeight: '600',
    fontSize: 16, // Slightly larger title
    marginBottom: 2,
  },
  distanceTimeText: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 4, // Adjusted spacing
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 8, // Add horizontal padding
    alignSelf: 'flex-start', // Ensure it only takes needed width
    overflow: 'hidden', // For numberOfLines to work with padding
    marginTop: 2,
  },
  icon: {
    marginLeft: 8, // Add some space before icon
  },
  bottomContainer: {
    flexDirection: 'row',
    // alignItems: 'center', // Not always needed if labels have same height
    // justifyContent: 'center', // Changed to flex-start
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    marginTop: 8, // Increased top margin for separation
    marginBottom: 12,
  },
  label: {
    textAlign: 'center',
    paddingVertical: 4, // Increased padding
    paddingHorizontal: 10, // Increased padding
    marginRight: 8,
    fontSize: 12,
    fontWeight: '500', // Slightly bolder
    borderRadius: 6,
    // width: 120, // Removed fixed width to allow dynamic sizing
    overflow: 'hidden', // Ensure text within rounded corners
  },
  // urgencyText: { // This style was unused
  //   fontSize: 12,
  //   fontWeight: '500',
  // },
});

export default RequestCard; 