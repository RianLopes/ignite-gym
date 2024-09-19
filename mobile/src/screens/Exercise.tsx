import { Heading, HStack, Icon, VStack, Text, Image, Box, useToast, Toast } from "@gluestack-ui/themed";
import { ScrollView, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "../../routes/app.routes";
import Bodysvg from "@assets/body.svg"
import SeriesSvg from "@assets/series.svg"
import RepetitionsSvg from "@assets/repetitions.svg"
import { Button } from "@components/Button";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { useEffect, useState } from "react";
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { Loading } from "@components/Loading";

type RouteParamsProps = {
    exerciseId: string;
}
export function Exercise() {

    const navigation = useNavigation<AppNavigatorRoutesProps>()
    const route = useRoute()

    const [sendingRegister, setSendingRegister] = useState(false)
    const { exerciseId } = route.params as RouteParamsProps;
    const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO);
    const [isLoading, setIsLoading] = useState(true)

    const toast = useToast()

    function handleGoBack() {
        navigation.goBack()
    }

    async function fetchExerciseDetails() {
        try {
            setIsLoading(true)
            const response = await api.get(`/exercises/${exerciseId}`)
            setExercise(response.data)
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possivel carregar os detalhes do exercício.'
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

    async function handleExerciseHistoryRegister() {
        try {
            setSendingRegister(true)
            await api.post('/history', { exercise_id: exerciseId });
            toast.show({
                render: () => (
                    <Toast style={{ backgroundColor: 'transparent' }}>
                        <Text
                            color="white"
                            backgroundColor="$green700"
                            padding={10}
                            borderRadius={5}
                        >
                            Exercício registrado com sucesso!
                        </Text>
                    </Toast>
                ),
                placement: 'top',
            });

        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possivel registrar o exercício.'
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
            setSendingRegister(false)
        }
    }

    useEffect(() => {
        fetchExerciseDetails()
    }, [exerciseId]);

    return (
        <VStack flex={1}>
            <VStack px="$8" bg="$gray600" pt="$12">
                <TouchableOpacity onPress={handleGoBack}>
                    <Icon as={ArrowLeft} color="$green500" size="xl" />
                </TouchableOpacity>
                <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    mt="$4"
                    pb="$8">
                    <Heading
                        color="$gray100"
                        fontFamily="$heading"
                        fontSize="$lg"
                        flexShrink={1}
                    >
                        {exercise.name}
                    </Heading>
                    <HStack alignItems="center">
                        <Bodysvg />
                        <Text color="$gray200" ml="$1" textTransform="capitalize">{exercise.group}</Text>
                    </HStack>
                </HStack>
            </VStack>
            {isLoading ? <Loading /> :
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{
                    paddingBottom: 32
                }}>
                    <VStack p="$8">
                        <Box rounded="$lg" mb="$3" overflow="hidden">
                            <Image source={{
                                uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}`
                            }}
                                alt="Exercício"
                                resizeMode="cover"
                                rounded="$lg"
                                w="$full"
                                h="$80"
                            />
                        </Box>
                        <Box bg="$gray600" rounded="$md" pb="$4" px="$4">
                            <HStack alignItems="center" justifyContent="space-around" mb="$6" mt="$5">
                                <HStack>
                                    <SeriesSvg />
                                    <Text color="$gray200" ml="$2">
                                        {exercise.series} séries
                                    </Text>
                                </HStack>
                                <HStack>
                                    <RepetitionsSvg />
                                    <Text color="$gray200" ml="$2">
                                        {exercise.repetitions} repetições
                                    </Text>
                                </HStack>
                            </HStack>
                            <Button title="Marcar como realizado"
                                isLoading={sendingRegister}
                                onPress={handleExerciseHistoryRegister}
                            />
                        </Box>
                    </VStack>
                </ScrollView>
            }
        </VStack>
    )
}