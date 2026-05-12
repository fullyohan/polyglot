import "../global.css";

import {router, Stack} from "expo-router";
import {PaperProvider,IconButton,Text,Icon} from "react-native-paper";
import {useColorScheme, View} from "react-native";


const Layout = () => {
    const colorScheme = useColorScheme();
    const LogoTitle = () => (
        <View className ='flex-row gap-1'>
            <Icon source='translate' size={30}/>
            <Text variant="titleLarge">POLYGLOT</Text>
        </View>
    )

    const SettingsTitle = () => (
        <View className ='flex-row gap-1'>
            <Icon source='cog-outline' size={30}/>
            <Text variant="titleLarge">Parametres</Text>
        </View>
    )
    return (
        <PaperProvider>
            <Stack>
                <Stack.Screen name='index' options={{
                    headerTitle: () => <LogoTitle />,
                    headerRight: () => <IconButton icon="cog-outline" size={25} onPress={()=>{ router.push('settings')}}/>,
                    headerStyle: {
                        backgroundColor: colorScheme === 'dark' ? '#353240' : '#E7E0EC'
                    },
                    headerTintColor: '#6750A4',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}/>
                <Stack.Screen name='settings' options={{
                    headerTitle: () => <SettingsTitle />,
                    headerStyle: {
                        backgroundColor: colorScheme === 'dark' ? '#353240' : '#E7E0EC' ,
                    },
                    headerTintColor: '#6750A4',

                }}/>
            </Stack>
        </PaperProvider>
    );
}

export default Layout;
