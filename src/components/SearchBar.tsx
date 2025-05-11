import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

interface SearchBarProps extends TextInputProps {
  placeholder: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder, onChangeText, ...rest }) => {
  return (
    <TextInput
      style={styles.searchBar}
      placeholder={placeholder}
      placeholderTextColor="#999"
      onChangeText={onChangeText} 
      {...rest} 
    />
  );
};

const styles = StyleSheet.create({
  searchBar: {
    backgroundColor: '#F5F5F5',
    borderWidth: 0,
    borderRadius: 5,
    height: 54,
    paddingHorizontal: 15,
    marginBottom: 25,
  },
});

export default SearchBar;
