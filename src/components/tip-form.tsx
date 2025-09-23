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
import { useEthPrice } from '@/hooks/use-eth-price';
import { useState, useEffect } from 'react';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { tokens, Token } from '@/lib/tokens';

const formSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Please enter a valid positive amount.',
  }),
  message: z.string().optional(),
  token: z.string(),
});

interface TipFormProps {
    onSendTip: (amount: string, token: Token, message?: string) => Promise<void>;
    isSending: boolean;
    isConfirming: boolean;
}

export function TipForm({ onSendTip, isSending, isConfirming }: TipFormProps) {
  const { isConnected } = useAccount();
  const { price: ethPrice } = useEthPrice();
  const [usdValue, setUsdValue] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      message: '',
      token: 'ETH',
    },
  });

  const amountValue = form.watch('amount');
  const selectedTokenSymbol = form.watch('token');

  const selectedToken = tokens.find(t => t.symbol === selectedTokenSymbol) || tokens[0];

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
    const tokenToSend = tokens.find(t => t.symbol === values.token)!;
    await onSendTip(values.amount, tokenToSend, values.message);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel>Amount</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem className="w-1/3">
                <FormLabel>Token</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a token" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tokens.map(token => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        <div className="flex items-center gap-2">
                          {token.symbol}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormDescription>The amount and token you want to tip.</FormDescription>


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
              Send {form.getValues('amount') || 'Tip'} {selectedToken.symbol}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
