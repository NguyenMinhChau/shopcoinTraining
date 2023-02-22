/* eslint-disable prettier/prettier */
import {View, Text, RefreshControl, Image, Linking} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import styles from './InfoAppCss';
import {ScrollView} from 'native-base';
import DeviceInfo from 'react-native-device-info';
import VersionCheck from 'react-native-version-check';
import stylesGeneral from '../../styles/General';
import stylesStatus from '../../styles/Status';
import {URL_APP_PLAY_STORE, PACKAGE_NAME_APP} from '@env';

const InfoApp = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [versionNew, setVersionNew] = React.useState(null);
  useEffect(() => {
    const init = async () => {
      VersionCheck.needUpdate({
        packageName: PACKAGE_NAME_APP,
      }).then(async res => {
        if (res?.isNeeded) {
          setVersionNew(res?.latestVersion);
        } else {
          setVersionNew(null);
        }
      });
    };
    init();
  }, []);
  const handleRedirectPlayStore = () => {
    Linking.openURL(`${URL_APP_PLAY_STORE}`);
  };
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
  }, []);
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={[styles.container]}>
      <View style={[styles.item_container]}>
        <View style={[styles.image_container]}>
          <Image
            style={[styles.image_item]}
            source={require('../../assets/images/logo.png')}
            resizeMode="contain"
          />
        </View>
        <View style={[styles.info_container]}>
          <Text style={[styles.text_version]}>
            Phiên bản:{' '}
            <Text style={[stylesGeneral.fwbold, stylesStatus.confirm]}>
              v{DeviceInfo.getVersion()}
            </Text>
          </Text>
          {versionNew ? (
            <>
              <Text style={[styles.text_version]}>
                Đã có phiên bản mới:{' '}
                <Text style={[stylesGeneral.fwbold, stylesStatus.complete]}>
                  v{versionNew}
                </Text>
              </Text>
              <Text
                style={[styles.btn_update, stylesStatus.confirmbgcbold]}
                onPress={handleRedirectPlayStore}>
                Cập nhật
              </Text>
            </>
          ) : (
            <Text style={[styles.text_version]}>Đã là phiên bản mới nhất</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default InfoApp;
