import { useState } from "react";
import { Alert, ScrollView, TouchableOpacity } from "react-native";
import { ScreenHeader } from "@components/ScreenHeader";
import { Center, VStack, Text, Heading, useToast, Toast } from "@gluestack-ui/themed";
import { UserPhoto } from "@components/UserPhoto";
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { ToastMessage } from "@components/ToastMessage";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@hooks/useAuth";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";

type FormDataProps = {
    name: string;
    email?: string;
    password?: string | null | undefined;
    old_password?: string | null | undefined;
    confirm_password?: string | null | undefined;
}

const profileSchema = yup.object({
    name: yup.string().required('Informe o nome'),
    password: yup
        .string()
        .min(6, 'A senha deve ter pelo menos 6 dígitos')
        .nullable()
        .transform((value) => !!value ? value : null),
    confirm_password: yup
        .string()
        .nullable()
        .transform((value) => !!value ? value : null)
        .oneOf([yup.ref('password'), null], 'A confirmação de senha não confere')
        .when('password', {
            is: (Field: any) => Field,
            then: (schema) => schema
                .nullable()
                .required('Informe a confirmação da senha')
                .transform((value) => !!value ? value : null)
        })
})

export function Profile() {
    const [isUpdating, setUpdating] = useState(false)
    const [userPhoto, setUserPhoto] = useState("https://github.com/RianLopes.png")
    const { user } = useAuth();
    const toast = useToast();
    const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
        defaultValues: {
            name: user.name,
            email: user.email
        },
        resolver: yupResolver(profileSchema)
    })

    async function handleUserPhotoSelect() {
        try {

            const photoSelected = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                aspect: [4, 4],
                allowsEditing: true,
            })

            if (photoSelected.canceled) {
                return
            }

            const photoURI = photoSelected.assets[0].uri

            if (photoURI) {
                const photoInfo = await FileSystem.getInfoAsync(photoURI) as {
                    size: number
                }

                if (photoInfo.size && (photoInfo.size / 1024 / 1024 > 1)) {
                    return toast.show({
                        placement: "top",
                        render: ({ id }) => (
                            <ToastMessage
                                id={id}
                                action="error"
                                title="Essa imagem é muito grande. 
                                        Escolha de até 5MB."
                                onClose={() => toast.close(id)}
                            />)
                    })
                }

                setUserPhoto(photoURI)
            }

        } catch (error) {
            console.log(error)
        }
    }

    async function handleProfileUpdate(data: FormDataProps) {
        try {
            setUpdating(true);

            await api.put('/users', data)
            const title = 'Perfil atualizado com sucesso.'
            toast.show({
                render: () => (
                    <Toast style={{ backgroundColor: 'transparent' }}>
                        <Text
                            backgroundColor="$green500"
                            color="white"
                            padding={10}
                            borderRadius={5}
                            mt={10}
                        >
                            {title}
                        </Text>
                    </Toast>
                ),
                placement: 'top'
            })
        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError? error.message : 'Não foi possivel atualizar os dados. Tente novamente mais tarde'
            toast.show({
                render: () => (
                    <Toast style={{ backgroundColor: 'transparent' }}>
                        <Text
                            backgroundColor="$red500"
                            color="white"
                            padding={10}
                            borderRadius={5}
                        >
                            {title}
                        </Text>
                    </Toast>
                ),
                placement: 'top'
            })
        }finally {
            setUpdating(false);
        }
    }

    return (
        <VStack flex={1}>
            <ScreenHeader title="Perfil" />
            <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
                <Center mt="$6" px="$10">
                    <UserPhoto
                        source={{ uri: userPhoto }}
                        alt="Foto do usuário"
                        size="xl"
                    />
                    <TouchableOpacity onPress={handleUserPhotoSelect}>
                        <Text
                            color="$green500"
                            fontFamily="$heading"
                            fontSize="$md"
                            mt="$2"
                            mb="$8"
                        >
                            Alterar Foto
                        </Text>
                    </TouchableOpacity>
                    <Center w="$full" gap="$4">
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { value, onChange } }) => (
                                <Input
                                    placeholder="Nome"
                                    bg="$gray600"
                                    onChangeText={onChange}
                                    value={value}
                                    errorMessage={errors.name?.message}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { value, onChange } }) => (
                                <Input
                                    placeholder="E-mail"
                                    bg="$gray600"
                                    onChangeText={onChange}
                                    value={value}
                                    isReadOnly
                                />
                            )}
                        />
                    </Center>
                    <Heading
                        alignSelf="flex-start"
                        fontFamily="$heading"
                        color="$gray200"
                        fontSize="$md"
                        mt="$12"
                        mb="$2"
                    >
                        Alterar senha
                    </Heading>
                    <Center w="$full" gap="$4">
                        <Controller
                            control={control}
                            name="old_password"
                            render={({ field: { onChange } }) => (
                                <Input
                                    placeholder="Senha antiga"
                                    bg="$gray600"
                                    secureTextEntry
                                    onChangeText={onChange}
                                    errorMessage={errors.old_password?.message}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange } }) => (
                                <Input
                                    placeholder="Nova Senha"
                                    bg="$gray600"
                                    secureTextEntry
                                    onChangeText={onChange}
                                    errorMessage={errors.password?.message}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="confirm_password"
                            render={({ field: { onChange } }) => (
                                <Input
                                    placeholder="Confirme a nova senha"
                                    bg="$gray600"
                                    secureTextEntry
                                    onChangeText={onChange}
                                    errorMessage={errors.confirm_password?.message}
                                />
                            )}
                        />
                        <Button title="Atualizar" onPress={handleSubmit(handleProfileUpdate)} isLoading={isUpdating}/>
                    </Center>
                </Center>
            </ScrollView>
        </VStack>
    )
}