import { redirect } from "next/navigation";

/**
 * /learn → / (the Learn home). Avoids a 404 for users who type the
 * tab name directly. Module detail lives at /learn/[id].
 */
export default function LearnIndex() {
  redirect("/");
}
