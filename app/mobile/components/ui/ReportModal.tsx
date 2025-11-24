import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { ReportType, createTaskReport, createUserReport } from '../../lib/api';

interface ReportModalProps {
    visible: boolean;
    onClose: () => void;
    targetId: number;
    targetType: 'task' | 'user';
    targetName?: string; // Name of the task or user being reported
}

export function ReportModal({ visible, onClose, targetId, targetType, targetName }: ReportModalProps) {
    const { colors } = useTheme();
    const [selectedType, setSelectedType] = useState<ReportType | null>(null);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const reportTypes = Object.values(ReportType);

    const handleSubmit = async () => {
        if (!selectedType) {
            Alert.alert('Error', 'Please select a reason for reporting.');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Error', 'Please provide a description.');
            return;
        }

        setLoading(true);
        try {
            if (targetType === 'task') {
                await createTaskReport(targetId, selectedType, description);
            } else {
                await createUserReport(targetId, selectedType, description);
            }
            Alert.alert('Success', 'Report submitted successfully.');
            onClose();
            // Reset form
            setSelectedType(null);
            setDescription('');
        } catch (error) {
            Alert.alert('Error', 'Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getReadableType = (type: string) => {
        return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.card }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Report {targetType === 'task' ? 'Task' : 'User'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.subtitle, { color: colors.text }]}>
                        Why are you reporting {targetName ? `"${targetName}"` : 'this'}?
                    </Text>

                    <ScrollView style={styles.content}>
                        <Text style={[styles.label, { color: colors.text }]}>Reason</Text>
                        <View style={styles.typeContainer}>
                            {reportTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.typeButton,
                                        {
                                            borderColor: selectedType === type ? colors.primary : colors.border,
                                            backgroundColor: selectedType === type ? colors.primary + '20' : 'transparent'
                                        }
                                    ]}
                                    onPress={() => setSelectedType(type)}
                                >
                                    <Text style={[
                                        styles.typeText,
                                        { color: selectedType === type ? colors.primary : colors.text }
                                    ]}>
                                        {getReadableType(type)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                            placeholder="Please provide more details..."
                            placeholderTextColor={colors.border}
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                        />
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { borderColor: colors.border }]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: colors.notification }]} // Red for report action usually
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text style={styles.submitText}>Submit Report</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
        opacity: 0.8,
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        marginTop: 10,
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    typeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 8,
    },
    typeText: {
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        height: 100,
        textAlignVertical: 'top',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        paddingBottom: 20, // Add some padding for safe area if needed
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
