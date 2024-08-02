import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
  const handleLogin = async (values) => {
    try {
      const response = await axios.post('http://10.0.2.2:3000/login', values);
      if (response.status === 200) {
        const { token } = response.data;
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Formik
      initialValues={{ username: '', password: '' }}
      onSubmit={handleLogin}
    >
      {({ handleChange, handleBlur, handleSubmit, values }) => (
        <View style={styles.container}>
          <Text>Kullanıcı Adı</Text>
          <TextInput
            onChangeText={handleChange('username')}
            onBlur={handleBlur('username')}
            value={values.username}
            style={styles.input}
          />
          <Text>Şifre</Text>
          <TextInput
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            value={values.password}
            secureTextEntry
            style={styles.input}
          />
          <Button onPress={handleSubmit} title="Giriş Yap" />
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  registerButton: {
    marginTop: 20,
    backgroundColor: 'green',
    padding: 10,
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
