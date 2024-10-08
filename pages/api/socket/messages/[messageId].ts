import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "DELETE" && req.method !== "PATCH") {
    return res.status(405).json({
      error: "Methode not allowed",
    });
  }

  try {
    const profile = await currentProfilePages(req);
    const { messageId, serverId, channelId } = req.query;
    const { content } = req.body;
    if (!profile) {
      return res.status(401).json({ error: "Unautharized" });
    }
    if (!serverId) {
      return res.status(400).json({ error: "server id missing" });
    }
    if (!channelId) {
      return res.status(400).json({ error: "channel id missing" });
    }
    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });
    if (!server) {
      return res.status(404).json({ error: "server not found" });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      },
    });
    if (!channel) {
      return res.status(404).json({ error: "channel not found" });
    }
    //me
    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member) {
      return res.status(404).json({ error: "member not found" });
    }

    let message = await db.message.findFirst({
      where: {
        id: messageId as string,
        channelId: channelId as string,
      },
      include: {
        member: {
          include: { profile: true }, //member corresponding to message
        },
      },
    });
    if (!message || message.deleted) {
      return res.status(404).json({ error: "message not found" });
    }

    const isMessageOwner = message.memberId === member.id; //if we are the owner
    const isAdmin = member.role === MemberRole.ADMIN; //if we are the admin
    const isModerator = member.role === MemberRole.MODERATOR; //if we are the moderator
    const canModify = isMessageOwner || isAdmin || isModerator; //if we have the ability to modify

    if (!canModify) {
      return res.status(401).json({ error: "Unautharized" });
    }

    if (req.method === "DELETE") {
      message = await db.message.update({
        where: {
          id: messageId as string,
        },
        data: {
          fileUrl: null,
          content: "This message has been Deleted",
          deleted: true,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }
    if (req.method === "PATCH") {
      if (!isMessageOwner) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      message = await db.message.update({
        where: {
          id: messageId as string,
        },
        data: {
          content,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }

    const updateKey = `chat:${channelId}:messages:update`;

    res?.socket?.server?.io?.emit(updateKey, message);
    return res.status(200).json(message);
  } catch (error) {
    console.log(" [MESSAGE_ID]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}
