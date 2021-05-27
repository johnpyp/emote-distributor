export class PrefixRouter<T> {
  private store = new Map<string, T | PrefixRouter<T>>();

  public set(key: string[], value: T): void {
    if (key.length < 1) throw new Error("No keys provided");
    const [firstKey, ...otherKeys] = key;
    if (otherKeys.length < 1) {
      this.store.set(firstKey, value);
      return;
    }
    if (!this.store.has(firstKey) || !(this.store.get(firstKey) instanceof PrefixRouter)) {
      this.store.set(firstKey, new PrefixRouter());
    }
    const nextRouter = this.store.get(firstKey) as PrefixRouter<T>;
    return nextRouter.set(otherKeys, value);
  }

  public delete(key: string[]): void {
    if (key.length < 1) throw new Error("No keys provided");
    const [firstKey, ...otherKeys] = key;
    if (otherKeys.length < 1) {
      this.store.delete(firstKey);
    }
    const nextRouter = this.store.get(firstKey);
    if (nextRouter && nextRouter instanceof PrefixRouter) {
      nextRouter.delete(otherKeys);
    }
  }

  public search(prefixKeys: string[], rec = false): T | T[] | undefined {
    if (prefixKeys.length < 1) return undefined;
    const [firstKey, ...otherKeys] = prefixKeys;
    const nextValue = this.store.get(firstKey);
    if (!nextValue) return rec ? this.toArray() : undefined;

    if (nextValue instanceof PrefixRouter) {
      if (otherKeys.length >= 1) return nextValue.search(otherKeys, true);
      return nextValue.toArray();
    }

    return nextValue;
  }

  public toArray(): T[] {
    return [...this.store.values()].flatMap((v) => (v instanceof PrefixRouter ? [] : v));
  }
}
