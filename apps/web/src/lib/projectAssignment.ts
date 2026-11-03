export type AssignableProject = {
  id: string;
  name?: string | null;
  projectId?: string | null;
  project_id?: string | null;
  clientName?: string | null;
  client_name?: string | null;
};

export function filterAssignableProjects<T extends AssignableProject>(projects: T[], query: string): T[] {
  const search = query.trim().toLocaleLowerCase();
  if (!search) return projects;

  return projects.filter((project) =>
    [project.name, project.projectId, project.project_id, project.clientName, project.client_name]
      .some((value) => value?.toLocaleLowerCase().includes(search)),
  );
}
