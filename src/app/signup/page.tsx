'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { createUserProfile } from '@/lib/user-actions';
import { Loader2, User, Users, Check, ArrowLeft, Sparkles, Clock, Shield } from 'lucide-react';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  role: z.enum(['senior', 'guardian'], { required_error: 'Please select a role.' }),
});

type FormValues = z.infer<typeof formSchema>;

const benefits = [
  { icon: Users, text: 'Join thousands of happy seniors' },
  { icon: Sparkles, text: 'Free to get started' },
  { icon: Clock, text: '24/7 support available' },
  { icon: Shield, text: 'Secure & trusted platform' },
];

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'senior' | 'guardian' | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: undefined,
    },
  });

  const handleRoleSelect = (role: 'senior' | 'guardian') => {
    setSelectedRole(role);
    form.setValue('role', role);
  };

  const handleSignup = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      await createUserProfile(firestore, user, {
        firstName: values.firstName,
        lastName: values.lastName,
        userType: values.role,
        phone: user.phoneNumber,
      });

      toast({
        title: 'Account Created! 🎉',
        description: "You've been successfully signed up. Welcome to ElderLink!",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Signup Error:', error);
      let errorMessage = 'There was a problem with your request.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo showTagline href="/" />
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Button variant="ghost" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
          {/* Left Side - Hero Section */}
          <div className="hidden lg:block space-y-6 lg:space-y-8 sticky top-24">
            <div>
              <h1 className="mb-4 text-4xl lg:text-5xl font-bold">
                Join the <span className="text-gradient-primary">Happiness Club</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Start your journey today and discover a world of care, connection, and happiness.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Why join ElderLink?</h3>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="rounded-full bg-gradient-primary p-2">
                      <benefit.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-muted-foreground">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-gradient-card border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Already have an account?</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sign in to access your dashboard and continue your journey.
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/">Sign In</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Signup Form */}
          <div className="w-full max-w-lg mx-auto lg:max-w-none">
            <Card className="border-2 shadow-soft-lg">
              <CardContent className="p-5 sm:p-6 lg:p-8">
                <div className="mb-6 lg:hidden text-center sm:text-left">
                  <h1 className="mb-2 text-2xl sm:text-3xl font-bold">
                    Join the <span className="text-gradient-primary">Happiness Club</span>
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Create your account and start your journey today.
                  </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-6">
                    {/* Role Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">I am a...</Label>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <button
                          type="button"
                          onClick={() => handleRoleSelect('senior')}
                          className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                            selectedRole === 'senior'
                              ? 'border-primary bg-primary/5 shadow-warm'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2 sm:gap-3">
                            <div
                              className={`rounded-full p-2 sm:p-3 ${
                                selectedRole === 'senior'
                                  ? 'bg-gradient-primary'
                                  : 'bg-muted'
                              }`}
                            >
                              <User className={`h-5 w-5 sm:h-6 sm:w-6 ${
                                selectedRole === 'senior' ? 'text-white' : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div className="text-center">
                              <div className="text-sm sm:text-base font-semibold">Parent / Senior</div>
                              <div className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                                I want to use ElderLink
                              </div>
                            </div>
                          </div>
                          {selectedRole === 'senior' && (
                            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                              <div className="rounded-full bg-primary p-1">
                                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                              </div>
                            </div>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRoleSelect('guardian')}
                          className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                            selectedRole === 'guardian'
                              ? 'border-primary bg-primary/5 shadow-warm'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2 sm:gap-3">
                            <div
                              className={`rounded-full p-2 sm:p-3 ${
                                selectedRole === 'guardian'
                                  ? 'bg-gradient-primary'
                                  : 'bg-muted'
                              }`}
                            >
                              <Users className={`h-5 w-5 sm:h-6 sm:w-6 ${
                                selectedRole === 'guardian' ? 'text-white' : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div className="text-center">
                              <div className="text-sm sm:text-base font-semibold">Guardian / Child</div>
                              <div className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                                I want to care for a senior
                              </div>
                            </div>
                          </div>
                          {selectedRole === 'guardian' && (
                            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                              <div className="rounded-full bg-primary p-1">
                                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                              </div>
                            </div>
                          )}
                        </button>
                      </div>
                      <FormField
                        control={form.control}
                        name="role"
                        render={() => (
                          <FormItem>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <Label htmlFor="first-name">First Name</Label>
                            <FormControl>
                              <Input
                                id="first-name"
                                placeholder="John"
                                className="h-11"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <Label htmlFor="last-name">Last Name</Label>
                            <FormControl>
                              <Input
                                id="last-name"
                                placeholder="Doe"
                                className="h-11"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="email">Email</Label>
                          <FormControl>
                            <Input
                              id="email"
                              type="email"
                              placeholder="john@example.com"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Password */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="password">Password</Label>
                          <FormControl>
                            <Input
                              id="password"
                              type="password"
                              placeholder="At least 6 characters"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-primary text-white hover:opacity-90 h-12 text-base font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </Form>

                {/* Mobile Benefits */}
                <div className="mt-6 lg:hidden space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{benefit.text}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center text-sm">
                  Already have an account?{' '}
                  <Link href="/" className="font-medium text-primary hover:underline">
                    Sign in
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
