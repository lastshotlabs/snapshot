import { describe, expect, it } from "vitest";
import { communityContract, communityPath } from "../contract";

describe("communityContract", () => {
  it("describes the backend's flat named-operation routes", () => {
    expect(communityContract.listThreads).toEqual({
      method: "GET",
      path: "/community/threads/list-by-container/:containerId",
    });
    expect(communityContract.createThread).toEqual({
      method: "POST",
      path: "/community/threads",
    });
    expect(communityContract.publishThread).toEqual({
      method: "POST",
      path: "/community/threads/publish",
    });
    expect(communityContract.lockThread).toEqual({
      method: "PATCH",
      path: "/community/threads/lock",
    });
    expect(communityContract.listReplies).toEqual({
      method: "GET",
      path: "/community/replies/list-by-thread/:threadId",
    });
    expect(communityContract.addThreadReaction).toEqual({
      method: "POST",
      path: "/community/reactions",
    });
    expect(communityContract.removeReplyReaction).toEqual({
      method: "DELETE",
      path: "/community/reactions/:reactionId",
    });
  });

  it("describes membership roles and notification routes outside nested community paths", () => {
    expect(communityContract.listMembers.path).toBe(
      "/community/container-members",
    );
    expect(communityContract.listModerators.path).toBe(
      "/community/container-members/list-by-role/:containerId/moderator",
    );
    expect(communityContract.assignOwner).toEqual({
      method: "POST",
      path: "/community/container-members/assign-role",
    });
    expect(communityContract.listNotifications.path).toBe(
      "/notifications/notifications",
    );
    expect(communityContract.markNotificationRead).toEqual({
      method: "POST",
      path: "/notifications/notifications/mark-read",
    });
    expect(communityContract.dismissNotification).toEqual({
      method: "DELETE",
      path: "/notifications/notifications/:notificationId",
    });
  });

  it("uses real search and derived ban-check routes", () => {
    expect(communityContract.searchThreads.path).toBe(
      "/community/threads/search",
    );
    expect(communityContract.searchReplies.path).toBe(
      "/community/replies/search",
    );
    expect(communityContract.checkBan).toEqual(communityContract.listBans);
  });
});

describe("communityPath", () => {
  it("resolves and URL-encodes path parameters", () => {
    expect(
      communityPath(communityContract.getContainer, {
        containerId: "team/a b",
      }),
    ).toBe("/community/containers/team%2Fa%20b");
  });

  it("rejects missing required path parameters", () => {
    expect(() => communityPath(communityContract.getThread)).toThrow(
      "Missing community route parameter: threadId",
    );
  });
});
