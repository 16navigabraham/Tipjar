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
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { contractAddress, contractChain } from '@/lib/config';
import { tipJarAbi } from '@/lib/abi/TipJar';
import { useEffect } from 'react';

const formSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Please enter a valid positive amount.',
  }),
  token: z.string().default('ETH'),
});

export function TipForm() {
  const { toast } = useToast();
  const { chain } = useAccount();
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      token: 'ETH',
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

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: tipJarAbi,
      functionName: 'tip',
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
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input placeholder="0.01" type="number" step="any" {...field} />
              </FormControl>
              <FormDescription>The amount you want to tip in ETH.</FormDescription>
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
                  <Input {...field} className="pl-10" disabled readOnly />
                </div>
              </FormControl>
              <FormDescription>
                Tipping in ETH on the {contractChain.name} network is supported.
              </FormDescription>
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
