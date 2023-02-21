/* eslint-disable prettier/prettier */
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  modal_container: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal_content: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 10,
  },
  modal_header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    padding: 10,
  },
  modal_header_img: {
    width: 50,
    height: 50,
  },
  modal_header_text: {
    marginLeft: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 0.5,
  },
  version: {
    fontSize: 14,
    color: '#000',
    letterSpacing: 0.5,
  },
  modal_body: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  text_body: {
    fontSize: 16,
    color: '#000',
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  modal_footer: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  text_footer: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});

export default styles;
