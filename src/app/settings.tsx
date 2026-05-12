import React, { useEffect, useState } from "react";
import {Linking, ScrollView, Switch, useColorScheme} from "react-native";
import { List } from 'react-native-paper';
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";

const Settings = () => {
    const colorScheme = useColorScheme();
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        checkPermissions();
    }, []);

    const checkPermissions = async () => {
        const status = await ExpoSpeechRecognitionModule.getMicrophonePermissionsAsync();
        setHasPermission(status.granted);
    };

    const onTogglePermission = async () => {
        if (!hasPermission) {
            const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            setHasPermission(result.granted);
        } else {
            await Linking.openSettings()
;        }
    };

    const isDark = colorScheme === 'dark';

    return (
        <ScrollView className={`flex-1 ${isDark ? 'bg-[#1c1b22]' : 'bg-[#f5f5f5]'}`}>
            <List.Section>
                <List.Subheader style={{ color: isDark ? '#a855f7' : '#6b7280' }}>Configuration</List.Subheader>

                <List.Item
                    title="Accès au microphone"
                    titleStyle={{ color: isDark ? '#fff' : '#000' }}
                    description={hasPermission ? "Autorisé" : "Non autorisé"}
                    descriptionStyle={{ color: hasPermission ? '#22c55e' : '#ef4444' }}
                    left={(props) => <List.Icon {...props} icon="microphone" color={hasPermission ? '#a855f7' : '#71717a'} />}
                    right={() => (
                        <Switch
                            value={hasPermission}
                            onValueChange={onTogglePermission}
                        />
                    )}
                />

                <List.Item
                    title="Polyglot Beta v1.0"
                    description="By fullyohan"
                    titleStyle={{ color: isDark ? '#fff' : '#000' }}
                    left={(props) => <List.Icon {...props} icon="information-outline" />}
                    onPress={() => Linking.openURL('https://github.com/fullyohan/fullyohan')}
                />
            </List.Section>
        </ScrollView>
    );
};

export default Settings;