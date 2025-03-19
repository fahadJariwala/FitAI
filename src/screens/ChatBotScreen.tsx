import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  SafeAreaView,
} from 'react-native';

import {
  getGeminiInstance,
  getOpenAIInstance,
  handleApiError,
} from '../config/openai';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { typography } from '../styles/typeograpghy';

const SendIcon = MaterialCommunityIcons as any;
const CloseIcon = MaterialCommunityIcons as any;
const { width } = Dimensions.get('window');

type Message = {
  id: string;
  content: string;
  isUser: boolean;
};

const TypingIndicator = () => {
  const { theme } = useTheme();
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));

  React.useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => animate(dot, delay));
    };

    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);

    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    };
  }, []);

  return (
    <View
      style={[
        styles.messageContainer,
        styles.typingContainer,
        {
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
      ]}>
      <View style={styles.dotsContainer}>
        {[dot1, dot2, dot3].map((dot, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: theme.colors.text,
                opacity: dot,
                transform: [
                  {
                    translateY: dot.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -4],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const ChatMessage = ({ content, isUser }: { content: string; isUser: boolean }) => {
  const { theme } = useTheme();

  // Clean and format the message content
  const formatMessage = (text: string) => {
    return text
      // Remove multiple spaces
      .replace(/\s+/g, ' ')
      // Remove standalone asterisks or underscores
      .replace(/(?<!\*)\*(?!\*)/g, '')
      .replace(/(?<!_)_(?!_)/g, '')
      // Remove standalone dots that might appear as ellipsis
      .replace(/\s\.\s/g, ' ')
      // Clean up multiple newlines
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Remove any leading/trailing whitespace
      .trim()
      // Handle markdown-style bold/italic (if you want to keep the emphasis, otherwise remove these lines)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1');
  };

  return (
    <TouchableOpacity activeOpacity={1}>
      <View
        style={[
          styles.messageContainer,
          {
            backgroundColor: isUser ? theme.colors.primary : theme.colors.card,
            alignSelf: isUser ? 'flex-end' : 'flex-start',
          },
        ]}>
        <Text
          style={[
            styles.messageText,
            { color: isUser ? 'white' : theme.colors.text },
          ]}>
          {formatMessage(content)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const ChatBotScreen = ({ toggleModal }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content:
        "Hello! I'm your FitAI assistant. Ask me anything about fitness, workouts, or nutrition!",
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputText.trim(),
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const genAI = getGeminiInstance();
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(userMessage.content);
      const response = await result.response;
      let text = response.text();

      // Clean up common AI response artifacts
      text = text
        .replace(/^\s*[*\-•]\s*/gm, '') // Remove leading bullets/asterisks
        .replace(/^Title:\s*/i, '') // Remove "Title:" prefix
        .replace(/^Answer:\s*/i, '') // Remove "Answer:" prefix
        .replace(/^Response:\s*/i, '') // Remove "Response:" prefix
        .trim();

      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: text || "I couldn't process that request.",
        isUser: false,
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Gemini API Error:', error);

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'An error occurred. Please try again.',
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.colors.border,
          },
        ]}>
        <Text style={[styles.headerTitle]}>FitAI Assistant</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => toggleModal()}>
          <CloseIcon name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Chat Content */}
      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item.id + index}
          renderItem={({ item }) => (
            <ChatMessage content={item.content} isUser={item.isUser} />
          )}
          ListFooterComponent={() => (isLoading ? <TypingIndicator /> : null)}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          scrollEventThrottle={16}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          style={styles.flatListStyle}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.card,
                borderTopColor: theme.colors.border,
              },
            ]}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                },
              ]}
              placeholder="Ask about fitness..."
              placeholderTextColor={theme.colors.label}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={sendMessage}
              multiline
              maxHeight={120}
            />
            <TouchableOpacity
              onPress={sendMessage}
              style={[
                styles.sendButton,
                { backgroundColor: theme.colors.primary },
              ]}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={theme.colors.background} />
              ) : (
                <SendIcon
                  name="send"
                  size={20}
                  color={'white'}
                  style={styles.sendIcon}
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    top: -20,
  },
  headerTitle: {
    // fontWeight: '600',
    ...typography.h3,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  chatContainer: {
    flex: 1,
    marginTop: -20,
  },
  flatListStyle: {
    flex: 1,
    width: '100%',
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: width * 0.75,
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  messageText: {
    ...typography.bodyMedium,
    lineHeight: 20,
    letterSpacing: 0.15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    ...typography.label,
    opacity: 0.7,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    marginLeft: 2,
  },
  typingContainer: {
    maxWidth: 100,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
});
