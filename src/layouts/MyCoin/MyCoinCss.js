/* eslint-disable prettier/prettier */
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  listCoin: {
    // flex: 1,
    marginBottom: 130,
  },
  coinItem: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginVertical: 8,
    width: '100%',
    height: 70,
    backgroundColor: 'white',
    borderRadius: 8,
    borderColor: '#d50000',
    borderWidth: 1,
  },
  coinItem_Info_name: {
    fontSize: 16,
    fontWeight: '600',
  },
  coinItem_Info_quantity: {
    color: 'red',
    fontWeight: '600',
  },
  coinItem_Price_text: {
    fontWeight: '500',
    fontSize: 14,
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 5,
    fontWeight: 'bold',
    fontSize: 18,
  },
  text_desc: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
});

export default styles;
