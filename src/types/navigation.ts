import { NavigationProp } from '@react-navigation/native';

export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    MainApp: undefined;
};

export type AppNavigationProp = NavigationProp<RootStackParamList>;

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
} 