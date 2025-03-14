"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function getOrganization(slug) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  //get organization details
  const organization = await clerkClient().organizations.getOrganization({
    slug,
  });

  //if organization not exist
  if (!organization) {
    return null;
  }

  //checking if user is member of organization or not
  const { data: membership } =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: organization.id,
    });

  const userMembership = membership.find(
    (member) => member.publicUserData.userId === userId
  );

  //if user is not a member of organization
  if (!userMembership) {
    return null;
  }

  return organization;
}

//get all organization user in kanban board
export async function   getOrganizationUsers(orgId) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }
  const organizationMemberShips =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });
  const userIds = organizationMemberShips.data.map(
    (membership) => membership.publicUserData.userId
  );

  const users = await db.user.findMany({
    where: {
      clerkUserId: {
        in: userIds,
      },
    },
  });
  return users;
}
