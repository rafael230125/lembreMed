import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1,
    backgroundColor: '#fff', 
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
    marginTop: height * 0.07,
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: height * 0.04,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  colorPalette: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderColor: "#c7c7c7",
  },
  timePicker: {
    padding: 15,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 20,
  },
  timeText: {
    fontSize: 14,
    color: "#555",
  },
  pickerContainer: {
    backgroundColor: "#F8F8F8",
    borderRadius: 5,
    marginBottom: 20,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#555",
  },
  iaButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  deleteButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    backgroundColor: '#FF6363',
  },
  imagePicker: {
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imagePlaceholderText: {
    color: '#888',
    fontSize: 16,
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
  input: {
    padding: 12,
    backgroundColor: "#F8F8F8",
    borderRadius: 5,
    marginBottom: 20,
  },
  info: {
    padding: 12,
    backgroundColor: "#F8F8F8",
    borderRadius: 5,
    marginBottom: 20,
  },
  freqBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: "#F8F8F8",
  },
  freqBtnSelected: {
    backgroundColor: "#68BAE8",
    borderColor: "#68BAE8",
  },
  dayBtn: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#ddd",
    minWidth: 40,
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  dayBtnSelected: {
    backgroundColor: "#68BAE8",
  },
});

export default styles;
