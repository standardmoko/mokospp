# Home Harmony – AI Home Office Stylist 🏠✨

Home Harmony is an AI-powered mobile app that helps users design their perfect home workspace. Using OpenAI's Vision API, the app analyzes uploaded room photos and provides intelligent design recommendations, ergonomic furniture suggestions, and personalized color palettes.

This is an [Expo](https://expo.dev) project built with Expo SDK 54 and React Native.

## Features

- 📸 **AI Workspace Analysis** - Upload photos and get intelligent design recommendations
- 🎨 **Color Palette Extraction** - Discover harmonious color schemes from your space
- 🪑 **Ergonomic Fit Checker** - Get comfort metrics with traffic-light indicators
- ❤️ **Favorites System** - Save and compare your favorite design ideas
- 🌙 **Dark/Light Mode** - Seamless theme switching
- 📱 **Cross-Platform** - Works on iOS, Android, and Web

## Tech Stack

- **Framework**: Expo SDK 54
- **Language**: TypeScript
- **Navigation**: Expo Router with bottom tabs
- **Styling**: React Native with custom design system
- **AI**: OpenAI GPT-4o Vision API (via secure proxy)
- **Storage**: Local AsyncStorage (privacy-first)

## Required Libraries

- `expo-image-picker` - Photo capture and gallery access
- `expo-file-system` - Local file management
- `react-native-modal` - Modal components
- `react-native-svg` - SVG graphics and charts

## Get Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment variables

   Create a `.env` file in the root directory:
   ```bash
   # Access token for the secure API proxy
   EXPO_PUBLIC_WARDROPE_SECURE_TOKEN=your_secure_access_token_here
   ```

   **Important**: The app now uses a secure proxy to protect the OpenAI API key. Make sure your `WARDROPE_SECURE_TOKEN` matches the one configured in your Vercel deployment at `https://v0-ai-home-office-stylist.vercel.app/api/wardroubekey`.

3. Start the development server

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Development

### Project Structure

```
├── app/                    # App screens (Expo Router)
├── components/            # Reusable UI components
├── constants/            # Design system & global styles
├── hooks/               # Custom React hooks
├── docs/               # Project documentation
└── assets/            # Images and static assets
```

### Design System

The app uses a comprehensive design system located in `constants/globalStyles.ts`:
- **Colors**: Brand colors, text colors, status indicators
- **Typography**: Poppins font family with consistent sizing
- **Spacing**: Standardized spacing scale (xs, sm, md, lg, xl, xxl)
- **Components**: Pre-styled buttons, cards, forms, and modals

### Scripts

```bash
npm run start          # Start Expo development server
npm run android        # Start on Android emulator
npm run ios           # Start on iOS simulator
npm run web           # Start web version
npm run lint          # Run ESLint
```

### Phase 1 Status ✅

**Completed:**
- ✅ Expo SDK 54 project structure
- ✅ Required dependencies installed
- ✅ Global styles and design system
- ✅ TypeScript and linting configuration
- ✅ Development environment setup

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
