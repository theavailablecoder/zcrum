"use server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export const createProject = async (data) => {
  const { userId, orgId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }
  if (!orgId) {
    throw new Error("No organization Selected");
  }

  const { data: membership } =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  const userMembership = membership.find(
    (member) => member.publicUserData.userId === userId
  );

  if (!userMembership || userMembership.role !== "org:admin") {
    throw new Error("Only organization admins can create projects");
  }

  try {
    const project = await db.project.create({
      data: {
        name: data.name,
        key: data.key,
        description: data.description,
        organizationId: orgId,
      },
    });
    return project;
  } catch (error) {
    throw new Error("Error creating project: " + error.message);
  }
};

export async function getProjects(orgId) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }
  const projects = await db.project.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  return projects;
}

//delete project
export async function deleteProject(projectId) {
  const { userId, orgId, orgRole } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  if (orgRole !== "org:admin") {
    throw new Error("Only organization admins can delete projects");
  }
  const project = await db.project.findUnique({
    where: { id: projectId },
  });
  if (!project || project.organizationId !== orgId) {
    throw new Error(
      "Project not found or you don't have premission to delete it"
    );
  }
  await db.project.delete({
    where: { id: project.id },
  });

  return { success: true };
}

export async function getProject(projectId) {
  const { userId, orgId } = auth();
  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      sprints: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!project) {
    return null;
  }
  //verfiy if project is part of that org or not
  if (project.organizationId !== orgId) {
    return null;
  }
  return project; 
}
