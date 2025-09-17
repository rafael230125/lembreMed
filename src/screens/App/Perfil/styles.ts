import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.07,
    paddingTop: height * 0.05,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: height * 0.04,
    textAlign: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  profileCircle: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.1,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.04,
  },
  profileImage: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.1,
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: width * 0.04,
    color: '#777',
  },
  loadingText: {
    fontSize: width * 0.04,
    color: '#777',
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: height * 0.03,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.02,
  },
  optionText: {
    marginLeft: width * 0.03,
    fontSize: width * 0.04,
  },
  logoutOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.02,
    marginBottom: height * 0.12,
  },
  logoutText: {
    marginLeft: width * 0.03,
    fontSize: width * 0.04,
  },
});

export default styles;
