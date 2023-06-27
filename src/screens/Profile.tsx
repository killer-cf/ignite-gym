import { useState } from "react"
import { TouchableOpacity } from "react-native"
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { FileInfo } from "expo-file-system"
import { Center, ScrollView, VStack, Skeleton, Text, Heading, useToast } from "native-base"

import { ScreenHeader } from "@components/ScreenHeader"
import { UserPhoto } from "@components/UserPhoto"
import { Input } from "@components/Input"
import { Button } from "@components/Button"

const PHOTO_SIZE = 33

export function Profile() {
  const [photoIsLoading, setPhotoIsLoading] = useState(false)
  const [userPhoto, setUserPhoto] = useState("https://github.com/killer-cf.png")

  const toast = useToast()

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
        setUserPhoto(photoUri)
      }

    } catch (error) {
      console.log(error)
    } finally {
      setPhotoIsLoading(false)
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
                source={{ uri: userPhoto}}
                alt="Foto do usuário"
                size={PHOTO_SIZE}
              />
          }

          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text color={"green.500"} fontWeight={"bold"} fontSize={"md"} mt={2} mb={8}>
              Alterar foto
            </Text>
          </TouchableOpacity>

          <Input 
            placeholder="Nome"
            bg={"gray.600"}
          />

          <Input 
            value="costa.kilder@live.com"
            isDisabled
            bg={"gray.600"}
          />
        </Center>

        <VStack px={10} mt={12} mb={9}>
          <Heading color={"gray.200"} fontSize={"md"} fontFamily={"heading"} mb={2}>
            Alterar senha
          </Heading>

          <Input 
            bg={"gray.600"}
            placeholder="Senha antiga"
            secureTextEntry
          />

          <Input 
            bg={"gray.600"}
            placeholder="Nova senha"
            secureTextEntry
          />

          <Input 
            bg={"gray.600"}
            placeholder="Confirme a nova senha"
            secureTextEntry
          />

          <Button 
            title="Atualizar"
            mt={4}
          />
        </VStack>
      </ScrollView>
    </VStack>
  )
}