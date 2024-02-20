export function resolveAfter<T>(waitMs: number, value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), waitMs);
  });
}
