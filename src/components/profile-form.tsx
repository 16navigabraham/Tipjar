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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { uploadToPinata } from '@/services/pinata-service';
import { useApp } from '@/hooks/use-app';
import { checkUsernameAvailability } from '@/services/user-service';

const formSchema = z.object({
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters.' })
    .max(20, { message: 'Username must be less than 20 characters.' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores.' }),
  displayName: z.string().min(1, { message: "Display name can't be empty."}).max(50),
  bio: z.string().max(160).optional(),
  profilePicture: z.custom<FileList>().refine(files => files?.length > 0, 'Profile picture is required.'),
});


export function ProfileForm() {
    const { address, createProfile, loading } = useApp();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            displayName: '',
            bio: '',
        },
        mode: 'onChange',
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!address) {
            toast({ title: "Error", description: "Wallet not connected.", variant: "destructive" });
            return;
        }

        try {
            const isAvailable = await checkUsernameAvailability(values.username);
            if (!isAvailable) {
                form.setError('username', { message: 'This username is already taken.' });
                return;
            }
            
            let avatarUrl = '';
            if (values.profilePicture.length > 0) {
                const result = await uploadToPinata(values.profilePicture[0]);
                if (result.success && result.url) {
                    avatarUrl = result.url;
                } else {
                    throw new Error(result.error || "Failed to upload profile picture.");
                }
            }

            await createProfile({
                username: values.username,
                displayName: values.displayName,
                bio: values.bio || '',
                avatar: avatarUrl,
            });

            toast({
                title: "Profile Created!",
                description: `Your username "${values.username}" is now active.`,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
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
                                        <Input placeholder="your_unique_username" {...field} />
                                    </FormControl>
                                    <FormDescription>This is your unique @handle.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Display Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Tell us about yourself" {...field} />
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

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Profile
                        </Button>
                    </form>
                 </Form>
            </CardContent>
        </Card>
    );
}
