import {StyleSheet} from 'react-native'

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#fff",
      paddingHorizontal: 30,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: "#333",
      marginBottom: 10,
    },
    title: {
      fontSize: width * 0.05,
      fontWeight: 'bold',
      marginBottom: height * 0.04, 
      textAlign: 'center',
    },
    input: {
      padding: 12,
      marginBottom: 20,
      backgroundColor: "#F8F8F8",
      fontSize: 14,
      borderRadius: 8,
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
    saveButton: {
      backgroundColor: "#5ea872",
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 20,
    },
    saveButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });
  