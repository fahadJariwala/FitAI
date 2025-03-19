import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { typography } from '../styles/typeograpghy';

const { width } = Dimensions.get('window');

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    buttons?: Array<{
        text: string;
        onPress: () => void;
        style?: 'default' | 'cancel' | 'destructive';
    }>;
    type?: 'success' | 'error' | 'warning' | 'info';
    onDismiss?: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
    visible,
    title,
    message,
    buttons = [{ text: 'OK', onPress: () => { }, style: 'default' }],
    type = 'info',
    onDismiss,
}) => {
    const { theme } = useTheme();

    const getIconName = () => {
        switch (type) {
            case 'success':
                return 'check-circle';
            case 'error':
                return 'alert-circle';
            case 'warning':
                return 'alert';
            default:
                return 'information';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success':
                return theme.colors.success;
            case 'error':
                return theme.colors.error;
            case 'warning':
                return theme.colors.warning;
            default:
                return theme.colors.info;
        }
    };

    const styles = StyleSheet.create({
        modalBackground: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        alertContainer: {
            width: width * 0.85,
            backgroundColor: theme.colors.card,
            borderRadius: 14,
            paddingTop: 20,
            paddingHorizontal: 20,
            paddingBottom: 16,
            ...Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                },
                android: {
                    elevation: 5,
                },
            }),
        },
        iconContainer: {
            alignItems: 'center',
            marginBottom: 16,
        },
        title: {
            // fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text,
            textAlign: 'center',
            marginBottom: 8,
            ...typography.h3
        },
        message: {
            // fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: 20,
            // lineHeight: 20,
            ...typography.bodyMedium
        },
        buttonContainer: {
            flexDirection: buttons.length > 2 ? 'column' : 'row',
            justifyContent: 'center',
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            marginTop: 8,
        },
        button: {
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonText: {
            fontSize: 16,
            fontWeight: '600',
            ...typography.button

        },
        buttonSeparator: {
            width: 1,
            backgroundColor: theme.colors.border,
        },
        defaultButtonText: {
            color: theme.colors.textSecondary,
            ...typography.button

        },
        cancelButtonText: {
            color: theme.colors.textSecondary,
            ...typography.button

        },
        destructiveButtonText: {
            color: theme.colors.error,
            ...typography.button

        },
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onDismiss}
        >
            <TouchableOpacity
                style={styles.modalBackground}
                activeOpacity={1}
                onPress={onDismiss}
            >
                <View style={styles.alertContainer}>
                    <View style={styles.iconContainer}>
                        <Icon name={getIconName()} size={48} color={getIconColor()} />
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.buttonContainer}>
                        {buttons.map((button, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && buttons.length <= 2 && (
                                    <View style={styles.buttonSeparator} />
                                )}
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={button.onPress}
                                >
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            button.style === 'cancel' && styles.cancelButtonText,
                                            button.style === 'destructive' && styles.destructiveButtonText,
                                            button.style === 'default' && styles.defaultButtonText,
                                        ]}
                                    >
                                        {button.text}
                                    </Text>
                                </TouchableOpacity>
                            </React.Fragment>
                        ))}
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

// Helper function to show alerts easily
export const showAlert = (
    title: string,
    message: string,
    buttons?: CustomAlertProps['buttons'],
    type?: CustomAlertProps['type']
) => {
    // You'll need to implement a global alert state management system
    // This could be done with a global state management solution like Redux
    // or a simple React Context
    // For now, we'll assume you have a global alert state manager
    globalAlertManager.show({
        title,
        message,
        buttons,
        type,
    });
}; 