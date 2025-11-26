// ============================================================================
// SUPABASE EDGE FUNCTION - ENVIO DE EMAIL COM VOUCHER
// ============================================================================
// Arquivo: supabase/functions/send-voucher-email/index.ts
// Descrição: Edge Function para envio de emails com vouchers em PDF
// Migrado de: server/index.js (Express + Nodemailer)
// Data: 12/11/2025
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

// ============================================================================
// CONFIGURAÇÃO DE CORS
// ============================================================================
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================================================
// INTERFACES TYPESCRIPT
// ============================================================================

interface FormData {
  justificativa: string
  urgencia: string
  informacoesAdicionais: string
}

interface VoucherEmailRequest {
  destinatario: string
  nomeDestinatario?: string
  voucherNumber: string
  beneficios?: Array<{ title: string; value: string }>
  pdfBase64: string
  formData?: FormData
}

interface SuccessResponse {
  success: true
  message: string
  messageId?: string
}

interface ErrorResponse {
  success: false
  message: string
  error?: string
}

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📧 [Edge Function] Iniciando processamento de envio de email...')
    
    // Parse do body da requisição
    const body: VoucherEmailRequest = await req.json()
    const { destinatario, nomeDestinatario, voucherNumber, beneficios, pdfBase64 } = body

    console.log(`📨 [Edge Function] Destinatário: ${destinatario}`)
    console.log(`🎫 [Edge Function] Voucher: ${voucherNumber}`)

    // ========================================
    // VALIDAÇÕES
    // ========================================
    if (!destinatario || !voucherNumber || !pdfBase64) {
      console.error('❌ [Edge Function] Dados incompletos')
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Dados incompletos. Necessário: destinatario, voucherNumber e pdfBase64'
        } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // ========================================
    // TEMPLATE HTML DO EMAIL
    // ========================================
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voucher de Benefício Gerado</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header azul -->
          <tr>
            <td style="background: linear-gradient(to right, #1E3A8A, #2563EB); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                🎉 Voucher Gerado com Sucesso!
              </h1>
              <p style="color: #BFDBFE; margin: 10px 0 0 0; font-size: 16px;">
                Farmace Benefícios
              </p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #1F2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>${nomeDestinatario || 'Colaborador'}</strong>,
              </p>
              
              <p style="color: #1F2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Seu voucher de benefício foi gerado com sucesso! 🎊
              </p>

              <!-- Card de informações do voucher -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(to right, #EFF6FF, #DBEAFE); border: 2px solid #3B82F6; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <p style="color: #6B7280; font-size: 12px; margin: 0 0 5px 0;">
                      Número do Voucher
                    </p>
                    <p style="color: #1E3A8A; font-size: 24px; font-weight: bold; margin: 0 0 15px 0;">
                      ${voucherNumber}
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #6B7280; font-size: 14px; padding: 5px 0;">
                          <strong>Benefícios:</strong> ${beneficios?.length || 0} item(ns)
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6B7280; font-size: 14px; padding: 5px 0;">
                          <strong>Status:</strong> <span style="background-color: #D1FAE5; color: #065F46; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">Aprovado</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6B7280; font-size: 14px; padding: 5px 0;">
                          <strong>Data de geração:</strong> ${new Date().toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: #1F2937; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                O voucher em PDF está anexado a este email. Você pode imprimi-lo ou apresentá-lo digitalmente nos estabelecimentos parceiros.
              </p>

              <!-- Instruções -->
              <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #92400E; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>📌 Importante:</strong> Guarde este voucher com segurança. Ele será necessário para resgatar seus benefícios.
                </p>
              </div>

              ${beneficios && beneficios.length > 0 ? `
              <div style="margin: 30px 0;">
                <h3 style="color: #1F2937; font-size: 18px; margin: 0 0 15px 0;">
                  Benefícios Aprovados:
                </h3>
                ${beneficios.map(b => `
                  <div style="background-color: #F9FAFB; padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 3px solid #1E3A8A;">
                    <p style="color: #1F2937; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">
                      ${b.title}
                    </p>
                    <p style="color: #3B82F6; font-size: 13px; margin: 0;">
                      ${b.value}
                    </p>
                  </div>
                `).join('')}
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px 0;">
                Este é um email automático. Por favor, não responda.
              </p>
              <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Farmace Benefícios - SICFAR RH
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    console.log('📝 [Edge Function] Template HTML gerado')

    // ========================================
    // CONFIGURAÇÃO DO CLIENTE SMTP
    // ========================================
    console.log('🔧 [Edge Function] Configurando cliente SMTP...')
    
    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get('EMAIL_API_HOST')!,
        port: parseInt(Deno.env.get('EMAIL_API_PORTA')!),
        tls: true,
        auth: {
          username: Deno.env.get('EMAIL_API_USER')!,
          password: Deno.env.get('EMAIL_API_SENHA')!,
        },
      },
    })

    console.log(`📡 [Edge Function] SMTP configurado: ${Deno.env.get('EMAIL_API_HOST')}:${Deno.env.get('EMAIL_API_PORTA')}`)

    // ========================================
    // PREPARAÇÃO DO ANEXO PDF
    // ========================================
    console.log('📎 [Edge Function] Preparando anexo PDF...')
    
    const pdfContent = pdfBase64.includes('base64,') 
      ? pdfBase64.split('base64,')[1] 
      : pdfBase64

    // ========================================
    // ENVIO DO EMAIL
    // ========================================
    console.log('📧 [Edge Function] Enviando email...')
    
    await client.send({
      from: `SICFAR - Farmace Benefícios <${Deno.env.get('EMAIL_API')}>`,
      to: destinatario,
      subject: `✅ Voucher de Benefício Gerado - ${voucherNumber}`,
      html: htmlTemplate,
      attachments: [
        {
          filename: `Voucher_${voucherNumber}.pdf`,
          content: pdfContent,
          encoding: 'base64',
        },
      ],
    })

    await client.close()

    console.log('✅ [Edge Function] Email enviado com sucesso!')

    // ========================================
    // RESPOSTA DE SUCESSO
    // ========================================
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email enviado com sucesso',
        messageId: `${voucherNumber}-${Date.now()}`
      } as SuccessResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    // ========================================
    // TRATAMENTO DE ERROS
    // ========================================
    console.error('❌ [Edge Function] Erro ao enviar email:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Erro ao enviar email',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      } as ErrorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

