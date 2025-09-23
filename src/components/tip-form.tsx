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
import { Send } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useTip } from '@/hooks/use-tip';

const formSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Please enter a valid positive amount.',
  }),
});

export function TipForm() {
  const { isConnected } = useAccount();
  const { sendTip, isSending, isConfirming } = useTip();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await sendTip(values.amount);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (ETH)</FormLabel>
              <FormControl>
                <Input placeholder="0.01" type="number" step="any" {...field} />
              </FormControl>
              <FormDescription>The amount in ETH you want to tip.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" size="lg" disabled={!isConnected || isSending || isConfirming}>
          {isSending || isConfirming ? 'Sending...' : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Tip
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
