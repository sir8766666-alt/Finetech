import { createClient } from "@/lib/supabase/server";
import { ProjectsClient } from "./projects-client";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return <ProjectsClient initialProjects={projects || []} />;
}
