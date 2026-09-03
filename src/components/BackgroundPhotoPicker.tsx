"use client";

export function BackgroundPhotoPicker({
  backgroundUrl,
  onChange,
}: {
  backgroundUrl: string | null;
  onChange: (url: string | null) => void;
}) {
  const handleFile = (file: File | undefined) => {
    if (!file) return;
    onChange(URL.createObjectURL(file));
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="font-body text-xs text-muted">Fundo do Story (opcional)</p>
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          id="background-photo"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <label
          htmlFor="background-photo"
          className="cursor-pointer rounded-full border border-gold/50 px-4 py-2 font-body text-xs text-gold transition-colors hover:bg-gold/10"
        >
          🖼️ {backgroundUrl ? "Trocar foto" : "Usar uma foto"}
        </label>
        {backgroundUrl && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="font-body text-xs text-muted underline decoration-muted/40 underline-offset-4 hover:text-paper"
          >
            Usar padrão
          </button>
        )}
      </div>
    </div>
  );
}
