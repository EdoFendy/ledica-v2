import { headers } from "next/headers";
import { Shell } from "@/components/Shell";
import { NotFoundView } from "@/views/Misc";

export default async function NotFound() {
  const lang = (await headers()).get("x-lang") === "en" ? "en" : "it";
  return <Shell lang={lang} alt={lang === "en" ? "/" : "/en"}><NotFoundView lang={lang} /></Shell>;
}
