/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import React, {useCallback, useState, useEffect} from 'react';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// import {launchImageLibrary} from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import {useAppContext} from '../../utils';
import {setCurrentUser} from '../../app/payloads/user';
import {getAllDeposits} from '../../app/payloads/getAll';
import {setMessage} from '../../app/payloads/message';
import {formatVND, formatUSDT} from '../../utils/format/Money';
import requestRefreshToken from '../../utils/axios/refreshToken';
import {dateFormat} from '../../utils/format/Date';
import {ModalLoading, RowDetail} from '../../components';
import styles from './SingleDepositsCss';
import stylesGeneral from '../../styles/General';
import stylesStatus from '../../styles/Status';
import {SVgetDepositsById, SVupdateDeposits} from '../../services/deposits';
import {textLower} from '../../utils/format/textLowercase';
import {useToast} from 'native-base';
import {URL_SERVER} from '@env';

export default function SingleDeposits({navigation, route}) {
  const toast = useToast();
  const {state, dispatch} = useAppContext();
  const {currentUser} = state;
  const {data, bankAdmin} = route.params;
  const [fileResponse, setFileResponse] = useState(null);
  const [dataImageForm, setDataImageForm] = useState(null);
  const [DPbyId, setDPbyID] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isProcess, setIsProcess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
  }, []);
  const handleDocumentSelection = async () => {
    await ImagePicker.openPicker({
      width: 300,
      height: 400,
      // cropping: true,
      compressImageQuality: 0.7,
      includeBase64: true,
    }).then(image => {
      const object = {
        image: image.data,
        fileName: image.modificationDate + '.' + image.mime.split('/')[1],
      };
      setFileResponse(`data:${image.mime};base64,${image.data}`);
      setDataImageForm(object);
    });
  };
  const submitSingleDepositsAPI = (dataAPI, id) => {
    SVupdateDeposits({
      email_user: currentUser?.email,
      id: data?._id,
      token: dataAPI?.token,
      image: dataImageForm,
      dispatch,
      getAllDeposits,
      setLoading,
      navigation,
      setIsProcess,
      toast,
    });
  };
  useEffect(() => {
    SVgetDepositsById({
      id_dp: data?._id,
      setDPbyID,
      toast,
    });
  }, [data?._id]);
  const handleSubmit = async id => {
    setIsProcess(true);
    requestRefreshToken(
      currentUser,
      submitSingleDepositsAPI,
      state,
      dispatch,
      setCurrentUser,
      toast,
      navigation,
    );
  };
  const copyToClipboard = value => {
    Clipboard.setString(value);
    toast.show({
      title: 'Copied to clipboard success!',
      status: 'success',
      duration: 3000,
    });
  };
  console.log(DPbyId);
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={[styles.container]}>
        <Text style={[styles.title, stylesGeneral.text_black]}>
          Deposits Detail
        </Text>
        <RowDetail
          title="Code"
          text={DPbyId?.code || data?.code || DPbyId?._id || data?._id}
        />
        <RowDetail
          title="Status"
          text={(DPbyId?.status || data?.status)?.toLowerCase()}
          styleDesc={[
            stylesStatus.status,
            textLower(DPbyId?.status || data?.status) === 'on hold' ||
            textLower(DPbyId?.status || data?.status) === 'onhold'
              ? stylesStatus.vipbgc
              : textLower(DPbyId?.status || data?.status) === 'confirm' ||
                textLower(DPbyId?.status || data?.status) === 'confirmed'
              ? stylesStatus.confirmbgc
              : textLower(DPbyId?.status || data?.status) === 'complete' ||
                textLower(DPbyId?.status || data?.status) === 'completed'
              ? stylesStatus.completebgc
              : textLower(DPbyId?.status || data?.status) === 'cancel' ||
                textLower(DPbyId?.status || data?.status) === 'canceled'
              ? stylesStatus.cancelbgc
              : stylesStatus.demobgc,
          ]}
        />
        <RowDetail
          title="Created At"
          text={dateFormat(DPbyId?.createdAt || data?.createdAt, 'DD/MM/YYYY')}
        />
        <RowDetail
          title="Updated At"
          text={dateFormat(DPbyId?.updatedAt || data?.updatedAt, 'DD/MM/YYYY')}
        />
        <RowDetail
          title="Amount USD"
          text={formatUSDT(DPbyId?.amount || data?.amount)}
        />
        <RowDetail
          title="Amount VND"
          text={formatVND(DPbyId?.amount_vnd || data?.amount_vnd)}
        />
        <View style={[styles.item, stylesGeneral.flexRow]}>
          <Text style={[styles.item_title, stylesGeneral.text_black]}>
            Method
          </Text>
          <View style={[stylesGeneral.flexColumn, stylesGeneral.flexEnd]}>
            <Text style={[styles.item_desc, stylesGeneral.text_black]}>
              {DPbyId?.method?.method_name ||
                bankAdmin?.name ||
                'Not name bank'}
            </Text>
            <Text style={[styles.item_desc, stylesGeneral.text_black]}>
              {DPbyId?.method?.account_name || bankAdmin?.account_name}
            </Text>
            <Text style={[styles.item_desc, stylesGeneral.text_black]}>
              {DPbyId?.method?.number ||
                bankAdmin?.number ||
                'Not number account'}
              {' | '}
              <Text
                style={[styles.text_copy, stylesStatus.confirm]}
                onPress={() =>
                  copyToClipboard(DPbyId?.method?.number || bankAdmin?.number)
                }>
                Copy
              </Text>
            </Text>
          </View>
        </View>
        <View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleDocumentSelection}>
            <View style={[styles.btn, stylesStatus.vipbgcbold]}>
              <FontAwesome5
                name="file-image"
                size={25}
                style={[stylesStatus.white]}
              />
              <Text
                style={[
                  styles.btn_text,
                  stylesStatus.white,
                  stylesGeneral.fwbold,
                  stylesGeneral.ml8,
                ]}>
                Pick an image from camera roll
              </Text>
            </View>
          </TouchableOpacity>
          {(fileResponse !== null || DPbyId?.statement || data?.statement) && (
            <View style={[stylesGeneral.flexCenter]}>
              <Image
                source={{
                  uri: fileResponse
                    ? `${fileResponse}`
                    : `${URL_SERVER}${DPbyId?.statement || data?.statement}`,
                }}
                style={[styles.image, stylesGeneral.mt10]}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => handleSubmit(data?._id)}
          activeOpacity={0.6}
          disabled={!fileResponse || isProcess}
          style={[
            styles.btn,
            ((!fileResponse && (!DPbyId?.statement || !data?.statement)) ||
              isProcess) &&
              stylesGeneral.op6,
            stylesStatus.confirmbgcbold,
            stylesGeneral.mt10,
          ]}>
          <Text
            style={[styles.btn_text, stylesStatus.white, stylesGeneral.fwbold]}>
            {isProcess ? <ActivityIndicator color="white" /> : 'Submit'}
          </Text>
        </TouchableOpacity>
        {loading && <ModalLoading />}
      </View>
    </ScrollView>
  );
}
