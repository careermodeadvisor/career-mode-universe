import { supabase } from "@/lib/supabase";

export function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function getOrCreateMonthlyUsage(userId: string) {
  const month = getCurrentMonthKey();

  const { data: existing } = await supabase
    .from("usage_limits")
    .select("*")
    .eq("user_id", userId)
    .eq("month", month)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("usage_limits")
    .insert({
      user_id: userId,
      month,
      squad_iq_used: 0,
      regen_used: 0,
      career_ideas_used: 0,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
export async function incrementUsage(
  userId: string,
  field: "squad_iq_used" | "regen_used" | "career_ideas_used"
) {
  const usage = await getOrCreateMonthlyUsage(userId);

  const currentValue = usage[field] || 0;

  const { data, error } = await supabase
    .from("usage_limits")
    .update({
      [field]: currentValue + 1,
    })
    .eq("id", usage.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}