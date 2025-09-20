import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.07, 
    paddingTop: height * 0.05, 
    backgroundColor: '#fff',
  },
  optionsContainer: {
    marginBottom: height * 0.03, 
  },
  section: {
    marginBottom: height * 0.03,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.015, 
  },
  optionText: {
    marginLeft: width * 0.03,
    fontSize: width * 0.04,
  },
});

export default styles;
