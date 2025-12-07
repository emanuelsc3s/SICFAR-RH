import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { LucideIcon } from 'lucide-react';

// Interfaces exportadas para uso em outros arquivos
export interface Beneficio {
  id: string;
  title: string;
  description: string;
  value: string;
  icon?: LucideIcon;
}

export interface FormData {
  justificativa: string;
  urgencia: string;
}

export interface VoucherData {
  voucherNumber: string;
  beneficios: Beneficio[];
  formData: FormData;
  qrCodeUrl: string;
  colaborador?: {
    nome: string;
    matricula: string;
    email: string;
  };
}

export interface VoucherDocumentProps {
  data: VoucherData;
  dataGeracao: string;
  dataValidade: string;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#F3F4F6',
    padding: 24,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111827'
  },
  header: {
    backgroundColor: '#1E3A8A',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#BFDBFE',
    marginBottom: 2
  },
  headerMeta: {
    fontSize: 9,
    color: '#93C5FD'
  },
  messageBox: {
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    borderLeft: '4px solid #10B981'
  },
  messageTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 2
  },
  messageSubtitle: {
    fontSize: 10,
    color: '#047857'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  label: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 4
  },
  voucherNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
    letterSpacing: 1
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8
  },
  tag: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold'
  },
  metaText: {
    fontSize: 9,
    color: '#6B7280'
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  qrWrapper: {
    alignItems: 'center'
  },
  qr: {
    width: 80,
    height: 80,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  qrCaption: {
    fontSize: 8,
    color: '#9CA3AF',
    marginTop: 4
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 6
  },
  benefitItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1E3A8A'
  },
  benefitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  benefitTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827'
  },
  benefitValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669'
  },
  benefitDescription: {
    fontSize: 9,
    color: '#6B7280'
  },
  detailBlock: {
    marginBottom: 8
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2
  },
  detailText: {
    fontSize: 9,
    color: '#6B7280'
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 'auto'
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2
  }
});

const VoucherDocument = ({ data, dataGeracao, dataValidade }: VoucherDocumentProps) => {
  const { voucherNumber, beneficios, formData, qrCodeUrl, colaborador } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={styles.headerTitle}>Voucher Gerado</Text>
          <Text style={styles.headerSubtitle}>Farmace Benefícios</Text>
          <Text style={styles.headerMeta}>Data de geração: {dataGeracao}</Text>
          {colaborador?.nome && (
            <Text style={styles.headerMeta}>
              {`Colaborador: ${colaborador.nome}${colaborador.matricula ? ` • Matrícula: ${colaborador.matricula}` : ''}`}
            </Text>
          )}
        </View>

        <View style={styles.messageBox}>
          <Text style={styles.messageTitle}>Parabéns! Seu voucher foi aprovado!</Text>
          <Text style={styles.messageSubtitle}>Utilize as informações abaixo para resgatar seus benefícios</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Número do Voucher</Text>
          <Text style={styles.voucherNumber}>{voucherNumber}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.tag}>Aprovado</Text>
            <Text style={styles.metaText}>Benefícios: {beneficios.length}</Text>
            <Text style={styles.metaText}>Validade: {dataValidade}</Text>
          </View>

          {qrCodeUrl ? (
            <View style={styles.qrRow}>
              <View style={styles.qrWrapper}>
                <Image src={qrCodeUrl} style={styles.qr} />
                <Text style={styles.qrCaption}>Escaneie para validar</Text>
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.metaText}>Apresente este QR Code para validação e resgate.</Text>
                <Text style={styles.metaText}>Número do voucher: {voucherNumber}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.section} wrap>
          <Text style={styles.sectionTitle}>Benefícios Aprovados</Text>
          {beneficios.map((beneficio, index) => (
            <View key={`${beneficio.id}-${index}`} style={styles.benefitItem}>
              <View style={styles.benefitHeader}>
                <Text style={styles.benefitTitle}>{beneficio.title}</Text>
                <Text style={styles.benefitValue}>{beneficio.value}</Text>
              </View>
              <Text style={styles.benefitDescription}>{beneficio.description}</Text>
            </View>
          ))}
          {beneficios.length === 0 ? <Text style={styles.metaText}>Nenhum benefício selecionado.</Text> : null}
        </View>

        {(formData.justificativa || formData.urgencia) && (
          <View style={styles.section} wrap>
            <Text style={styles.sectionTitle}>Detalhes da Solicitação</Text>

            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>Data</Text>
              <Text style={styles.detailText}>{dataGeracao}</Text>
            </View>

            {formData.urgencia ? (
              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Urgência</Text>
                <Text style={styles.detailText}>{formData.urgencia}</Text>
              </View>
            ) : null}

            {formData.justificativa ? (
              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Justificativa</Text>
                <Text style={styles.detailText}>{formData.justificativa}</Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Este voucher é válido apenas para os benefícios listados acima.</Text>
          <Text style={styles.footerText}>© {new Date().getFullYear()} Farmace Benefícios - SICFAR RH</Text>
        </View>
      </Page>
    </Document>
  );
};

export default VoucherDocument;

