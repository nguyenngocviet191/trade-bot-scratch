import { useState } from "react";

type PostOptions = {
  url: string;
  body?: any;
  headers?: Record<string, string>;
};

export function usePostRequest<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const post = async ({ url, body = {}, headers = {} }: PostOptions) => {
    console.log("Response Loading");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const json = await res.json();
      console.log("Response data:", json);
      setData(json);
      return json;
    } catch (err: any) {
      console.log("Response Error");
      setError(err.message || "Unknown error");
    } finally {
      console.log("Response Loading complete");
      setLoading(false);
    }
  };

  return { data, loading, error, post };
}