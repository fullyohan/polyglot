import React, { useEffect, useRef, useState, useCallback } from "react";
import { ScrollView, Switch, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, IconButton, Text } from "react-native-paper";
import { Dropdown } from 'react-native-paper-dropdown';
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import translate from "translate";

translate.engine = "google";

const OPTIONS = [
    { label: 'Anglais', value: 'en-US' },
    { label: 'Français', value: 'fr-FR' },
    { label: 'Portugais', value: 'pt-PT' },
    //MORE ARE COMING !!
];

const App = () => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [recognizing, setRecognizing] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [transcriptionHistory, setTranscriptionHistory] = useState<string[]>([]);
    const [originLanguage, setOriginLanguage] = useState<string | undefined>('en-US');
    const [targetLanguage, setTargetLanguage] = useState<string | undefined>('fr-FR');
    const [isInterim, setIsInterim] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);
    const originLangRef = useRef(originLanguage);
    const targetLangRef = useRef(targetLanguage);
    const isInterimRef = useRef(isInterim);

    useEffect(() => {
        originLangRef.current = originLanguage;
        targetLangRef.current = targetLanguage;
        isInterimRef.current = isInterim;
    }, [originLanguage, targetLanguage, isInterim]);

    const onToggleInterim = useCallback(() => setIsInterim(prev => !prev), []);

    useSpeechRecognitionEvent("start", () => setRecognizing(true));
    useSpeechRecognitionEvent("nomatch", () => setRecognizing(false));
    useSpeechRecognitionEvent("end", () => setRecognizing(false));
    useSpeechRecognitionEvent("error", (event) => {
        console.error("Speech Error:", event.error, event.message);
    });

    useSpeechRecognitionEvent("result", async (event) => {
        const rawText = event.results[0]?.transcript;
        if (!rawText) return;
        const from = originLangRef.current?.split('-')[0];
        const to = targetLangRef.current?.split('-')[0];

        try {
            const trans = await translate(rawText, { from, to });
            setTranscript(trans);

            if (!isInterimRef.current && event.isFinal) {
                setTranscriptionHistory(prev => [...prev, trans]);
            }
        } catch (error) {
            console.log("API Error", error);
        }
    });

    const handleStart = async () => {
        const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!result.granted) return;

        setTranscript("");

        ExpoSpeechRecognitionModule.start({
            lang: originLangRef.current,
            interimResults: isInterimRef.current,
            continuous: true,
            addsPunctuation: true,
        });
    };

    const swapLang = async () => {
        setTargetLanguage(originLanguage)
        setOriginLanguage(targetLanguage)
    }

    const themeBg = isDark ? '#1c1b22' : '#f5f5f5';
    const cardBg = isDark ? 'bg-[#2b2a33]' : 'bg-white';
    const borderColor = isDark ? 'border-zinc-700' : 'border-zinc-300';

    return (
        <SafeAreaView style={{ flex: 1 ,backgroundColor:themeBg}}>
            <View className="p-5 flex-1">
                <View className={`mb-6 p-2 flex flex-row items-center justify-between rounded-2xl ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                    <View className="flex-1">
                        <Dropdown
                            mode="outlined"
                            label="De"
                            options={OPTIONS}
                            value={originLanguage}
                            onSelect={setOriginLanguage}
                            disabled={recognizing}
                        />
                    </View>

                    <View className="px-2">
                        <IconButton
                            mode="contained"
                            icon="swap-horizontal"
                            size={20}
                            containerColor={isDark ? 'zinc' : 'white'}
                            onPress={swapLang}
                        />
                    </View>

                    <View className="flex-1">
                        <Dropdown
                            mode="outlined"
                            label="Vers"
                            options={OPTIONS}
                            value={targetLanguage}
                            onSelect={setTargetLanguage}
                            disabled={recognizing}
                        />
                    </View>
                </View>
                <ScrollView
                    className={`flex-1 border ${borderColor} ${cardBg} rounded-3xl p-4 shadow-sm`}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    ref={scrollViewRef}
                >
                    {isInterim ? (
                        <Text variant="headlineSmall" className={isDark ? "text-zinc-100" : "text-zinc-900"}>
                            {transcript}
                        </Text>
                    ) : (
                        transcriptionHistory.map((item, index) => (
                            <View key={index} className={`mb-4 p-4 rounded-2xl max-w-[90%] shadow-sm ${
                                isDark ? 'bg-purple-600 self-end' : 'bg-white self-start'
                            }`}>
                                <Text variant="bodyLarge" className="text-white font-medium">
                                    {item}
                                </Text>
                                <Text className="text-[10px] opacity-70 mt-1 self-end text-white">
                                    Traduit
                                </Text>
                            </View>
                        ))
                    )}
                    <View className="h-10" />
                </ScrollView>

                <View className="mt-5 flex-row justify-between items-center bg-zinc-500/5 p-4 rounded-full">
                    <View className="flex-row items-center gap-2">
                        <Icon source="flash" size={20} color={isInterim ? "#eab308" : "#71717a"} />
                        <Switch
                            value={isInterim}
                            onValueChange={onToggleInterim}
                            disabled={recognizing}
                        />
                    </View>

                    <View className="flex-row items-center gap-4">
                        <View className="relative">
                            {!recognizing ? (
                                <IconButton
                                    mode="contained"
                                    onPress={handleStart}
                                    icon="microphone"
                                    size={32}
                                    containerColor="#9810fa"
                                    iconColor='#fff'
                                />
                            ) : (
                                <IconButton
                                    mode="contained"
                                    onPress={() => ExpoSpeechRecognitionModule.stop()}
                                    icon="stop"
                                    size={32}
                                    containerColor="#ef4444"
                                />
                            )}
                        </View>
                        <View className={`w-3 h-3 rounded-full ${recognizing ? "bg-green-500" : "bg-zinc-400"}`} />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default App;