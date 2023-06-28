import { useState } from "react"
import { VStack, Image, Text, Center, Heading, ScrollView, useToast } from "native-base"
import { useNavigation } from "@react-navigation/native"
import { AuthNavigatorRoutesProps } from "@routes/auth.routes"
import { useForm, Controller } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"

import LogoSvg from '@assets/logo.svg'
import BackgroundImg from '@assets/background.png'
import { Input } from "@components/Input"
import { Button } from "@components/Button"
import { useAuth } from "@hooks/useAuth"
import { AppError } from "@utils/AppError"

const signInSchema = yup.object({
  email: yup.string().required('Informe o Email').email('Informe um e-mail válido'),
  password: yup.string().required('Informe a senha'),
})

type SignInFormData = yup.InferType<typeof signInSchema>

export function SignIn() {
  const  { control, handleSubmit, formState: { errors }} = useForm<SignInFormData>({
    resolver: yupResolver(signInSchema)
  })
  const [isLoading, setIsLoading] = useState(false)

  const navigation = useNavigation<AuthNavigatorRoutesProps>()
  const toast = useToast()

  const { signIn } = useAuth()

  function handleNewAccount() {
    navigation.navigate('signUp')
  }

  async function handleSignIn({email, password}: SignInFormData) {
    try {
      setIsLoading(true)
      await signIn(email, password)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível entrar. Tente novamente mais tarde'

      setIsLoading(false)
      
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500'
      })
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1}} showsVerticalScrollIndicator={false}>
      <VStack flex={1} px={10} >
        <Image 
          source={BackgroundImg}
          defaultSource={BackgroundImg} 
          alt='Pessoas treinando'
          resizeMode="contain"
          position='absolute'  
        />

        <Center my={24}>
          <LogoSvg />

          <Text color={"gray.100"} fontSize={"sm"}>
            Treine sua mente e seu corpo
          </Text>
        </Center>

        <Center>
          <Heading color='gray.100' fontSize={"xl"} mb={6} fontFamily={"heading"} >
            Acesse sua conta
          </Heading>
          <Controller 
            control={control}
            name="email"
            render={({ field: { onChange, value }}) => (
              <Input 
                placeholder="E-mail"
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller 
            control={control}
            name="password"
            render={({ field: { onChange, value }}) => (
              <Input 
                placeholder="Senha"
                onChangeText={onChange}
                value={value}
                secureTextEntry
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Button title="Acessar" onPress={handleSubmit(handleSignIn)} isLoading={isLoading} />
        </Center>

        <Center mt={24}>
          <Text color={"gray.100"} fontSize={"sm"} mb={3} fontFamily={"body"}>
            Ainda não tem acesso?
          </Text>

          <Button 
            onPress={handleNewAccount}
            title="Criar conta" 
            variant={'outline'}
          />
        </Center>
      </VStack>
    </ScrollView>
  )
}