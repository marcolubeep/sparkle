import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const signature = req.headers.get("stripe-signature")
  const body = await req.text()

  // 1. Verifica che la chiamata arrivi davvero da Stripe
  // 2. Se l'evento è 'checkout.session.completed':
  const event = JSON.parse(body)
  const session = event.data.object
  
  // 3. Salva la prenotazione nel DB Supabase solo ORA
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  await supabase.from('bookings').insert({
    name: session.customer_details.name,
    email: session.customer_email,
    status: 'paid',
    ref: session.client_reference_id
  })

  return new Response("OK", { status: 200 })
})
