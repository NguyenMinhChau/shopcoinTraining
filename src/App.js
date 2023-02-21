/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import React, {useEffect} from 'react';
import {Provider as PaperProvider} from 'react-native-paper';
import {NativeBaseProvider} from 'native-base';
import {ProviderContext} from './app/';
import {Main} from './navigation';
import codePush from 'react-native-code-push';
import {BackHandler, Image, Linking, Text, View} from 'react-native';
import styles from './styles/AppCss';
import {URL_PLAY_STORE} from '@env';
import stylesStatus from './styles/Status';
import stylesGeneral from './styles/General';

const CODE_PUSH_OPTIONS = {
  checkFrequency: codePush.CheckFrequency.ON_APP_START,
  // installMode: codePush.InstallMode.IMMEDIATE,
};

const App = () => {
  const [updateApp, setUpdateApp] = React.useState(false);
  const [versionNew, setVersionNew] = React.useState(null);
  useEffect(() => {
    const init = async () => {
      const update = await codePush.checkForUpdate();
      if (update) {
        codePush.sync({
          updateDialog: true,
          installMode: codePush.InstallMode.IMMEDIATE,
        });
        setVersionNew(update?.appVersion);
        setUpdateApp(true);
      } else {
        codePush.sync({
          updateDialog: false,
          installMode: codePush.InstallMode.IMMEDIATE,
        });
        setUpdateApp(false);
        console.log('The app is up to date.');
      }
    };
    // init();
  }, []);
  const toogleUpdateApp = () => {
    setUpdateApp(!updateApp);
  };
  const openLinkUpdate = () => {
    Linking.openURL(`${URL_PLAY_STORE}`);
  };
  const handleExitApp = () => {
    BackHandler.exitApp();
  };
  return (
    <ProviderContext>
      <NativeBaseProvider>
        <PaperProvider>
          <Main />
        </PaperProvider>
      </NativeBaseProvider>
      {/* {updateApp && versionNew && (
        <View style={[styles.modal_container]}>
          <View style={[styles.modal_content]}>
            <View style={[styles.modal_header]}>
              <Image
                style={[styles.modal_header_img]}
                source={require('./assets/images/logo.png')}
                resizeMode="contain"
              />
              <View style={[styles.modal_header_text]}>
                <Text style={[styles.text]}>Update app</Text>
                <Text style={[styles.version]}>Version: v{versionNew}</Text>
              </View>
            </View>
            <View style={[styles.modal_body]}>
              <Text style={[styles.text_body]}>
                Version v{versionNew} is available. Update is installed and will
                be run on the next app restart. Please update for the best
                experience, Thank you!
              </Text>
            </View>
            <View style={[styles.modal_footer]}>
              <Text
                onPress={toogleUpdateApp}
                style={[
                  styles.text_footer,
                  stylesStatus.cancelbgc,
                  stylesGeneral.mr10,
                ]}>
                Cancel
              </Text>
              <Text
                onPress={handleExitApp}
                style={[styles.text_footer, stylesStatus.confirmbgc]}>
                Exit app
              </Text>
            </View>
          </View>
        </View>
      )} */}
    </ProviderContext>
  );
};

export default codePush(CODE_PUSH_OPTIONS)(App);
