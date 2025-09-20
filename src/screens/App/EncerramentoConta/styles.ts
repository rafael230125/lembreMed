import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successMessage: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: height * 0.02,
  },
  image: {
    width: 305, 
    height: 298, 
    marginBottom: height * 0.02,
    marginTop: 20,
  },
  customButton: {
    marginTop: height * 0.04,
    marginBottom: height * 0.1,
    alignSelf: 'center',
  },
});

export default styles;
