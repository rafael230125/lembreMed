import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.07,
    paddingTop: height * 0.05,
    backgroundColor: '#fff',
  },
  message: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
  optionsContainer: {
    marginVertical: height * 0.02,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  optionText: {
    marginLeft: width * 0.03,
    fontSize: width * 0.04,
  },
  buttonContainer: {
    marginBottom: height * 0.03,
  },
  customButton: {
    marginTop: height * 0.04,
    marginBottom: height * 0.1,
    alignSelf: 'center',
    backgroundColor: '#FF6363'
  },
});

export default styles;
