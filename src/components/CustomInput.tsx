import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';

interface CustomInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  placeholderTextColor: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export default function CustomInput({
  value,
  onChangeText,
  placeholder,
  placeholderTextColor,
  secureTextEntry = false,
  keyboardType = 'default',
}: CustomInputProps) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 23,
    width: '100%',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#F8F8F8',
    height: 50,
    width: '100%',
    fontWeight: 'light',
    borderWidth: 0,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
});
