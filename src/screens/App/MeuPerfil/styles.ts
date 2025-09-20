import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.1,
    paddingTop: height * 0.05,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  profilePhoto: {
    width: width * 0.17,
    height: width * 0.17,
    borderRadius: width * 0.125,
    borderWidth: 3,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#313131',
    borderRadius: 50,
    padding: 5,
  },
  formContainer: {
    width: '100%',
    marginBottom: 0,
  },
  label: {
    fontSize: width * 0.04,
    fontWeight: 'regular',
    marginBottom: 5,
    color: '#333',
  },
  customButton: {
    marginTop: height * 0.05,
    marginBottom: height * 0.1,
    alignSelf: 'center',
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
