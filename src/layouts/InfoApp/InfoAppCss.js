/* eslint-disable prettier/prettier */
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  item_container: {
    padding: 20,
    width: '100%',
    minHeight: 50,
    borderRadius: 15,
    backgroundColor: 'white',
    marginBottom: 18,
    justifyContent: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  image_container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 70,
    borderRadius: 20,
  },
  image_item: {
    width: 70,
    height: 70,
  },
  info_container: {
    marginTop: 15,
  },
  text_version: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  btn_update: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    fontWeight: 'bold',
  },
});

export default styles;
