import React, { createContext, useContext, useState } from 'react';
import { CustomAlert } from '../components/CustomAlert';

interface AlertContextType {
    showAlert: (params: {
        title: string;
        message: string;
        buttons?: Array<{
            text: string;
            onPress: () => void;
            style?: 'default' | 'cancel' | 'destructive';
        }>;
        type?: 'success' | 'error' | 'warning' | 'info';
    }) => void;
    hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [alertConfig, setAlertConfig] = useState<any>(null);

    const hideAlert = () => {
        setAlertConfig(null);
    };

    const showAlert = (config: any) => {
        // Wrap each button's onPress with hideAlert
        const wrappedButtons = config.buttons?.map(button => ({
            ...button,
            onPress: () => {
                button.onPress();
                hideAlert();
            }
        })) || [{ text: 'OK', onPress: hideAlert, style: 'default' }];

        setAlertConfig({
            ...config,
            buttons: wrappedButtons
        });
    };

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            {alertConfig && (
                <CustomAlert
                    visible={true}
                    {...alertConfig}
                    onDismiss={hideAlert}
                />
            )}
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
}; 