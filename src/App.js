/* eslint-disable prettier/prettier */
import React, {useEffect} from 'react';
import {Provider as PaperProvider} from 'react-native-paper';
import {NativeBaseProvider} from 'native-base';
import {ProviderContext} from './app/';
import {Main} from './navigation';
import VersionCheck from 'react-native-version-check';
import {Image, Linking, Text, View} from 'react-native';
import styles from './styles/AppCss';
import {URL_APP_PLAY_STORE, PACKAGE_NAME_APP} from '@env';
import stylesStatus from './styles/Status';
import stylesGeneral from './styles/General';

const App = () => {
  const [updateApp, setUpdateApp] = React.useState(false);
  const [versionNew, setVersionNew] = React.useState(null);
  useEffect(() => {
    const init = async () => {
      VersionCheck.needUpdate({
        packageName: PACKAGE_NAME_APP,
      }).then(async res => {
        if (res?.isNeeded) {
          setUpdateApp(true);
          setVersionNew(res?.latestVersion);
        } else {
          setUpdateApp(false);
          setVersionNew(null);
        }
      });
    };
    init();
  }, []);
  const toogleUpdateApp = () => {
    setUpdateApp(!updateApp);
  };
  const handleRedirectPlayStore = () => {
    Linking.openURL(`${URL_APP_PLAY_STORE}`);
  };
  return (
    <ProviderContext>
      <NativeBaseProvider>
        <PaperProvider>
          <Main />
        </PaperProvider>
      </NativeBaseProvider>
      {updateApp && versionNew && (
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
                Version v{versionNew} is available. Please update for the best
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
                onPress={handleRedirectPlayStore}
                style={[styles.text_footer, stylesStatus.confirmbgc]}>
                Update app
              </Text>
            </View>
          </View>
        </View>
      )}
    </ProviderContext>
  );
};

export default App;
