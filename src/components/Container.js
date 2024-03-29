import React, { Component } from 'react'
import { ActivityIndicator, StyleSheet } from 'react-native'

const Container = ({ children, loading }) => {
  if (loading) {
    return <ActivityIndicator style={styles.container} size="large" color="#FFA500" />
  }
  return children
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Container