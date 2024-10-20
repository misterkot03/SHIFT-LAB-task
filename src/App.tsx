import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import axios from 'axios';

const App: React.FC = () => {
  const [isCodeSent, setIsCodeSent] = useState(false);  // Отслеживаем отправку кода
  const [phoneNumber, setPhoneNumber] = useState('');   // Состояние для номера телефона
  const [verificationCode, setVerificationCode] = useState('');  // Состояние для кода
  const [phoneError, setPhoneError] = useState(false);  // Ошибка валидации телефона
  const [codeError, setCodeError] = useState(false);    // Ошибка валидации кода
  const [otpRetryDelay, setOtpRetryDelay] = useState(0);  // Таймер повторной отправки кода
  const [authError, setAuthError] = useState('');       // Ошибка авторизации
  const [loading, setLoading] = useState(false);        // Состояние загрузки
  const [successMessage, setSuccessMessage] = useState(''); // Сообщение об успешной авторизации

  // Отправляем запрос на создание OTP-кода
  const requestOtp = async () => {
    try {
      setLoading(true);  // Показать индикатор загрузки
      const response = await axios.post('https://shift-backend.onrender.com/auth/otp', {
        phone: phoneNumber,
      });
      const data = response.data;

      if (data.success) {
        setIsCodeSent(true);  // Переходим к следующему шагу
        setOtpRetryDelay(data.retryDelay);  // Устанавливаем задержку для повторной отправки
      } else {
        console.log('Ошибка: ', data.reason);  // Обрабатываем ошибку
      }
    } catch (error) {
      console.error('Ошибка при создании OTP-кода: ', error);  // Логируем ошибки
    } finally {
      setLoading(false);  // Скрыть индикатор загрузки
    }
  };

  // Отправляем запрос на сервер для проверки кода
  const verifyCode = async () => {
    try {
      setLoading(true);  // Показать индикатор загрузки
      const response = await axios.post('https://shift-backend.onrender.com/users/signin', {
        phone: phoneNumber,
        code: verificationCode,
      });
      const data = response.data;

      if (data.success) {
        setSuccessMessage('Авторизация успешна! Добро пожаловать.'); // Показать сообщение об успехе
        setAuthError(''); // Очищаем ошибку
      } else {
        setAuthError('Ошибка авторизации. Неверный код.');
      }
    } catch (error) {
      console.error('Ошибка при авторизации: ', error);
      setAuthError('Ошибка авторизации. Попробуйте ещё раз.');
    } finally {
      setLoading(false);  // Скрыть индикатор загрузки
    }
  };

  // Обрабатываем отправку запроса на сервер
  const handleButtonClick = () => {
    if (!isCodeSent) {
      if (phoneNumber.length !== 11) {
        setPhoneError(true);
      } else {
        setPhoneError(false);
        requestOtp();  // Запрос на создание OTP
      }
    } else {
      if (verificationCode.length !== 6) {
        setCodeError(true);
      } else {
        setCodeError(false);
        verifyCode();  // Отправляем запрос для проверки кода
      }
    }
  };

  // Обработка изменений поля номера телефона
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (/^\d*$/.test(input) && input.length <= 11) {
      setPhoneNumber(input);
    }
  };

  // Обработка изменений поля проверочного кода
  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (/^\d*$/.test(input) && input.length <= 6) {
      setVerificationCode(input);
    }
  };

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      height="100vh" 
      bgcolor="#F7F8FC"
    >
      <Container maxWidth="xs">
        <Box 
          display="flex" 
          flexDirection="column" 
          p={3}
          sx={{
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '400px',
            color: '#213547',
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ mb: 3, color: '#213547', textAlign: 'left' }}
          >
            {isCodeSent ? 'Вход' : 'Введите номер телефона для входа'}
          </Typography>
          <Typography 
            variant="body1" 
            gutterBottom 
            sx={{ mb: 3, color: '#213547', textAlign: 'left' }}
          >
            {isCodeSent 
              ? 'Введите проверочный код для входа в личный кабинет'
              : 'Введите номер телефона для входа в личный кабинет'}
          </Typography>
          
          {/* Поле ввода телефона */}
          {!isCodeSent && (
            <TextField 
              label="Телефон" 
              variant="outlined" 
              fullWidth={false}
              margin="normal" 
              value={phoneNumber}  
              onChange={handlePhoneNumberChange}  
              error={phoneError}  
              helperText={phoneError ? "Номер телефона должен содержать 11 цифр" : ""}  
              sx={{ mb: 4, maxWidth: '350px', width: '100%' }}
            />
          )}

          {/* Поля для ввода кода, если кнопка была нажата */}
          {isCodeSent && (
            <>
              <TextField 
                label="Номер телефона" 
                variant="outlined" 
                fullWidth={false}
                margin="normal" 
                value={phoneNumber}  
                sx={{ mb: 4, maxWidth: '350px', width: '100%' }}
                disabled  
              />
              <TextField 
                label="Проверочный код" 
                variant="outlined" 
                fullWidth={false}
                margin="normal" 
                value={verificationCode}  
                onChange={handleVerificationCodeChange}  
                error={codeError}  
                helperText={codeError ? "Код должен содержать 6 цифр" : ""}  
                sx={{ mb: 4, maxWidth: '350px', width: '100%' }}
              />
            </>
          )}

          <Button 
            variant="contained" 
            fullWidth={false}  
            sx={{
              backgroundColor: '#2684FF',
              borderRadius: '12px',
              padding: '12px 0',
              maxWidth: '350px',
              width: '100%',  
              alignSelf: 'flex-start',  
              ':hover': {
                backgroundColor: '#0063E5',
              }
            }}
            onClick={handleButtonClick} 
            disabled={loading}  // Отключаем кнопку, пока идёт загрузка
          >
            {loading ? <CircularProgress size={24} /> : isCodeSent ? 'Войти' : 'Продолжить'}
          </Button>

          {/* Вывод ошибки авторизации */}
          {authError && (
            <Typography 
              variant="body2" 
              sx={{ mt: 2, textAlign: 'left', color: 'red' }}
            >
              {authError}
            </Typography>
          )}

          {/* Вывод успешного сообщения */}
          {successMessage && (
            <Typography 
              variant="body2" 
              sx={{ mt: 2, textAlign: 'left', color: 'green' }}
            >
              {successMessage}
            </Typography>
          )}

          {/* Таймер повторной отправки */}
          {isCodeSent && (
            <Typography 
              variant="body2" 
              sx={{ mt: 2, textAlign: 'left', color: '#888' }}
            >
              Запросить код повторно можно через {otpRetryDelay / 1000} секунд
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default App;
