import { Waitlist } from "../models/Waitlist";
import { Notification } from "../models/Notification";
import { sendEmail } from "./email";
import { isSlotAvailable } from "./slots";
import { waitlistSpotOpenEmail } from "../emails/waitlist-spot-open";

/**
 * Call this whenever a booking is cancelled or moved off a date+slot, so
 * anyone waiting for that slot gets a chance at it. Re-checks real capacity
 * (rather than assuming exactly one spot freed) and only notifies as many
 * waiting entries as there's actually room for.
 */
export async function notifyWaitlistForSlot(date: string, slotId: string) {
  const waiting = await Waitlist.find({ date, slotId, status: "WAITING", deletedAt: null }).sort({
    createdAt: 1,
  });
  if (waiting.length === 0) return;

  for (const entry of waiting) {
    const seed = `${entry.categoryId}::${entry.equipmentId}`;
    const stillAvailable = await isSlotAvailable(date, slotId, seed);
    if (!stillAvailable) break;

    entry.status = "NOTIFIED";
    entry.notifiedAt = new Date();
    await entry.save();

    await Notification.create({
      userId: entry.userId,
      type: "waitlist_spot_open",
      title: "A slot opened up",
      message: `${entry.slotLabel} on ${date} is now available for ${entry.equipmentLabel}.`,
      href: "/book",
    });

    if (entry.contact?.email) {
      const email = waitlistSpotOpenEmail({
        date,
        slotLabel: entry.slotLabel,
        equipmentLabel: entry.equipmentLabel,
      });
      void sendEmail({
        to: entry.contact.email,
        subject: email.subject,
        html: email.html,
        template: "waitlist-spot-open",
      });
    }
  }
}
