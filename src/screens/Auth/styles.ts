import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: height * 0.1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  logo: {
    width: width * 1,
    height: height * 0.3
  },
  title: {
    color: '#ACBC89',
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#000',
    fontSize: width * 0.04,
    fontWeight: 'bold',
    marginBottom: 28,
    width: '100%',
    textAlign: 'left',
  },
  registerText: {
    marginTop: 20,
    color: '#858585',
    fontSize: width * 0.04,
    textAlign: 'center',
  },
  link: {
    color: '#68BAE8',
    fontWeight: 'bold',
  },
  footerContainer: {
    marginTop: height * 0.15,
  },
  linkSobre: {
    color: '#ACBC89',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nomeText: {
    marginTop: 20,
    color: '#858585',
    fontSize: width * 0.04,
    textAlign: 'center',
  },
  inputWrapper: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#68BAE8',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#68BAE8',
    borderColor: '#68BAE8',
  },
  checkboxText: {
    fontSize: 16,
    color: '#333',
  },
});

export default styles;
