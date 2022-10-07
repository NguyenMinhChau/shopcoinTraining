/* eslint-disable prettier/prettier */
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  dflex: {
    display: 'flex',
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  listCoin: {
    marginBottom: 145,
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
    borderColor: '#4CAF50',
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
    flexDirection: 'row',
    fontWeight: '500',
    fontSize: 14,
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 5,
    fontWeight: 'bold',
  },
});

export default styles;