import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

// ---- Fernet decryption using Web Crypto API ----
function base64urlToBytes(b64: string): Uint8Array {
    const std = b64.replace(/-/g, '+').replace(/_/g, '/')
    const pad = std.length % 4 === 0 ? '' : '='.repeat(4 - (std.length % 4))
    const binary = atob(std + pad)
    return Uint8Array.from(binary, c => c.charCodeAt(0))
}

async function fernetDecrypt(key: string, token: string): Promise<string> {
    const keyBytes = base64urlToBytes(key)
    const signingKey = keyBytes.slice(0, 16)
    const encryptionKey = keyBytes.slice(16, 32)

    const tokenBytes = base64urlToBytes(token)
    const iv = tokenBytes.slice(9, 25)
    const ciphertext = tokenBytes.slice(25, tokenBytes.length - 32)
    const hmac = tokenBytes.slice(tokenBytes.length - 32)

    const hmacKey = await crypto.subtle.importKey(
        'raw', signingKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    )
    const dataToVerify = tokenBytes.slice(0, tokenBytes.length - 32)
    const valid = await crypto.subtle.verify('HMAC', hmacKey, hmac, dataToVerify)
    if (!valid) throw new Error('Fernet HMAC verification failed')

    const aesKey = await crypto.subtle.importKey(
        'raw', encryptionKey, { name: 'AES-CBC' }, false, ['decrypt']
    )
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv }, aesKey, ciphertext
    )

    return new TextDecoder().decode(decrypted)
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        const GMAIL_USER = Deno.env.get('GMAIL_USER')
        const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD')
        const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY')

        if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
            throw new Error('Gmail configuration (GMAIL_USER, GMAIL_APP_PASSWORD) is missing')
        }
        if (!ENCRYPTION_KEY) {
            throw new Error('ENCRYPTION_KEY is not configured')
        }

        // Get pending messages
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('status', 'scheduled')
            .lte('scheduled_date', new Date().toISOString())
            .limit(50)

        if (error) throw error

        if (!messages?.length) {
            return new Response(
                JSON.stringify({ sent: 0, message: 'No pending messages' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log(`Processing ${messages.length} messages...`)

        const client = new SMTPClient({
            connection: {
                hostname: "smtp.gmail.com",
                port: 465,
                tls: true,
                auth: {
                    username: GMAIL_USER,
                    password: GMAIL_APP_PASSWORD,
                },
            },
        });

        let sent = 0
        let failed = 0

        for (const msg of messages) {
            try {
                const decryptedContent = await fernetDecrypt(ENCRYPTION_KEY, msg.encrypted_content)
                const scheduledDate = new Date(msg.scheduled_date).toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                })

                const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 32px; background: #fafafa; border-radius: 12px; border: 1px solid #e2e8f0;">
              <h1 style="background: linear-gradient(to right, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; margin-bottom: 8px;">
                DearME 💌
              </h1>
              <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Scheduled for: ${scheduledDate}</p>
              
              <div style="background: white; padding: 24px; border-radius: 8px; border-left: 4px solid #a855f7; color: #1e293b; font-size: 16px; line-height: 1.6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                ${decryptedContent}
              </div>
              
              <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; text-align: center; font-style: italic;">
                Sent with love from your past self 🕊️
              </p>
            </div>
          `.trim();

                await client.send({
                    from: `DearME <${GMAIL_USER}>`,
                    to: msg.recipient_email,
                    subject: '📬 A message from your past self',
                    content: [
                        {
                            type: 'text/html; charset=utf-8',
                            content: emailHtml
                        }
                    ]
                });

                await supabase
                    .from('messages')
                    .update({ status: 'sent', sent_at: new Date().toISOString() })
                    .eq('id', msg.id)

                sent++
                console.log(`Message ${msg.id} sent to ${msg.recipient_email}`)

            } catch (msgError) {
                console.error(`Failed to process message ${msg.id}:`, msgError)
                await supabase
                    .from('messages')
                    .update({ status: 'failed' })
                    .eq('id', msg.id)
                failed++
            }
        }

        await client.close();

        return new Response(
            JSON.stringify({ sent, failed, total: messages.length }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Edge function error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
