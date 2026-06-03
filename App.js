import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TranslationScreen from './screens/TranslationScreen';
import QuestionScreen from './screens/QuestionScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Translation"
          component={TranslationScreen}
          options={{ title: 'Traduction' }}
        />
        <Tab.Screen
          name="Question"
          component={QuestionScreen}
          options={{ title: 'Trouver Question' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
