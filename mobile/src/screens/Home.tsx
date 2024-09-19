import { VStack, Text, HStack, useToast, Toast } from "@gluestack-ui/themed";
import { AppError } from "@utils/AppError";
import { FlatList } from "react-native";
import { HomeHeader } from "@components/HomeHeader";
import { Group } from "@components/Group";
import { useCallback, useEffect, useState } from "react";
import { Heading } from "@gluestack-ui/themed";
import { ExerciseCard } from "@components/ExerciseCard";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "../../routes/app.routes";
import { api } from "@services/api";
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { Loading } from "@components/Loading";

export function Home() {
    const [groups, setGroups] = useState<string[]>([])
    const [exercises, setExercises] = useState<ExerciseDTO[]>([])
    const [groupSelected, setGroupSelected] = useState("antebraço")
    const [isLoading, setIsLoading] = useState(true)

    const navigation = useNavigation<AppNavigatorRoutesProps>();
    const toast = useToast();

    function handleOpenExerciseDetails(exerciseId: string) {
        navigation.navigate("exercise", { exerciseId })
    }

    async function fetchGroups() {
        try {
            const response = await api.get('/groups')
            setGroups(response.data)
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possivel carregar os grupos musculares.'
            toast.show({
                render: () => (
                    <Toast style={{ backgroundColor: 'transparent' }}>
                        <Text
                            color="white"
                            backgroundColor="$red500"
                            padding={10}
                            borderRadius={5}
                        >
                            {title}
                        </Text>
                    </Toast>
                ),
                placement: 'top',
            })
        }
    }

    async function fetchExercisesByGroup() {
        try {
            setIsLoading(true)
            const response = await api.get(`/exercises/bygroup/${groupSelected}`)
            setExercises(response.data)
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possivel carregar os exercícios.'
            toast.show({
                render: () => (
                    <Toast style={{ backgroundColor: 'transparent' }}>
                        <Text
                            color="white"
                            backgroundColor="$red500"
                            padding={10}
                            borderRadius={5}
                        >
                            {title}
                        </Text>
                    </Toast>
                ),
                placement: 'top',
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchGroups()
    }, [])

    useFocusEffect(useCallback(() => {
        fetchExercisesByGroup()
    }, [groupSelected]));

    return (
        <VStack flex={1}>
            <HomeHeader />

            <FlatList
                data={groups}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <Group
                        name={item}
                        isActive={groupSelected.toLowerCase() === item.toLowerCase()}
                        onPress={() => setGroupSelected(item)}
                    />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 32 }}
                style={{ marginVertical: 40, maxHeight: 44, minHeight: 44 }}
            />
            {
                isLoading ? <Loading /> :
                    <VStack px="$8" flex={1}>
                        <HStack justifyContent="space-between" mb="$5" alignItems="center">
                            <Heading color="$gray200" fontSize="$md" fontFamily="$heading">Exercícios</Heading>
                            <Text color="$gray200" fontSize="$sm" fontFamily="$body">{exercises.length}</Text>
                        </HStack>
                        <FlatList
                            data={exercises}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <ExerciseCard
                                    onPress={() => handleOpenExerciseDetails(item.id)}
                                    data={item}
                                />)}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </VStack>
            }
        </VStack>
    )
}