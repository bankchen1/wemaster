import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Icons } from '@/components/ui/icons';
import { CountryCodeSelect } from './CountryCodeSelect';
import { PhoneVerification } from './PhoneVerification';
import { useToast } from '@/components/ui/use-toast';

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, 'This field is required'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [country, setCountry] = useState({
    name: 'China',
    code: 'CN',
    dialCode: '86',
    flag: '🇨🇳',
  });
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [verificationCode, setVerificationCode] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    try {
      const identifier = method === 'phone'
        ? `+${country.dialCode}${data.identifier}`
        : data.identifier;

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          method,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset instructions');
      }

      setStep('verify');
      toast({
        title: 'Reset Instructions Sent',
        description: method === 'email'
          ? 'Please check your email for reset instructions'
          : 'Please enter the verification code sent to your phone',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reset instructions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: form.getValues('identifier'),
          code: verificationCode,
          method,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      setStep('reset');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid verification code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: form.getValues('identifier'),
          code: verificationCode,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      toast({
        title: 'Password Reset Successful',
        description: 'You can now login with your new password',
      });
      router.push('/auth/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          {step === 'request'
            ? 'Enter your email or phone number to reset your password'
            : step === 'verify'
            ? 'Enter the verification code'
            : 'Create a new password'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'request' && (
          <Tabs
            value={method}
            onValueChange={(value) => setMethod(value as 'email' | 'phone')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {method === 'email' ? 'Email' : 'Phone Number'}
                      </FormLabel>
                      <FormControl>
                        {method === 'email' ? (
                          <Input
                            placeholder="Enter your email"
                            type="email"
                            {...field}
                          />
                        ) : (
                          <div className="flex gap-2">
                            <CountryCodeSelect
                              value={country}
                              onChange={setCountry}
                            />
                            <Input
                              placeholder="Phone number"
                              type="tel"
                              className="flex-1"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e.target.value.replace(/\D/g, ''));
                              }}
                            />
                          </div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Send Reset Instructions
                </Button>
              </form>
            </Form>
          </Tabs>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <Input
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
            />
            <Button
              className="w-full"
              onClick={handleVerifyCode}
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify Code
            </Button>
          </div>
        )}

        {step === 'reset' && (
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter new password"
              onChange={(e) => handleResetPassword(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={() => {}}
              disabled={isLoading}
            >
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reset Password
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <Button
          variant="link"
          onClick={() => router.push('/auth/login')}
        >
          Back to Login
        </Button>
      </CardFooter>
    </Card>
  );
};
