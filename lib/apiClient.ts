// export interface ApiOptions extends RequestInit {
//   revalidate?: number;
// }

// export async function api<T>(
//   path: string,
//   options: ApiOptions = {},
// ): Promise<T> {
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}${path}`,
//     {
//       ...options,
//       headers: {
//         'Content-Type': 'application/json',
//         ...(options.headers || {}),
//         Authorization: `Bearer ${process.env.API_TOKEN ?? ''}`,
//       },
//       next: options.revalidate
//         ? { revalidate: options.revalidate }
//         : undefined,
//     },
//   );

//   if (!res.ok) {
//     const msg = await res.text();
//     throw new Error(`Erro ${res.status}: ${msg}`);
//   }

//   return res.json() as Promise<T>;
// }
