import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CountryCodeSelect } from './CountryCodeSelect';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface PhoneVerificationProps {
  onVerificationComplete: (phoneNumber: string) => void;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  onVerificationComplete,
}) => {
  const [country, setCountry] = useState({
    name: 'China',
    code: 'CN',
    dialCode: '86',
    flag: '🇨🇳',
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validatePhoneNumber = (number: string) => {
    // 根据不同国家的电话号码规则进行验证
    const phoneRegex = {
      CN: /^1[3-9]\d{9}$/, // 中国手机号
      US: /^\d{10}$/, // 美国电话号码
      // ... 可以添加更多国家的验证规则
    };
    
    const regex = phoneRegex[country.code as keyof typeof phoneRegex] || /^\d{5,}$/;
    return regex.test(number);
  };

  const handleSendCode = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    try {
      // 调用发送验证码的 API
      await sendVerificationCode(`+${country.dialCode}${phoneNumber}`);
      setStep('code');
      setCountdown(60);
      setError(null);
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid verification code');
      return;
    }

    try {
      // 调用验证码验证的 API
      await verifyCode(`+${country.dialCode}${phoneNumber}`, verificationCode);
      onVerificationComplete(`+${country.dialCode}${phoneNumber}`);
      setError(null);
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    }
  };

  const handleResendCode = () => {
    handleSendCode();
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Phone Verification</CardTitle>
        <CardDescription>
          {step === 'phone'
            ? 'Enter your phone number to receive a verification code'
            : 'Enter the verification code sent to your phone'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}
        
        {step === 'phone' ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <CountryCodeSelect
                value={country}
                onChange={setCountry}
              />
              <Input
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value.replace(/\D/g, ''));
                  setError(null);
                }}
                className="flex-1"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSendCode}
              disabled={!phoneNumber}
            >
              Send Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                setError(null);
              }}
              maxLength={6}
            />
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={handleResendCode}
                disabled={countdown > 0}
              >
                {countdown > 0
                  ? `Resend code in ${countdown}s`
                  : 'Resend code'}
              </Button>
              <Button
                onClick={handleVerifyCode}
                disabled={verificationCode.length !== 6}
              >
                Verify
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// API 函数
const sendVerificationCode = async (phoneNumber: string) => {
  // 实现发送验证码的 API 调用
  const response = await fetch('/api/auth/send-verification-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send verification code');
  }
};

const verifyCode = async (phoneNumber: string, code: string) => {
  // 实现验证码验证的 API 调用
  const response = await fetch('/api/auth/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, code }),
  });
  
  if (!response.ok) {
    throw new Error('Invalid verification code');
  }
};
