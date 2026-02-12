interface FooterProps {
  dict?: {
    copyright: string;
  };
}

export default function Footer({ dict }: FooterProps) {
  if (!dict) return null;

  return (
    <footer className="py-12 border-t border-white/10 text-center">
      <p className="text-white/40 text-sm font-light">
        &copy; {new Date().getFullYear()} {dict.copyright}
      </p>
    </footer>
  );
}
