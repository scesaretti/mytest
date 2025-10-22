import sys
import re

def clean_markdown(filename):
    try:
        with open(filename, "r", encoding="utf-8") as f:
            text = f.read()

        # 🔹 Rimozione code block multipli ```
        text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)

        # 🔹 Rimozione codice inline `
        text = re.sub(r'`([^`]*)`', r'\1', text)

        # 🔹 Rimozione titoli (# ... all'inizio riga)
        text = re.sub(r'^\s*#+\s*', '', text, flags=re.MULTILINE)

        # 🔹 Rimozione liste (-, *, + all'inizio riga)
        text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)

        # 🔹 Rimozione enfasi bold e italic (*, **, _, __)
        text = re.sub(r'(\*\*|__)(.*?)\1', r'\2', text)  # **bold** o __bold__
        text = re.sub(r'(\*|_)(.*?)\1', r'\2', text)      # *italic* o _italic_

        # 🔹 Rimozione link e immagini
        text = re.sub(r'!\[([^\]]*)\]\([^)]+\)', r'\1', text)  # immagini
        text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)   # link

        # 🔹 Rimozione separatori (---, ***)
        text = re.sub(r'^-{3,}\s*$', '', text, flags=re.MULTILINE)
        text = re.sub(r'^\*{3,}\s*$', '', text, flags=re.MULTILINE)

        # 🔹 Rimuove asterischi isolati rimasti
        text = text.replace("*", "")

        # Salva risultato
        output_file = filename.replace(".txt", "_clean.txt")
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(text)

        print(f"✅ File pulito salvato in: {output_file}")

    except FileNotFoundError:
        print(f"❌ Errore: il file '{filename}' non esiste.")
    except Exception as e:
        print(f"❌ Errore durante l'elaborazione: {e}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python script.py <file.txt>")
    else:
        clean_markdown(sys.argv[1])
