import { UserError } from "./util";

export enum Permission {
  DISALLOWED,
  TransferOwnership,
  ListCluster,

  OverrideManager,
  OverrideModerator,

  JoinCluster,
  LeaveCluster,
  CreateCluster,
  DeleteCluster,
  ClusterStats,
  ClusterStaff,

  AddEmote,
  RemoveEmote,
  RenameEmote,
  ListEmotes,
}

export enum Roles {
  BotOwner = "BOT_OWNER",
  ClusterOwner = "CLUSTER_OWNER",
  ClusterManager = "CLUSTER_MANAGER",
  ClusterModerator = "CLUSTER_MODERATOR",
  Anonymous = "ANONYMOUS",
}

export const roleNames: Record<string, Roles> = {
  manager: Roles.ClusterManager,
  moderator: Roles.ClusterModerator,
  owner: Roles.BotOwner,
};

export const roleDisplaynames: Record<Roles, string> = {
  [Roles.BotOwner]: "Bot Owner",
  [Roles.ClusterOwner]: "Cluster Owner",
  [Roles.ClusterManager]: "Cluster Manager",
  [Roles.ClusterModerator]: "Cluster Moderator",
  [Roles.Anonymous]: "Anonymous user",
};

export const anonymousPermissions = [
  Permission.CreateCluster,
  Permission.ClusterStats,
  Permission.ClusterStaff,
  Permission.ListEmotes,
];
export const clusterModeratorPermissions = [
  ...anonymousPermissions,

  Permission.AddEmote,
  Permission.RemoveEmote,
  Permission.RenameEmote,
];
export const clusterManagerPermissions = [
  ...clusterModeratorPermissions,
  Permission.JoinCluster,
  Permission.LeaveCluster,
  Permission.OverrideModerator,
];

export const clusterOwnerPermissions = [
  ...clusterManagerPermissions,
  Permission.TransferOwnership,
  Permission.OverrideManager,
  Permission.DeleteCluster,
];

export const botOwnerPermissions = [...clusterOwnerPermissions, Permission.ListCluster];

export const permissionMap = {
  [Roles.ClusterOwner]: clusterOwnerPermissions,
  [Roles.ClusterManager]: clusterManagerPermissions,
  [Roles.ClusterModerator]: clusterModeratorPermissions,
  [Roles.Anonymous]: anonymousPermissions,
  [Roles.BotOwner]: botOwnerPermissions,
};

export const hierarchyMap = {
  [Roles.ClusterOwner]: 1,
  [Roles.ClusterManager]: 2,
  [Roles.ClusterModerator]: 3,
  [Roles.Anonymous]: 4,
  [Roles.BotOwner]: 5,
};

export function checkPermissions(role: Roles, permissions: Permission | Permission[]): boolean {
  const perms = Array.isArray(permissions) ? permissions : [permissions];

  const userPerms = permissionMap[role];

  return perms.every((perm) => userPerms.includes(perm));
}

export function guardPermissions(role: Roles, permissions: Permission | Permission[]): void {
  if (!checkPermissions(role, permissions)) {
    throw new UserError("Insufficient permissions");
  }
}
