import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeProvider';
import { ReportType, REPORT_TYPE_LABELS } from '../lib/api';
import { useTranslation } from 'react-i18next';

interface ReportModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (reportType: string, description: string) => Promise<void>;
    targetName: string; // e.g., "Task" or "User Name"
    isUserReport?: boolean;
}

export const ReportModal: React.FC<ReportModalProps> = ({
    visible,
    onClose,
    onSubmit,
    targetName,
    isUserReport = false,
}) => {
    const { t } = useTranslation();
    const { tokens: themeColors } = useAppTheme();

    const [reportType, setReportType] = useState<string>('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [showTypePicker, setShowTypePicker] = useState(false);

    useEffect(() => {
        if (visible) {
            setReportType('');
            setDescription('');
            setLoading(false);
            setShowTypePicker(false);
        }
    }, [visible]);

    const handleSubmit = async () => {
        if (!reportType) {
            Alert.alert(t('report.validationError'), t('report.selectReasonError'));
            return;
        }

        if (!description.trim()) {
            Alert.alert(t('report.validationError'), t('report.detailsError'));
            return;
        }

        if (description.trim().length < 10) {
            Alert.alert(t('report.validationError'), t('report.lengthError'));
            return;
        }

        setLoading(true);
        try {
            await onSubmit(reportType, description.trim());
            // Success handling is done by the parent or we can show an alert here if needed, 
            // but usually the parent closes the modal and shows a success message.
        } catch (error) {
            // Error handling is usually done by the parent, but we catch here to stop loading
            console.error('Report submission error in modal:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderTypePicker = () => (
        <Modal
            visible={showTypePicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowTypePicker(false)}
        >
            <TouchableOpacity
                style={styles.pickerOverlay}
                activeOpacity={1}
                onPress={() => setShowTypePicker(false)}
            >
                <View style={[styles.pickerContainer, { backgroundColor: themeColors.card }]}>
                    <Text style={[styles.pickerTitle, { color: themeColors.text }]}>{t('report.selectReason')}</Text>
                    <ScrollView style={{ maxHeight: 300 }}>
                        {Object.values(ReportType).map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.pickerItem,
                                    { borderBottomColor: themeColors.border },
                                    reportType === type && { backgroundColor: themeColors.primary + '20' }
                                ]}
                                onPress={() => {
                                    setReportType(type);
                                    setShowTypePicker(false);
                                }}
                            >
                                <Text style={[
                                    styles.pickerItemText,
                                    { color: themeColors.text },
                                    reportType === type && { color: themeColors.primary, fontWeight: 'bold' }
                                ]}>
                                    {t(`report.types.${type}`)}
                                </Text>
                                {reportType === type && (
                                    <Ionicons name="checkmark" size={20} color={themeColors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity
                        style={[styles.pickerCloseButton, { borderTopColor: themeColors.border }]}
                        onPress={() => setShowTypePicker(false)}
                    >
                        <Text style={{ color: themeColors.primary, fontSize: 16, fontWeight: '600' }}>{t('report.cancel')}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
                    <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
                        <Text style={[styles.title, { color: themeColors.text }]}>
                            {t('report.title', { target: isUserReport ? t('report.user') : t('report.task') })}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={themeColors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.body}>
                        {isUserReport && (
                            <View style={[styles.targetInfo, { backgroundColor: themeColors.background }]}>
                                <Text style={[styles.targetLabel, { color: themeColors.textMuted }]}>{t('report.reportingUser')}</Text>
                                <Text style={[styles.targetValue, { color: themeColors.text }]}>{targetName}</Text>
                            </View>
                        )}

                        <Text style={[styles.label, { color: themeColors.text }]}>
                            {t('report.reasonLabel')} <Text style={{ color: themeColors.error }}>{t('report.reasonRequired')}</Text>
                        </Text>

                        <TouchableOpacity
                            style={[styles.selector, { borderColor: themeColors.border, backgroundColor: themeColors.background }]}
                            onPress={() => setShowTypePicker(true)}
                        >
                            <Text style={{
                                color: reportType ? themeColors.text : themeColors.textMuted,
                                fontSize: 16
                            }}>
                                {reportType ? t(`report.types.${reportType}`) : t('report.selectReason')}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={themeColors.textMuted} />
                        </TouchableOpacity>

                        <Text style={[styles.label, { color: themeColors.text, marginTop: 16 }]}>
                            {t('report.detailsLabel')} <Text style={{ color: themeColors.error }}>{t('report.detailsRequired')}</Text>
                        </Text>
                        <TextInput
                            style={[
                                styles.textArea,
                                {
                                    borderColor: themeColors.border,
                                    backgroundColor: themeColors.background,
                                    color: themeColors.text
                                }
                            ]}
                            placeholder={t('report.detailsPlaceholder')}
                            placeholderTextColor={themeColors.textMuted}
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                            textAlignVertical="top"
                        />
                        <Text style={[styles.charCount, { color: themeColors.textMuted }]}>
                            {t('report.charCount', { count: description.length })}
                        </Text>

                        <View style={styles.infoContainer}>
                            <Ionicons name="information-circle-outline" size={20} color={themeColors.textMuted} />
                            <Text style={[styles.infoText, { color: themeColors.textMuted }]}>
                                {t('report.info')}
                            </Text>
                        </View>
                    </ScrollView>

                    <View style={[styles.footer, { borderTopColor: themeColors.border }]}>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: themeColors.primary },
                                (loading || !reportType || description.length < 10) && { opacity: 0.7 }
                            ]}
                            onPress={handleSubmit}
                            disabled={loading || !reportType || description.length < 10}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>{t('report.submit')}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
            {renderTypePicker()}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    body: {
        padding: 16,
    },
    targetInfo: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    targetLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    targetValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    selector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        height: 50,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        height: 120,
        fontSize: 16,
    },
    charCount: {
        fontSize: 12,
        textAlign: 'right',
        marginTop: 4,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        gap: 8,
    },
    infoText: {
        fontSize: 12,
        flex: 1,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
    submitButton: {
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Picker Styles
    pickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    pickerContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        maxHeight: 400,
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        padding: 16,
        textAlign: 'center',
    },
    pickerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    pickerItemText: {
        fontSize: 16,
    },
    pickerCloseButton: {
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 1,
    },
});
