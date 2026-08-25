import { User, type UserDoc } from "../models/User";
import { generateShortCode } from "./codes";
import { awardLoyaltyPoints } from "./loyalty";

const REFERRER_BONUS = 50;
const REFEREE_BONUS = 25;

export async function assignReferralCode(user: UserDoc) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateShortCode(6);
    const clash = await User.exists({ referralCode: code });
    if (!clash) {
      user.referralCode = code;
      await user.save();
      return code;
    }
  }
  throw new Error("Could not generate a unique referral code");
}

export async function applyReferralCode(newUser: UserDoc, referralCode?: string) {
  if (!referralCode) return;

  const referrer = await User.findOne({ referralCode });
  if (!referrer || referrer.id === newUser.id) return;

  newUser.referredBy = referrer._id;
  await newUser.save();

  await awardLoyaltyPoints({
    userId: referrer.id,
    amount: REFERRER_BONUS,
    reason: "referral_bonus",
    description: `${newUser.name} joined using your referral code`,
  });
  await awardLoyaltyPoints({
    userId: newUser.id,
    amount: REFEREE_BONUS,
    reason: "referral_welcome",
    description: "Welcome bonus for joining via a referral",
  });
}
