import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// ---- Fernet decryption using Web Crypto API ----
// Fernet key = base64url(signing_key[16] + encryption_key[16])
// Fernet token = base64url(version[1] + timestamp[8] + iv[16] + ciphertext[n] + hmac[32])

function base64urlToBytes(b64: string): Uint8Array {
    // Fernet uses base64url encoding (RFC 4648 §5)
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
    // version (1) + timestamp (8) + iv (16) + ciphertext (variable) + hmac (32)
    const iv = tokenBytes.slice(9, 25)
    const ciphertext = tokenBytes.slice(25, tokenBytes.length - 32)
    const hmac = tokenBytes.slice(tokenBytes.length - 32)

    // Verify HMAC-SHA256
    const hmacKey = await crypto.subtle.importKey(
        'raw', signingKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    )
    const dataToVerify = tokenBytes.slice(0, tokenBytes.length - 32)
    const valid = await crypto.subtle.verify('HMAC', hmacKey, hmac, dataToVerify)
    if (!valid) throw new Error('Fernet HMAC verification failed')

    // Decrypt AES-128-CBC
    const aesKey = await crypto.subtle.importKey(
        'raw', encryptionKey, { name: 'AES-CBC' }, false, ['decrypt']
    )
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv }, aesKey, ciphertext
    )

    return new TextDecoder().decode(decrypted)
}
// ---- End Fernet implementation ----

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Initialize Supabase client with service role
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
        if (!RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not configured')
        }

        const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY')
        if (!ENCRYPTION_KEY) {
            throw new Error('ENCRYPTION_KEY is not configured')
        }

        // Get pending messages where scheduled_date has passed
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('status', 'scheduled')
            .lte('scheduled_date', new Date().toISOString())
            .limit(50)  // Process in batches to avoid timeouts

        if (error) {
            console.error('Database query error:', error)
            throw error
        }

        if (!messages?.length) {
            console.log('No pending messages to send')
            return new Response(
                JSON.stringify({ sent: 0, message: 'No pending messages' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log(`Found ${messages.length} messages to send`)

        let sent = 0
        let failed = 0

        for (const msg of messages) {
            try {
                // Decrypt the message content
                const decryptedContent = await fernetDecrypt(ENCRYPTION_KEY, msg.encrypted_content)
                const sentDate = new Date(msg.scheduled_date).toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                })

                // Send email via Resend (using test sender for now)
                const emailRes = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${RESEND_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: 'DearME <onboarding@resend.dev>',  // Resend test sender
                        to: msg.recipient_email,
                        subject: '💌 Your time-locked message is here!',
                        html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                  .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
                  .message-box { background: white; padding: 25px; border-radius: 8px; border-left: 5px solid #667eea; margin: 25px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
                  .msg-text { font-size: 16px; white-space: pre-wrap; color: #2d3748; }
                  .meta { font-size: 13px; color: #718096; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
                  .footer { text-align: center; color: #a0aec0; font-size: 12px; margin-top: 30px; }
                  .logo-text { font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -1px; }
                  .subtitle { margin: 5px 0 0; opacity: 0.9; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 class="logo-text">DearME</h1>
                    <p class="subtitle">Future You says Hello</p>
                  </div>
                  <div class="content">
                    <p>Good news! A message scheduled for <strong>${sentDate}</strong> has just been unlocked.</p>
                    
                    <div class="message-box">
                      <div class="meta">Your Message:</div>
                      <div class="msg-text">${decryptedContent}</div>
                    </div>
                    
                    <p>We hope this message finds you well!</p>
                  </div>
                  <div class="footer">
                    <p>Sent via DearME - Secure Time-Locked Messaging</p>
                  </div>
                </div>
              </body>
              </html>
            `,
                    }),
                })

                if (emailRes.ok) {
                    // Update message status to sent
                    const { error: updateError } = await supabase
                        .from('messages')
                        .update({
                            status: 'sent',
                            sent_at: new Date().toISOString()
                        })
                        .eq('id', msg.id)

                    if (updateError) {
                        console.error(`Failed to update message ${msg.id}:`, updateError)
                    } else {
                        sent++
                        console.log(`Successfully sent message ${msg.id} to ${msg.recipient_email}`)
                    }
                } else {
                    const errorText = await emailRes.text()
                    console.error(`Resend API error for message ${msg.id}:`, errorText)

                    // Mark as failed
                    await supabase
                        .from('messages')
                        .update({ status: 'failed' })
                        .eq('id', msg.id)
                    failed++
                }
            } catch (msgError) {
                console.error(`Error processing message ${msg.id}:`, msgError)

                // Mark as failed
                await supabase
                    .from('messages')
                    .update({ status: 'failed' })
                    .eq('id', msg.id)
                failed++
            }
        }

        const result = {
            sent,
            failed,
            total: messages.length,
            timestamp: new Date().toISOString()
        }

        console.log('Batch complete:', result)

        return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Edge function error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
