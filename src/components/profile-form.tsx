'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount } from 'wagmi';
import { createUser, isUsernameAvailable } from '@/services/user-service';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters.' })
    .max(20, { message: 'Username must be less than 20 characters.' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores.' })
    .refine(async (username) => {
        return await isUsernameAvailable(username);
    }, {message: 'This username is already taken.'}),
});


export function ProfileForm() {
    const { address } = useAccount();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
        },
        mode: 'onChange',
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!address) {
            toast({ title: "Error", description: "Wallet not connected.", variant: "destructive" });
            return;
        }

        setIsLoading(true);

        const result = await createUser({
            username: values.username,
            walletAddress: address,
        });

        setIsLoading(false);

        if (result.success) {
            toast({
                title: "Profile Created!",
                description: `Your username "${values.username}" is now active.`,
            });
            queryClient.invalidateQueries({ queryKey: ['userProfile', address] });
        } else {
             toast({
                title: "Error",
                description: result.error || "Failed to create profile.",
                variant: "destructive",
            });
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Create Your Profile</CardTitle>
                <CardDescription>Choose a unique username so others can find you and send you tips.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="your_username" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Profile
                        </Button>
                    </form>
                 </Form>
            </CardContent>
        </Card>
    );
}
