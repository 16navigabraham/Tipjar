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
import { Send } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { contractChain, creatorAddress } from '@/lib/config';
import { useEffect } from 'react';

const formSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Please enter a valid positive amount.',
  }),
});

export function TipForm() {
  const { toast } = useToast();
  const { chain } = useAccount();
  const { data: hash, error, isPending, sendTransaction } = useSendTransaction();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (chain?.id !== contractChain.id) {
      toast({
        title: 'Wrong Network',
        description: `Please switch to the ${contractChain.name} network to send a tip.`,
        variant: 'destructive',
      });
      return;
    }

    sendTransaction({
      to: creatorAddress as `0x${string}`,
      value: parseEther(values.amount),
    });
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirming) {
      toast({
        title: 'Transaction Submitted',
        description: `Sending tip... Please wait for confirmation.`,
      });
    }
    if (isConfirmed) {
      toast({
        title: '🎉 Tip Sent!',
        description: `Successfully sent tip. Thank you for your support!`,
      });
      form.reset();
    }
    if (error) {
      toast({
        title: 'Error',
        description: error.shortMessage || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }, [isConfirming, isConfirmed, error, toast, form]);


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
        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? 'Sending...' : (
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
