import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54421';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const id = '1dba5da0-f411-4aee-9ae3-721f6dc8baf1';
    try {
        const [resData, conData, invData, handData] = await Promise.all([
            // reservationsApi.getById
            supabase.from('reservations').select('*, customers(*), vehicles(*), handover:rental_handover_records(*)').eq('id', id).single().then(({ data, error }) => { if (error) throw error; return data; }),
            // contractsApi.getByReservation
            supabase.from('rental_contracts').select('*').eq('reservation_id', id).limit(1).maybeSingle().then(({ data, error }) => { if (error) throw error; return data; }),
            // invoicesApi.getByReservation
            supabase.from('invoices').select('*').eq('reservation_id', id).limit(1).maybeSingle().then(({ data, error }) => { if (error) throw error; return data; }),
            // handoversApi.getByReservation
            supabase.from('rental_handover_records').select('*').eq('reservation_id', id).limit(1).maybeSingle().then(({ data, error }) => { if (error) throw error; return data; })
        ]);
        console.log("SUCCESS");
    } catch (e) {
        console.error("ERROR CAUGHT:");
        console.error(e);
    }
}

test();
