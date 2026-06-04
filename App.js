import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import TranslationScreen from './screens/TranslationScreen';
import QuestionScreen from './screens/QuestionScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import ShopScreen from './screens/ShopScreen';
import { theme } from './theme';
import { Text, TextInput, StyleSheet } from 'react-native';

// Force global retro monospace font family
const customFont = theme.fonts.retro;
if (Text.render) {
  const originalRender = Text.render;
  Text.render = function (props, ref) {
    const origin = originalRender.call(this, props, ref);
    return React.cloneElement(origin, {
      style: StyleSheet.compose({ fontFamily: customFont }, props.style)
    });
  };
}
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = { fontFamily: customFont };

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.style = { fontFamily: customFont };

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Translation') {
              iconName = 'language';
            } else if (route.name === 'Question') {
              iconName = 'help-circle';
            } else if (route.name === 'Leaderboard') {
              iconName = 'trophy';
            } else if (route.name === 'Shop') {
              iconName = 'cart';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarStyle: {
            backgroundColor: theme.colors.cardBg,
            borderTopColor: theme.colors.primary,
            borderTopWidth: 2.5,
            height: 65,
            paddingBottom: 10,
            paddingTop: 10,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 8,
          },
          headerStyle: {
            backgroundColor: theme.colors.cardBg,
            shadowColor: 'transparent',
            elevation: 0,
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.primary,
          },
          headerTitleStyle: {
            color: theme.colors.text,
            fontWeight: '900',
            fontSize: 18,
            fontFamily: theme.fonts.retro,
            letterSpacing: 2,
          },
          headerTitleAlign: 'center',
          sceneStyle: {
            backgroundColor: theme.colors.background,
          },
        })}
      >
        <Tab.Screen
          name="Translation"
          component={TranslationScreen}
          options={{ title: 'Traduction' }}
        />
        <Tab.Screen
          name="Question"
          component={QuestionScreen}
          options={{ title: 'Trouver la Question' }}
        />
        <Tab.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
          options={{ title: 'Classement' }}
        />
        <Tab.Screen
          name="Shop"
          component={ShopScreen}
          options={{ title: 'Boutique' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

