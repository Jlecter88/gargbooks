/**
 * Utilitário para compressão automática de imagens no cliente usando HTML Canvas.
 * Comprime qualquer imagem aceita (JPEG, PNG, WEBP, etc.) de até 10MB para
 * uma versão otimizada em JPEG com tamanho e qualidade controlados.
 */
export interface CompressionResult {
  base64: string;
  sizeOriginal: number;
  sizeCompressed: number;
  ratio: number; // Percentagem de redução de tamanho
}

export function compressImage(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.75
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    // Verifica se é uma imagem
    if (!file.type.startsWith("image/")) {
      reject(new Error("O arquivo selecionado não é uma imagem válida."));
      return;
    }

    const sizeOriginal = file.size;
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Calcula as novas dimensões mantendo o aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Cria o canvas e desenha a imagem escalada
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Não foi possível obter o contexto 2D do Canvas."));
          return;
        }

        // Desenha a imagem no canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Exporta como JPEG comprimida
        const base64 = canvas.toDataURL("image/jpeg", quality);

        // Estima o tamanho compactado a partir da string base64
        // A representação em base64 tem cerca de 33% a mais de caracteres do que os bytes reais
        const head = "data:image/jpeg;base64,";
        const base64Length = base64.length - head.length;
        const sizeCompressed = Math.round(base64Length * 0.75);

        const ratio = Math.round(((sizeOriginal - sizeCompressed) / sizeOriginal) * 100);

        resolve({
          base64,
          sizeOriginal,
          sizeCompressed,
          ratio: ratio > 0 ? ratio : 0,
        });
      };

      img.onerror = () => {
        reject(new Error("Falha ao carregar a imagem para processamento."));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Falha ao ler o arquivo de imagem."));
    };

    reader.readAsDataURL(file);
  });
}
