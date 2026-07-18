import { View, Text, Alert} from 'react-native'
import { useState } from 'react'
import { Link, router } from 'expo-router'
import CustomInput from '../../components/CustomInput'
import CustomButton from '../../components/CustomButton'
import { signIn } from '../../lib/appwrite'
import useAuthStore from '../../store/auth.store'
import * as Sentry from "@sentry/react-native"


const SignIn = () => {
  const[isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ email: "", password: ""})
  const { fetchAuthenticatedUser } = useAuthStore()

  const submit = async () => {
    const { email, password} = form

    if(!email || !password) return Alert.alert("Error", "Mohon masukan email address & password  yang valid")
      setIsSubmitting(true)

    try {
            await signIn({
              email,
              password
            })
      await fetchAuthenticatedUser()
      router.replace("/")

    } catch (error: any) {
      Alert.alert("Error", error.message)
      Sentry.captureEvent(error)
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <View className='gap-10 bg-white rounded-lg p-5 mt-5'>
      <CustomInput
      placeholder='Masukkan email'
      value={form.email}
      onChangeText={(text) => setForm((prev) => ({ ...prev, email: text}))}
      label='Email'
      keyboardType='email-address'
      />

      <CustomInput
       placeholder='Masukkan password'
       value={form.password}
       onChangeText={(text) => setForm((prev) => ({ ...prev, password: text}))}
       label='Password'
       secureTextEntry={true}
       />

       <CustomButton
       title='Sign In'
       isLoading={isSubmitting}
       onPress={submit}
       />

       <View className='flex justify-center mt-20 flex-row gap-2'>
        <Text className='base-reguler text-gray-100'>
          Don't have an account? ?
        </Text>
        <Link href="/sign-up" asChild>
          <Text className="base-bold text-primary">Sign Up</Text>
        </Link>
       </View>
    </View>
  )


}

export default SignIn