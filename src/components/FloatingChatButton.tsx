import React, { useState } from 'react';
import {
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const Icon = MaterialCommunityIcons as any;
import { ChatBotScreen } from '../screens/ChatBotScreen';
import { useTheme } from '../context/ThemeContext';

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '90%',
    width: '100%',
    paddingTop: 20,
  },
});

export const FloatingChatButton = () => {
  const { theme } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleModal = () => {
    if (!isModalVisible) {
      setIsModalVisible(true);
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: true,
      }).start(() => setIsModalVisible(false));
    }
  };

  const modalTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.primary,
            elevation: 5,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
        ]}
        onPress={toggleModal}>
        <Icon name="assistant" size={28} color={'white'} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        onRequestClose={toggleModal}>
        <TouchableWithoutFeedback onPress={toggleModal}>
          <Animated.View
            style={[
              styles.modalOverlay,
              { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
            ]}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalContent,
                  {
                    backgroundColor: theme.colors.background,
                    transform: [{ translateY: modalTranslateY }],
                    borderTopLeftRadius: theme.borderRadii.l,
                    borderTopRightRadius: theme.borderRadii.l,
                  },
                ]}>
                <ChatBotScreen toggleModal={toggleModal} />
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};
