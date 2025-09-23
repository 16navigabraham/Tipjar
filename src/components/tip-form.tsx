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
import { useToast } from '@/hooks/use-toast';
import { Coins, Send } from 'lucide-react';

const formSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Please enter a valid positive amount.',
  }),
  token: z.string().default('ETH'),
});

export function TipForm() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      token: 'ETH',
    },
  });

  // Placeholder for transaction logic
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Submitting tip:', values);
    toast({
      title: 'Transaction Submitted',
      description: `Sending ${values.amount} ${values.token}. Please wait for confirmation.`,
    });
    // Here you would call a wagmi hook to send the transaction
    // For now, we'll just simulate a success
    setTimeout(() => {
        toast({
            title: "🎉 Tip Sent!",
            description: `Successfully sent ${values.amount} ${values.token}.`,
        });
    }, 3000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input placeholder="0.01" type="number" step="any" {...field} />
              </FormControl>
              <FormDescription>The amount you want to tip.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token</FormLabel>
              <FormControl>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="ETH, USDC, etc." {...field} className="pl-10" />
                </div>
              </FormControl>
              <FormDescription>
                Tipping in ETH is currently supported. More tokens coming soon!
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" size="lg">
          <Send className="mr-2 h-4 w-4" />
          Send Tip
        </Button>
      </form>
    </Form>
  );
}
