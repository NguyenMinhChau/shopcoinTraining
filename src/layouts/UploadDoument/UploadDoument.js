/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import ImageCropPicker from 'react-native-image-crop-picker';
import {useAppContext} from '../../utils';
import requestRefreshToken from '../../utils/axios/refreshToken';
import {setCurrentUser} from '../../app/payloads/user';
import {getUserById} from '../../app/payloads/getById';
import {setMessage} from '../../app/payloads/message';
import {ImageItemUpload, ModalLoading} from '../../components';
import styles from './UploadDoumentCss';
import stylesGeneral from '../../styles/General';
import stylesStatus from '../../styles/Status';
import {SVgetUserById, SVuploadDocument} from '../../services/user';
import {routersMain} from '../../routers/Main';
import {useToast} from 'native-base';

export default function UploadDoument({navigation}) {
  const toast = useToast();
  const {state, dispatch} = useAppContext();
  const {currentUser, userById} = state;
  const [refreshing, setRefreshing] = useState(false);
  const [isStatus, setIsStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileResponseFrontCCCD, setFileResponseFrontCCCD] = useState(null);
  const [fileResponseBackCCCD, setFileResponseBackCCCD] = useState(null);
  const [fileResponseFrontLicense, setFileResponseFrontLicense] =
    useState(null);
  const [fileResponseBackLicense, setFileResponseBackLicense] = useState(null);
  const [dataImageForm, setDataImageForm] = useState([]);
  const [isProcess, setIsProcess] = useState(false);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    SVgetUserById({
      id: currentUser?.id,
      dispatch,
      toast,
    });
    wait(2000).then(() => setRefreshing(false));
  }, []);
  useEffect(() => {
    SVgetUserById({
      id: currentUser?.id,
      dispatch,
      toast,
    });
  }, []);
  const handleDocumentSelectionFrontCCCD = async () => {
    await ImageCropPicker.openPicker({
      width: 500,
      height: 400,
      cropping: true,
      compressImageQuality: 1,
      includeBase64: true,
    }).then(image => {
      const object = {
        image: image?.data || image?.image,
        fileName: image.modificationDate
          ? image.modificationDate + '.' + image.mime.split('/')[1]
          : image.filename || image.fileName,
      };
      setFileResponseFrontCCCD(
        `data:${image?.mime};base64,${image?.data || image?.image}`,
      );
      setDataImageForm([...dataImageForm, object]);
    });
  };
  const handleDocumentSelectionBackCCCD = async () => {
    await ImageCropPicker.openPicker({
      width: 500,
      height: 400,
      cropping: true,
      compressImageQuality: 1,
      includeBase64: true,
    }).then(image => {
      const object = {
        image: image?.data || image?.image,
        fileName: image.modificationDate
          ? image.modificationDate + '.' + image.mime.split('/')[1]
          : image.filename || image.fileName,
      };
      // const formData = new FormData();
      // formData.append('cccdBeside', object);
      setFileResponseBackCCCD(
        `data:${image?.mime};base64,${image?.data || image?.image}`,
      );
      setDataImageForm([...dataImageForm, object]);
    });
  };
  const handleDocumentSelectionFrontLicense = async () => {
    await ImageCropPicker.openPicker({
      width: 500,
      height: 400,
      cropping: true,
      compressImageQuality: 1,
      includeBase64: true,
    }).then(image => {
      const object = {
        image: image?.data || image?.image,
        fileName: image.modificationDate
          ? image.modificationDate + '.' + image.mime.split('/')[1]
          : image.filename || image.fileName,
      };
      setFileResponseFrontLicense(
        `data:${image?.mime};base64,${image?.data || image?.image}`,
      );
      setDataImageForm([...dataImageForm, object]);
    });
  };
  const handleDocumentSelectionBackLicense = async () => {
    await ImageCropPicker.openPicker({
      width: 500,
      height: 400,
      cropping: true,
      compressImageQuality: 1,
      includeBase64: true,
    }).then(image => {
      const object = {
        image: image?.data || image?.image,
        fileName: image.modificationDate
          ? image.modificationDate + '.' + image.mime.split('/')[1]
          : image.filename || image.fileName,
      };
      setFileResponseBackLicense(
        `data:${image?.mime};base64,${image?.data || image?.image}`,
      );
      setDataImageForm([...dataImageForm, object]);
    });
  };
  const handleChangeStatus = () => {
    setIsStatus(true);
  };
  const uploadImageAPI = (data, id) => {
    SVuploadDocument({
      id: currentUser?.id,
      imageForm: dataImageForm,
      token: data?.token,
      setLoading,
      navigation,
      setIsProcess,
      toast,
    });
  };
  const handleSubmit = async id => {
    try {
      await 1;
      setIsProcess(true);
      await requestRefreshToken(
        currentUser,
        uploadImageAPI,
        state,
        dispatch,
        setCurrentUser,
        toast,
        navigation,
        id,
      );
      if (isProcess) {
        setLoading(false);
        setIsProcess(false);
        setIsStatus(false);
        Alert.alert('Error', 'Time out, please try again', [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate(routersMain.UploadDoument);
            },
          },
        ]);
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <ScrollView
      style={[styles.container]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={[styles.content]}>
        <View style={[styles.image_container]}>
          <Text
            style={[
              stylesGeneral.fz16,
              stylesGeneral.fwbold,
              stylesGeneral.text_black,
            ]}>
            1. Citizen Identification
          </Text>
          <View style={[styles.image_container_item]}>
            <ImageItemUpload
              isStatus={isStatus}
              selectFile={handleDocumentSelectionFrontCCCD}
              textUpload="Font citizen identification"
              text="Font CCCD image"
              fileResponse={fileResponseFrontCCCD}
              userById={userById}
              field="uploadCCCDFont"
            />
            <ImageItemUpload
              isStatus={isStatus}
              selectFile={handleDocumentSelectionBackCCCD}
              textUpload="Back citizen identification"
              text="Back CCCD image"
              fileResponse={fileResponseBackCCCD}
              userById={userById}
              field="uploadCCCDBeside"
            />
          </View>
          <Text
            style={[
              stylesGeneral.fz16,
              stylesGeneral.fwbold,
              stylesGeneral.text_black,
            ]}>
            2. License
          </Text>
          <View style={[styles.image_container_item]}>
            <ImageItemUpload
              isStatus={isStatus}
              selectFile={handleDocumentSelectionFrontLicense}
              textUpload="Font license"
              text="Font license image"
              fileResponse={fileResponseFrontLicense}
              userById={userById}
              field="uploadLicenseFont"
            />
            <ImageItemUpload
              isStatus={isStatus}
              selectFile={handleDocumentSelectionBackLicense}
              textUpload="Back license"
              text="Back license image"
              fileResponse={fileResponseBackLicense}
              userById={userById}
              field="uploadLicenseBeside"
            />
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.6}
          disabled={isProcess}
          style={[
            styles.btn,
            stylesStatus.confirmbgcbold,
            isProcess && stylesGeneral.op6,
          ]}
          onPress={
            !isStatus ? handleChangeStatus : () => handleSubmit(currentUser?.id)
          }>
          <Text
            style={[styles.btn_text, stylesStatus.white, stylesGeneral.fz16]}>
            {!isStatus ? (
              userById?.uploadCCCDFont ||
              userById?.uploadCCCDBeside ||
              userById?.uploadLicenseFont ||
              userById?.uploadLicenseBeside ? (
                'Change document'
              ) : (
                'Start upload'
              )
            ) : isProcess ? (
              <ActivityIndicator color="white" />
            ) : (
              'Submit'
            )}
          </Text>
        </TouchableOpacity>
      </View>
      {loading && <ModalLoading />}
    </ScrollView>
  );
}
