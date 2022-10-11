export function omit<T extends Record<string, any>, P extends keyof T>(
  data: T,
  keys: P[],
): Omit<T, P> {
  return Object.entries(data).reduce((result, [key, value]) => {
    if (!keys.includes(key as P)) {
      result[key] = value;
    }

    return result;
  }, {} as Record<string, any>) as Omit<T, P>;
}
