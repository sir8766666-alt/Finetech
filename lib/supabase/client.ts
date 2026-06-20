import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    "https://ufzwcobwozeepazhtjpl.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmendjb2J3b3plZXBhemh0anBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NjgxMTAsImV4cCI6MjA5NzQ0NDExMH0.CJiuNVj6-zOonZghNZrG9uwW4xEE021F46KNgiuUDUg"
  );
}
