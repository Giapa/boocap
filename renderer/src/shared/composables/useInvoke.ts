import { ref, type Ref } from "vue";

interface InvokeResult<T> {
  data: Ref<T | null>;
  loading: Ref<boolean>;
  error: Ref<string>;
  execute: () => Promise<void>;
}

export function useInvoke<T>(fn: () => Promise<T>): InvokeResult<T> {
  const data = ref<T | null>(null) as Ref<T | null>;
  const loading = ref(false);
  const error = ref("");

  async function execute(): Promise<void> {
    loading.value = true;
    error.value = "";

    try {
      data.value = await fn();
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, execute };
}
