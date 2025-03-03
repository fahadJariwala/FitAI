import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../context/AuthContext';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import BottomTabs from './BottomTabs';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const {session, loading} = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const seen = await AsyncStorage.getItem('hasSeenOnboarding');
    setHasSeenOnboarding(!!seen);
  };

  if (loading || hasSeenOnboarding === null) {
    // You might want to show a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!hasSeenOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !session ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={BottomTabs} />
        )}
          <Stack.Screen 
        name="UserDetails" 
        component={UserDetailsScreen}
        options={{
          title: 'Complete Your Profile',
          headerShown: false,
        }}
      />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
