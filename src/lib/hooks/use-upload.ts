import { useState } from "react";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Gera o hook tipado baseado no teu router
const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);

  // Inicializa o hook do UploadThing apontando para o endpoint 'imageUploader' definido no core.ts
  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => {
      setIsUploading(false);
    },
    onUploadError: (e) => {
      setIsUploading(false);
      console.error(e);
      throw e; // Lança o erro para ser capturado no componente
    },
    onUploadBegin: () => {
      setIsUploading(true);
    },
  });

  const uploadFile = async (): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      // 1. Criar um input de arquivo invisível na memória
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*"; // Aceitar apenas imagens

      // 2. Escutar quando o usuário seleciona um arquivo
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];

        if (!file) {
          reject(new Error("Nenhum arquivo selecionado."));
          return;
        }

        try {
          // 3. Iniciar o upload usando o hook do UploadThing
          const res = await startUpload([file]);

          // 4. Retornar a URL
          if (res && res[0]) {
            resolve(res[0].url);
          } else {
            resolve(null);
          }
        } catch (error) {
          reject(error);
        } finally {
          input.remove(); // Limpeza
        }
      };

      // 3. Simular o clique para abrir a janela de arquivos
      input.click();
    });
  };

  return {
    uploadFile,
    isLoading: isUploading
  };
}