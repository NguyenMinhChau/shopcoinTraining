/* eslint-disable prettier/prettier */
/* eslint-disable react/self-closing-comp */
import {View, Text, Image} from 'react-native';
import React from 'react';
import {URL_SERVER} from '@env';
import styles from './ImageItemUploadCss';
import stylesGeneral from '../../styles/General';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

export default function ImageItemUpload({
  isStatus,
  selectFile,
  fileResponse,
  userById,
  field,
  textUpload,
  text,
}) {
  return (
    <View style={[styles.image_item]}>
      <View
        style={[styles.buttonUpload]}
        onTouchStart={
          (isStatus && userById?.[field]) || (!userById?.[field] && isStatus)
            ? selectFile
            : () => {}
        }>
        {/* fileResponse?.uri */}
        {!fileResponse && !userById?.[field] ? (
          <>
            {/* <Text style={[styles.typeUpload, stylesGeneral.text_black]}>
              {textUpload}
            </Text>
            <Image
              style={[styles.imageUploadIcons]}
              resizeMethod="resize"
              resizeMode="contain"
              source={require('../../assets/images/upload.png')}
            /> */}
            <View style={[styles.frameContainer]}>
              <View style={[styles.frameCamera]}>
                <View style={[stylesGeneral.flexCenter]}>
                  <FontAwesome5 name="camera" size={30} color="#0589FF" />
                  <Text style={[styles.typeUpload, stylesGeneral.text_black]}>
                    {textUpload}
                  </Text>
                </View>
              </View>
              {/* <View style={[styles.frame1]}></View>
              <View style={[styles.frame2]}></View>
              <View style={[styles.frame3]}></View>
              <View style={[styles.frame4]}></View> */}
              <View style={[styles.frame5]}></View>
            </View>
          </>
        ) : (
          <Image
            source={{
              uri: `${
                fileResponse !== null
                  ? fileResponse
                  : userById?.[field]
                  ? `${URL_SERVER}${userById?.[field]?.replace('uploads/', '')}`
                  : 'http://craftsnippets.com/articles_images/placeholder/placeholder.jpg'
              }`,
            }}
            style={[styles.image]}
            resizeMode="contain"
          />
        )}
      </View>
    </View>
  );
}
