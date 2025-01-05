import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Register | Wepal',
  description: 'Create your Wepal account',
};

export default function RegisterPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Create Account</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
