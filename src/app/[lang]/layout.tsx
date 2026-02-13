
import Navbar from "@/components/Navbar";
import { DICTIONARY } from "@/constants";

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = params.lang === "zh" ? "zh" : "en";
  const dict = DICTIONARY[lang];

  return (
    <>
      <Navbar lang={lang} dict={dict.nav} />
      {children}
    </>
  );
}
