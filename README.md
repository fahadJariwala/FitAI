# FitAI - Your AI-Powered Fitness Coach

FitAI is a React Native mobile application that serves as your personal AI fitness coach. It provides customized workout plans based on your age, weight, fitness level, and goals.

## Features

- Personalized workout plans
- Progress tracking
- Exercise library with detailed instructions
- Dark/Light theme support
- User profile management
- Workout statistics and analytics

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or later)
- npm or yarn
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/fitai.git
cd fitai
```

2. Install dependencies:

```bash
yarn install
# or
npm install
```

3. Install iOS dependencies:

```bash
cd ios
pod install
cd ..
```

## Running the App

### iOS

```bash
yarn ios
# or
npm run ios
```

### Android

```bash
yarn android
# or
npm run android
```

## Project Structure

```
src/
├── components/     # Reusable components
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── theme/          # Theme configuration
├── context/        # React Context providers
├── hooks/          # Custom hooks
├── services/       # API services
├── utils/          # Utility functions
└── assets/         # Images, icons, etc.
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React Native
- React Navigation
- React Native Vector Icons
- React Native Chart Kit
- And all other open-source libraries used in this project
