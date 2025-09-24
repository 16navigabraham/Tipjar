'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount, useEnsName } from 'wagmi';
import { createUser, isUsernameAvailable } from '@/services/user-service';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { contractChain } from '@/lib/config';
import { uploadToPinata } from '@/services/pinata-service';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters.' })
    .max(20, { message: 'Username must be less than 20 characters.' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores.' }),
  profilePicture: z.custom<FileList>().refine(files => files?.length > 0, 'Profile picture is required.'),
});


export function ProfileForm() {
    const { address } = useAccount();
    const { data: ensName } = useEnsName({ address, chainId: contractChain.id });
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();

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

        try {
            const usernameAvailable = await isUsernameAvailable(values.username);
            if (!usernameAvailable) {
                form.setError("username", {
                    type: "manual",
                    message: "This username is already taken.",
                });
                setIsLoading(false);
                return;
            }

            let pfpUrl = '';
            if (values.profilePicture.length > 0) {
                const result = await uploadToPinata(values.profilePicture[0]);
                if (result.success && result.url) {
                    pfpUrl = result.url;
                } else {
                    throw new Error(result.error || "Failed to upload profile picture.");
                }
            }

            const result = await createUser({
                username: values.username,
                walletAddress: address,
                pfpUrl,
            });

            if (result.success) {
                toast({
                    title: "Profile Created!",
                    description: `Your username "${values.username}" is now active.`,
                });
                await queryClient.invalidateQueries({ queryKey: ['userProfile', address] });
                router.push('/leaderboard');
            } else {
                throw new Error(result.error || "Failed to create profile.");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Create Your Profile</CardTitle>
                <CardDescription>Choose a unique username and a profile picture so others can find you.</CardDescription>
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
                         <FormField
                            control={form.control}
                            name="profilePicture"
                            render={({ field: { onChange, value, ...rest }}) => (
                                <FormItem>
                                    <FormLabel>Profile Picture</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} {...rest} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {ensName && (
                             <FormItem>
                                <FormLabel>Base ENS Name</FormLabel>
                                <Input value={ensName} readOnly disabled />
                                <FormDescription>This is your ENS name on the Base network.</FormDescription>
                            </FormItem>
                        )}
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
