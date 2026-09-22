import { z } from "zod";

export const preferenceSnapshotSchema = z
  .object({
    destination: z.string().trim().min(1),
    total_days: z.number().int().positive(),
    start_date: z.string().date().optional(),
    end_date: z.string().date().optional(),
    pace: z.enum(["relaxed", "moderate", "packed"]),
    budget_level: z.enum(["budget", "standard", "luxury"]),
    accommodation_strategy: z.enum(["single_hotel", "switch_hotel"]),
    transit_mode: z.enum(["public_transit", "self_drive"]),
    interests: z.array(z.string().trim().min(1)),
    event_note: z.string().trim().min(1).optional(),
    selected_bundle: z.string().trim().min(1).optional(),
  })
  .strict()
  .superRefine((snapshot, context) => {
    if (snapshot.end_date && !snapshot.start_date) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["start_date"],
        message: "提供 end_date 時也必須提供 start_date。",
      });
    }

    if (
      snapshot.start_date &&
      snapshot.end_date &&
      snapshot.end_date < snapshot.start_date
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_date"],
        message: "end_date 不得早於 start_date。",
      });
    }
  });

export type ValidatedPreferenceSnapshot = z.infer<
  typeof preferenceSnapshotSchema
>;
