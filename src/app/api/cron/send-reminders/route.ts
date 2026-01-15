import { NextResponse } from "next/server";
import { db, plannedMeals, users } from "@/db";
import { eq, and, isNotNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Verify cron secret for security (optional but recommended)
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Find meals that need reminders sent
    // Get meals where:
    // - plannedDate is today
    // - reminderTime is set and <= current time
    // - reminderSent is 0
    const mealsToRemind = await db
      .select({
        meal: plannedMeals,
        userEmail: users.email,
        userName: users.name,
      })
      .from(plannedMeals)
      .innerJoin(users, eq(plannedMeals.userId, users.id))
      .where(
        and(
          isNotNull(plannedMeals.reminderTime),
          eq(plannedMeals.reminderSent, 0)
        )
      );

    const remindersToSend = mealsToRemind.filter((item) => {
      const mealDate = new Date(item.meal.plannedDate).toISOString().split("T")[0];
      const reminderTime = item.meal.reminderTime;
      return mealDate === today && reminderTime && reminderTime <= currentTime;
    });

    // Send email reminders
    const results = [];
    for (const item of remindersToSend) {
      try {
        // Send email using fetch to an email service
        // For now, we'll use a simple approach - you can integrate with SendGrid, Resend, etc.
        const emailSent = await sendReminderEmail({
          to: item.userEmail,
          userName: item.userName || "there",
          mealTitle: item.meal.title,
          mealType: item.meal.mealType,
          mealDescription: item.meal.description,
        });

        if (emailSent) {
          // Mark reminder as sent
          await db
            .update(plannedMeals)
            .set({ reminderSent: 1 })
            .where(eq(plannedMeals.id, item.meal.id));

          results.push({ mealId: item.meal.id, status: "sent" });
        }
      } catch (error) {
        console.error(`Failed to send reminder for meal ${item.meal.id}:`, error);
        results.push({ mealId: item.meal.id, status: "failed" });
      }
    }

    return NextResponse.json({
      message: `Processed ${remindersToSend.length} reminders`,
      results,
    });
  } catch (error) {
    console.error("Error in send-reminders cron:", error);
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}

async function sendReminderEmail({
  to,
  userName,
  mealTitle,
  mealType,
  mealDescription,
}: {
  to: string;
  userName: string;
  mealTitle: string;
  mealType: string;
  mealDescription?: string | null;
}) {
  // Check if Resend API key is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.log(`[Email Reminder] Would send to ${to}:`);
    console.log(`  Meal: ${mealTitle} (${mealType})`);
    console.log(`  Description: ${mealDescription || "N/A"}`);
    // Return true to mark as sent even without email service (for testing)
    return true;
  }

  const mealTypeLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "DietPrep <reminders@dietprep.app>",
        to: [to],
        subject: `🍽️ Meal Reminder: Time for ${mealTypeLabel}!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Hi ${userName}! 👋</h2>
            <p>This is a friendly reminder about your planned meal:</p>
            <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #065f46; margin: 0 0 8px 0;">${mealTitle}</h3>
              <p style="color: #047857; margin: 0; font-size: 14px;">
                <strong>${mealTypeLabel}</strong>
              </p>
              ${mealDescription ? `<p style="color: #6b7280; margin: 12px 0 0 0; font-size: 14px;">${mealDescription}</p>` : ""}
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Time to prepare your delicious meal! Stay on track with your nutrition goals. 💪
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #9ca3af; font-size: 12px;">
              This reminder was sent from DietPrep. You set this reminder when planning your meal.
            </p>
          </div>
        `,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    return false;
  }
}
