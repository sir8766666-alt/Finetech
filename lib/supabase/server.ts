import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    "https://ufzwcobwozeepazhtjpl.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmendjb2J3b3plZXBhemh0anBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NjgxMTAsImV4cCI6MjA5NzQ0NDExMH0.CJiuNVj6-zOonZghNZrG9uwW4xEE021F46KNgiuUDUg",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component - ignore
          }
        },
      },
    }
  );
}
