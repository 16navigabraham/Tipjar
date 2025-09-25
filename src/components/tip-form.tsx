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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Coins, Bot, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useEthPrice } from '@/hooks/use-eth-price';
import { useState, useEffect } from 'react';
import { tokens, Token } from '@/lib/tokens';
import { useQuery } from '@tanstack/react-query';
import { getTokenBalance } from '@/services/alchemy-service';
import { formatUnits } from 'viem';
import { suggestTipTokens, SuggestTipTokensOutput } from '@/ai/flows/suggest-tip-tokens';

const formSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Please enter a valid positive amount.',
  }),
  tokenSymbol: z.string(),
  message: z.string().max(280).optional(),
});

interface TipFormProps {
    onSendTip: (amount: string, token: Token, message?: string) => Promise<void>;
    isSending: boolean;
    isConfirming: boolean;
}

export function TipForm({ onSendTip, isSending, isConfirming }: TipFormProps) {
  const { address, isConnected } = useAccount();
  const { price: ethPrice } = useEthPrice();
  const [usdValue, setUsdValue] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<SuggestTipTokensOutput | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      tokenSymbol: 'ETH',
      message: '',
    },
  });

  const amountValue = form.watch('amount');
  const selectedTokenSymbol = form.watch('tokenSymbol');
  const messageValue = form.watch('message');
  const selectedToken = tokens.find(t => t.symbol === selectedTokenSymbol) || tokens[0];

  const { data: tokenBalance, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['tokenBalance', address, selectedToken.address],
    queryFn: () => getTokenBalance(address!, selectedToken.address!),
    enabled: !!address && !!selectedToken.address,
  });

  const formattedBalance = tokenBalance 
    ? parseFloat(formatUnits(BigInt(tokenBalance), selectedToken.decimals)).toFixed(4)
    : '0';
  
  const handleAiSuggest = async () => {
    if (!messageValue) return;
    setIsAiLoading(true);
    setAiSuggestions(null);
    try {
      const suggestions = await suggestTipTokens({ tokenDescription: messageValue });
      setAiSuggestions(suggestions);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (selectedToken.symbol === 'ETH' && ethPrice && amountValue) {
      const numericAmount = parseFloat(amountValue);
      if (!isNaN(numericAmount)) {
        setUsdValue((numericAmount * ethPrice).toFixed(2));
      } else {
        setUsdValue('');
      }
    } else {
      setUsdValue('');
    }
  }, [amountValue, ethPrice, selectedToken]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const token = tokens.find(t => t.symbol === values.tokenSymbol);
    if (!token) return;
    await onSendTip(values.amount, token, values.message);
    form.reset();
  }

  const isLoading = isSending || isConfirming;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="0.01" type="number" step="any" {...field} className="pr-20" />
                    {selectedToken.symbol === 'ETH' && usdValue && (
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
            name="tokenSymbol"
            render={({ field }) => (
              <FormItem className="sm:w-1/3">
                <FormLabel>Token</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a token" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        <div className="flex items-center gap-2">
                           <Coins className="w-4 h-4" /> 
                           <span>{token.symbol}</span>
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
        {selectedToken.address && isConnected && (
            <FormDescription>
                Your balance: {isLoadingBalance ? 'Loading...' : `${formattedBalance} ${selectedToken.symbol}`}
            </FormDescription>
        )}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Message (Optional)</FormLabel>
                <Button variant="ghost" size="sm" type="button" onClick={handleAiSuggest} disabled={!messageValue || isAiLoading}>
                  <Bot className="mr-2" /> {isAiLoading ? 'Thinking...' : 'Suggest Token'}
                </Button>
              </div>
              <FormControl>
                <Textarea
                  placeholder="Say something nice... or describe a token you want to find (e.g. 'a meme coin')"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {aiSuggestions && aiSuggestions.suggestedTokens.length > 0 && (
          <div className="p-3 bg-secondary rounded-md">
            <h4 className="font-semibold text-sm mb-2">AI Suggestions:</h4>
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.suggestedTokens.map((token) => {
                const tokenExists = tokens.some(t => t.symbol.toLowerCase() === token.toLowerCase());
                return (
                  <Button
                    key={token}
                    type="button"
                    variant={tokenExists ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => tokenExists && form.setValue('tokenSymbol', token.toUpperCase())}
                    disabled={!tokenExists}
                    title={!tokenExists ? `Token ${token} not supported` : `Select ${token}`}
                  >
                    {token.toUpperCase()}
                  </Button>
                )
              })}
            </div>
            {!aiSuggestions.suggestedTokens.some(t => tokens.some(ts => ts.symbol.toLowerCase() === t.toLowerCase())) && (
                <p className="text-xs text-muted-foreground mt-2">None of the suggested tokens are supported for tipping yet.</p>
            )}
          </div>
        )}
        
        <Button type="submit" className="w-full" size="lg" disabled={!isConnected || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isConfirming ? 'Confirming...' : 'Sending...'}
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send {form.getValues('amount') || 'Tip'} {selectedTokenSymbol}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
