import { VStack, Image, Center, Text, Heading, ScrollView, useToast, Toast, useToken } from "@gluestack-ui/themed";
import { AuthNavigatorRoutesProps } from "../../routes/auth.routes"
import { useNavigation } from "@react-navigation/native";
import BackgroundImg from "@assets/background.png"
import Logo from "@assets/logo.svg"
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@hooks/useAuth";
import { AppError } from "@utils/AppError";
import { useState } from 'react';

type FormData = {
    email: string
    password: string
}

export function SignIn() {

    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast()

    const { signIn } = useAuth()
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>();

    const navigation = useNavigation<AuthNavigatorRoutesProps>()

    function handleNewAccount() {
        navigation.navigate("SignUp")
    }

    async function handleSignIn({ email, password }: FormData) {
        try {
            setIsLoading(true);
            await signIn(email, password);
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possivel entrar. Tente novamente mais tarde.'

            setIsLoading(false);

            toast.show({
                render: () => (
                    <Toast style={{ backgroundColor: 'transparent' }}>
                        <Text
                            color="white"
                            bg="$red500"
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

                    <Center gap="$2">
                        <Heading color="$gray100">Acesse a conta</Heading>
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
                        <Button
                            title="Acessar"
                            onPress={handleSubmit(handleSignIn)}
                            isLoading={isLoading}
                        />
                    </Center>


                    <Center flex={1} justifyContent="flex-end" mt="$4">

                        <Text color="$gray100" fontSize={"$sm"} mb="$3" fontFamily="$body">Ainda não tem acesso?</Text>
                        <Button title="Criar Conta" variant="outline" onPress={handleNewAccount} />

                    </Center>
                </VStack>
            </VStack>
        </ScrollView>
    )
}