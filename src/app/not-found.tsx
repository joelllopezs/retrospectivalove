import Link from "next/link";
import { WaxSeal } from "@/components/WaxSeal";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <WaxSeal className="mb-5 h-12 w-12" />
      <p className="font-display text-2xl italic text-paper">Essa retrospectiva não existe</p>
      <p className="mt-3 max-w-sm font-body text-sm text-muted">
        O link pode estar errado, ou a retrospectiva pode ter sido removida.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-rose px-6 py-2.5 font-body text-sm font-semibold text-paper transition-colors hover:bg-rose-soft"
      >
        Criar a minha retrospectiva
      </Link>
    </main>
  );
}
