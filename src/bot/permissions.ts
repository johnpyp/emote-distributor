import { UserError } from "./util";

export enum Permission {
  DISALLOWED,
  TransferOwnership,
  ListCluster,

  OverrideManager,
  DeleteManager,
  OverrideModerator,
  DeleteModerator,

  JoinCluster,
  LeaveCluster,
  CreateCluster,
  DeleteCluster,
  ClusterInfo,
  ClusterStatus,

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
  Permission.ClusterInfo,
  Permission.ListEmotes,
];
export const clusterModeratorPermissions = [
  ...anonymousPermissions,

  Permission.ClusterStatus,

  Permission.AddEmote,
  Permission.RemoveEmote,
  Permission.RenameEmote,
];
export const clusterManagerPermissions = [
  ...clusterModeratorPermissions,
  Permission.JoinCluster,
  Permission.LeaveCluster,
  Permission.OverrideModerator,
  Permission.DeleteModerator,
];

export const clusterOwnerPermissions = [
  ...clusterManagerPermissions,
  Permission.TransferOwnership,
  Permission.OverrideManager,
  Permission.DeleteManager,
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
