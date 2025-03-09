import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const strategySchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  strategy: z.enum(["MA", "RSI", "BOLLINGER"]),
  period: z.coerce.number().min(1).max(200),
  timeframe: z.enum(["1h", "4h", "1d"]),
});

type StrategyFormData = z.infer<typeof strategySchema>;

interface StrategyFormProps {
  onSubmit: (data: StrategyFormData) => void;
  isLoading?: boolean;
}

export function StrategyForm({ onSubmit, isLoading }: StrategyFormProps) {
  const form = useForm<StrategyFormData>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      symbol: "BTC",
      strategy: "MA",
      period: 14,
      timeframe: "1d",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbol</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="strategy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Strategy</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a strategy" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MA">Moving Average</SelectItem>
                  <SelectItem value="RSI">RSI</SelectItem>
                  <SelectItem value="BOLLINGER">Bollinger Bands</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Period</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>
                Number of periods for the strategy calculation
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeframe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timeframe</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a timeframe" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="4h">4 Hours</SelectItem>
                  <SelectItem value="1d">1 Day</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Loading..." : "Run Strategy"}
        </Button>
      </form>
    </Form>
  );
}
