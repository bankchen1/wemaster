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
import { Checkbox } from '@/components/ui/checkbox';
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
import { useToast } from '@/components/ui/use-toast';

const loginSchema = z.object({
  identifier: z.string().min(1, 'This field is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type LoginData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [country, setCountry] = useState({
    name: 'China',
    code: 'CN',
    dialCode: '86',
    flag: '🇨🇳',
  });
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const identifier = loginMethod === 'phone' 
        ? `+${country.dialCode}${data.identifier}`
        : data.identifier;

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password: data.password,
          loginMethod,
          rememberMe: data.rememberMe,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const result = await response.json();
      
      // 存储 token 和用户信息
      localStorage.setItem('token', result.token);
      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // 登录成功后重定向
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'linkedin') => {
    try {
      window.location.href = `/api/auth/${provider}`;
    } catch (error) {
      toast({
        title: `${provider} Login Failed`,
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          Login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={loginMethod}
          onValueChange={(value) => setLoginMethod(value as 'email' | 'phone')}
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
                      {loginMethod === 'email' ? 'Email' : 'Phone Number'}
                    </FormLabel>
                    <FormControl>
                      {loginMethod === 'email' ? (
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
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label
                        htmlFor="rememberMe"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember me
                      </label>
                    </div>
                  )}
                />
                
                <Button
                  variant="link"
                  className="px-0"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </Button>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Login
              </Button>
            </form>
          </Form>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-4">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            onClick={() => handleSocialLogin('google')}
          >
            <Icons.google className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocialLogin('facebook')}
          >
            <Icons.facebook className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocialLogin('linkedin')}
          >
            <Icons.linkedin className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
