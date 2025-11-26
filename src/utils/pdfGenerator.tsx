import { pdf } from '@react-pdf/renderer';
import VoucherDocument, { VoucherData } from '@/components/pdf/VoucherDocument';

// Re-exporta os tipos para uso externo
export type { VoucherData, Beneficio, FormData } from '@/components/pdf/VoucherDocument';

/**
 * Converte um Blob para base64 data URL
 */
const blobToBase64 = async (blob: Blob): Promise<string> => {
  const buffer = await blob.arrayBuffer();

  if (typeof Buffer !== 'undefined') {
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:application/pdf;base64,${base64}`;
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000; // evita estouro de call stack para PDFs maiores

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  const base64 = btoa(binary);
  return `data:application/pdf;base64,${base64}`;
};

/**
 * Gera um PDF do voucher de benefício em formato base64 usando @react-pdf/renderer
 * @param data Dados do voucher
 * @returns PDF em data URL base64
 */
export const generateVoucherPDF = async (data: VoucherData): Promise<string> => {
  const dataGeracao = new Date().toLocaleDateString('pt-BR');
  const dataValidade = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');

  const document = <VoucherDocument data={data} dataGeracao={dataGeracao} dataValidade={dataValidade} />;
  const pdfInstance = pdf(document);
  const pdfBlob = await pdfInstance.toBlob();

  return blobToBase64(pdfBlob);
};
