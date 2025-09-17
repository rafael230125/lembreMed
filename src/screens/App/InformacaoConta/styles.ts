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
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: height * 0.07,
  },
  image: {
    width: width * 0.21,
    height: height * 0.1,
    marginBottom: height * 0.02,
    borderRadius: 10,
  },
  title: {
    color: '#000',
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: height * 0.03,
    textAlign: 'center',
  },
  titleSub: {
    fontWeight: 'regular',
    fontSize: width * 0.04,
    alignSelf: 'flex-start',
    marginBottom: height * 0.01,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: height * 0.04,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    fontSize: width * 0.035,
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalButton: {
    width: '100%',
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  modalCancelButton: {
    width: '100%',
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  modalButtonText: {
    fontSize: 16,
  },
});

export default styles;
