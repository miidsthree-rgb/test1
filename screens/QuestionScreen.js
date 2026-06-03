import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function QuestionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trouver la Question</Text>
      <Text style={styles.description}>
        Fonctionnalité à venir : Entrez une réponse en anglais et l'application vous donnera la bonne question correspondante !
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
