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
import { useEthPrice } from '@/hooks/use-eth-price';
import { useState, useEffect } from 'react';
import { Textarea } from './ui/textarea';

const formSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Please enter a valid positive amount.',
  }),
  message: z.string().optional(),
});

export function TipForm() {
  const { isConnected } = useAccount();
  const { sendTip, isSending, isConfirming } = useTip();
  const { price: ethPrice } = useEthPrice();
  const [usdValue, setUsdValue] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      message: '',
    },
  });

  const amountValue = form.watch('amount');

  useEffect(() => {
    if (ethPrice && amountValue) {
      const numericAmount = parseFloat(amountValue);
      if (!isNaN(numericAmount)) {
        setUsdValue((numericAmount * ethPrice).toFixed(2));
      } else {
        setUsdValue('');
      }
    } else {
      setUsdValue('');
    }
  }, [amountValue, ethPrice]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await sendTip(values.amount, values.message);
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
                <div className="relative">
                  <Input placeholder="0.01" type="number" step="any" {...field} className="pr-20" />
                  {usdValue && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                      ~${usdValue} USD
                    </span>
                  )}
                </div>
              </FormControl>
              <FormDescription>The amount in ETH you want to tip.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Thanks for the great content!" {...field} />
              </FormControl>
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
