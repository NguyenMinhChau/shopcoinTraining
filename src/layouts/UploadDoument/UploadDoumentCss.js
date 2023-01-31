/* eslint-disable prettier/prettier */
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  image_container: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    // width: '100%',
  },
  image_container_item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // width: '100%',
  },
  btn: {
    marginTop: 24,
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn_text: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default styles;
