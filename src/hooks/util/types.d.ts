export type SubscriptionState<T> = {
  data: T | null;
  isLoading: boolean;
  isError: string | null;
}
