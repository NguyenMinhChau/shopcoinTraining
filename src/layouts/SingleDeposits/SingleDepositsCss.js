/* eslint-disable prettier/prettier */
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  item: {
    justifyContent: 'space-between',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 15,
  },
  item_title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  item_desc: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
  },
  btn: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    borderRadius: 8,
  },
  btn_text: {
    fontSize: 17,
  },
  image: {
    width: '60%',
    height: 150,
    borderRadius: 6,
    marginBottom: 12,
  },
  text_copy: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default styles;
