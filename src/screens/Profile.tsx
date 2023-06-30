import { useState } from "react"
import { TouchableOpacity } from "react-native"
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { FileInfo } from "expo-file-system"
import { Center, ScrollView, VStack, Skeleton, Text, Heading, useToast } from "native-base"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

import defaultUserPhoto from '@assets/userPhotoDefault.png'
import { ScreenHeader } from "@components/ScreenHeader"
import { UserPhoto } from "@components/UserPhoto"
import { Input } from "@components/Input"
import { Button } from "@components/Button"
import { useAuth } from "@hooks/useAuth"
import { AppError } from "@utils/AppError"
import { api } from "@services/api"

const PHOTO_SIZE = 33

const profileFormSchema = yup.object({
  name: yup.string().required('Informe o novo nome'),
  email: yup.string(),
  password: yup
    .string()
    .min(6, 'A senha deve ter um mínimo de 6 caracteres')
    .nullable()
    .transform(value => !!value ? value : null),
  old_password: yup.string(),
  confirm_password: yup
  .string()
  .nullable()
  .transform(value => !!value ? value : null)
  .oneOf([yup.ref('password'), null], 'A confirmação de senha não confere')
  .when('password', {
    is: (Field: any) => Field,
    then: (schema) => schema
                        .nullable()
                        .required('Informe a confirmação de senha')
                        .transform(value => !!value ? value : null)
  }),
})

type FormDataProps = yup.InferType<typeof profileFormSchema>

export function Profile() {
  const [photoIsLoading, setPhotoIsLoading] = useState(false)
  const [userPhoto, setUserPhoto] = useState("")

  const toast = useToast()
  const { user, updateUserProfile } = useAuth()

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(profileFormSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    }
  })

  async function handleUserPhotoSelect() {
    setPhotoIsLoading(true)
    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      })

      if (photoSelected.canceled) return

      const photoUri = photoSelected.assets[0].uri

      if (photoUri) {
        const photoInfo = await FileSystem.getInfoAsync(photoUri) as FileInfo
        
        if(photoInfo.size && (photoInfo.size / 1024 / 1024) > 10) {
          return toast.show({
            title: "Essa imagem é muito grande. Escolha uma de até 10MB.",
            placement: 'top',
            bgColor: 'red.500'
          })
        }

        const fileExtension = photoUri.split('.').pop()
        
        const photoFile = {
          name: `${user.name.replace(' ', '_')}.${fileExtension}`.toLowerCase(),
          uri: photoUri,
          type: `${photoSelected.assets[0].type}/${fileExtension}`
        } as any
        
        const userPhotoUploadForm = new FormData()
        userPhotoUploadForm.append('avatar', photoFile)

        const avatarUpdatedResponse = await api.patch('/users/avatar', userPhotoUploadForm, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        const userUpdated = user
        userUpdated.avatar = avatarUpdatedResponse.data.avatar
        updateUserProfile(userUpdated)

        toast.show({
          title: 'Foto atualizada',
          placement: 'top',
          bgColor: 'green.500'
        })
      }

    } catch (error) {
      console.log(error)
    } finally {
      setPhotoIsLoading(false)
    }
    
  }

  async function handleProfileUpdate(data: FormDataProps) {
    try {
      const userUpdated = user
      userUpdated.name = data.name

      await api.put('/users', data)

      await updateUserProfile(userUpdated)

      toast.show({
        title: 'Perfil atualizado com sucesso!',
        placement: 'top',
        bgColor: 'green.500'
      })

    } catch (error) {
      const isAppError = error instanceof AppError  
      const title = isAppError ? error.message : 'Não foi possível atualizar. Tente novamente mais tarde'
      
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500'
      })
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />

      <ScrollView contentContainerStyle={{ paddingBottom: 36}}>
        <Center mt={6} px={10}>
          {
            photoIsLoading ?
              <Skeleton 
                w={PHOTO_SIZE} 
                h={PHOTO_SIZE} 
                rounded={"full"} 
                startColor={"gray.400"}
                endColor={"gray.300"}
              />
              :
              <UserPhoto 
                source={user.avatar ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } : defaultUserPhoto}
                alt="Foto do usuário"
                size={PHOTO_SIZE}
              />
          }

          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text color={"green.500"} fontWeight={"bold"} fontSize={"md"} mt={2} mb={8}>
              Alterar foto
            </Text>
          </TouchableOpacity>

          <Controller 
            name="name"
            control={control}
            render={({ field: { value, onChange}}) => (
              <Input 
                placeholder="Nome"
                bg={"gray.600"}
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller 
            name="email"
            control={control}
            render={({ field: { value, onChange}}) => (
              <Input
                isDisabled
                bg={"gray.600"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </Center>

        <VStack px={10} mt={12} mb={9}>
          <Heading color={"gray.200"} fontSize={"md"} fontFamily={"heading"} mb={2}>
            Alterar senha
          </Heading>

          <Controller 
            name="old_password"
            control={control}
            render={({ field: { onChange}}) => (
              <Input 
                placeholder="Senha antiga"
                bg={"gray.600"}
                secureTextEntry
                onChangeText={onChange}
              />
            )}
          />

           <Controller 
            name="password"
            control={control}
            render={({ field: { onChange}}) => (
              <Input 
                placeholder="Nova senha"
                bg={"gray.600"}
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Controller 
            name="confirm_password"
            control={control}
            render={({ field: { onChange}}) => (
              <Input 
                placeholder="Confirme a nova senha"
                secureTextEntry
                bg={"gray.600"}
                onChangeText={onChange}
                errorMessage={errors.confirm_password?.message}
              />
            )}
          />

          <Button 
            title="Atualizar"
            mt={4}
            onPress={handleSubmit(handleProfileUpdate)}
            isLoading={isSubmitting}
          />
        </VStack>
      </ScrollView>
    </VStack>
  )
}