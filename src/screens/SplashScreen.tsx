import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const LOGO_SIZE = width * 0.4; // 40% of screen width

const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/images/icon.png')}
                style={styles.logo}
                resizeMode="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
    },
});

export default SplashScreen; 