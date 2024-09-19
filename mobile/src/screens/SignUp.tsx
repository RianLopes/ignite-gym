import { useState } from 'react';
import { VStack, Image, Center, Text, Heading, ScrollView, useToast, Toast } from '@gluestack-ui/themed';
import BackgroundImg from "@assets/background.png"
import Logo from "@assets/logo.svg"
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { useNavigation } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { useAuth } from '@hooks/useAuth';

export type FormDataProps = {
    name: string;
    email: string;
    password: string;
    password_confirm: string;
}

const signUpSchema = yup.object({
    name: yup.string().required('Informe o nome.'),
    email: yup.string().required('Informe o e-mail.').email('E-mail invalido.'),
    password: yup
        .string()
        .required('Informe a senha.')
        .min(6, 'A senha deve ter pelo menos 6 dígitos.'),
    password_confirm: yup
        .string()
        .required('Confirme a senha.')
        .oneOf([yup.ref("password"), ""], "A confirmação da senha não confere."),
})

export function SignUp() {

    const [isLoading, setIsLoading] = useState(false)
    const toast = useToast();
    const { signIn } = useAuth()

    const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
        resolver: yupResolver(signUpSchema)
    });
    const navigation = useNavigation();

    function handleGoBack() {
        navigation.goBack();
    }

    async function handleSignUp({ name, email, password }: FormDataProps) {
        try {
            setIsLoading(true);
            await api.post('/users', { name, email, password });
            await signIn(email, password)
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possivel criar a conta. Tente novamente mais tarde.'

            toast.show({
                render: ({ id }) => (
                    <Toast id={id} style={{ backgroundColor: 'transparent' }}>
                        <Text
                            color='white'
                            backgroundColor='$red500'
                            padding={10}
                            borderRadius={5}
                        >
                            {title}
                        </Text>
                    </Toast>
                ),
                placement: 'top',
            });
        }
    }


    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}>
            <VStack flex={1}>
                <Image
                    w="$full"
                    h={624}
                    source={BackgroundImg}
                    defaultSource={BackgroundImg}
                    alt="Pessoas treinando"
                    position="absolute"
                />
                <VStack flex={1} px="$10" pb="$16">
                    <Center my="$24">
                        <Logo />
                        <Text color="$gray100" fontSize="$sm">
                            Treine sua mente e seu corpo
                        </Text>
                    </Center>

                    <Center gap="$2" flex={1}>
                        <Heading color="$gray100">Crie sua conta</Heading>


                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder="Nome"
                                    onChangeText={onChange}
                                    value={value}
                                    errorMessage={errors.name?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder="E-mail"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    onChangeText={onChange}
                                    value={value}
                                    errorMessage={errors.email?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder="Senha"
                                    secureTextEntry
                                    onChangeText={onChange}
                                    value={value}
                                    errorMessage={errors.password?.message}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="password_confirm"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder="Confirme a senha"
                                    secureTextEntry
                                    onChangeText={onChange}
                                    value={value}
                                    onSubmitEditing={handleSubmit(handleSignUp)}
                                    returnKeyType="send"
                                    errorMessage={errors.password_confirm?.message}
                                />
                            )}
                        />

                        <Button
                            title="Criar e acessar"
                            onPress={handleSubmit(handleSignUp)}
                            isLoading={isLoading}
                        />
                    </Center>

                    <Button
                        title="Voltar para o login"
                        variant="outline"
                        marginTop="$12"
                        onPress={handleGoBack}
                    />
                </VStack>
            </VStack>
        </ScrollView>
    )
}