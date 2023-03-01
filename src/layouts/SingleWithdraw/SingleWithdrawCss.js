/* eslint-disable prettier/prettier */
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  info_item: {
    justifyContent: 'space-between',
    borderBottomColor: '#ededed',
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  info_item_text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info_item_desc: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
  },
  btn_container: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 30,
  },
  btn: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 15,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  btn_text: {
    fontWeight: 'bold',
    fontSize: 17,
  },
  text_copy: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
export default styles;
