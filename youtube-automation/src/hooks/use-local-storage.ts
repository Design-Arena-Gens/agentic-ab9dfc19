'use client';

import { Dispatch, SetStateAction, useEffect, useState } from "react";

type Serializer<T> = (value: T) => string;
type Deserializer<T> = (value: string) => T;

const defaultSerializer = <T,>(value: T) => JSON.stringify(value);
const defaultDeserializer = <T,>(value: string) => JSON.parse(value) as T;

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  serializer: Serializer<T> = defaultSerializer,
  deserializer: Deserializer<T> = defaultDeserializer,
): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(deserializer(item));
      }
    } catch (error) {
      console.warn(`Failed to read localStorage key ${key}`, error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, serializer(storedValue));
    } catch (error) {
      console.warn(`Failed to write localStorage key ${key}`, error);
    }
  }, [key, serializer, storedValue]);

  return [storedValue, setStoredValue];
}
