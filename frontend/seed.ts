import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54421';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log("Seeding database...");

    // 1. Vehicles
    const vehiclesData = [
        { brand: 'Dacia', model: 'Logan', year: 2023, plate_number: '12345-A-50', fuel_type: 'Diesel', price_per_day: 350, deposit_amount: 3000, mileage: 15000, status: 'available' },
        { brand: 'Renault', model: 'Clio 5', year: 2024, plate_number: '67890-B-50', fuel_type: 'Essence', price_per_day: 450, deposit_amount: 4000, mileage: 5000, status: 'available' },
        { brand: 'Volkswagen', model: 'Golf 8', year: 2024, plate_number: '11223-C-50', fuel_type: 'Diesel', price_per_day: 750, deposit_amount: 6000, mileage: 2000, status: 'available' }
    ];

    for (const v of vehiclesData) {
        const { error } = await supabase.from('vehicles').insert(v);
        if (error && !error.message.includes('duplicate key')) console.error('Error vehicle:', error);
    }

    // 2. Customers
    const customersData = [
        { full_name: 'Mehdi El Alami', email: 'mehdi@example.com', phone: '0661223344', cin: 'AB123456', city: 'Casablanca', status: 'Actif' },
        { full_name: 'Sara Benani', email: 'sara@example.com', phone: '0662334455', cin: 'CD789012', city: 'Rabat', status: 'VIP' },
        { full_name: 'Omar Tazi', email: 'omar@example.com', phone: '0663445566', cin: 'EF345678', city: 'Tanger', status: 'Actif' }
    ];

    for (const c of customersData) {
        const { error } = await supabase.from('customers').insert(c);
        if (error && !error.message.includes('duplicate key')) console.error('Error customer:', error);
    }

    console.log("Checking if data already exists to insert reservations...");
    const { data: vList } = await supabase.from('vehicles').select('id').limit(2);
    const { data: cList } = await supabase.from('customers').select('id').limit(2);

    if (vList && vList.length > 0 && cList && cList.length > 0) {
        const today = new Date();
        const pastResas = [
            { customer_id: cList[0].id, vehicle_id: vList[0].id, start_date: new Date(today.getTime() - 15 * 86400000).toISOString().split('T')[0], end_date: new Date(today.getTime() - 10 * 86400000).toISOString().split('T')[0], total_price: 1500, status: 'completed', payment_status: 'paid' },
            { customer_id: cList[1].id, vehicle_id: vList[1].id, start_date: new Date(today.getTime() - 5 * 86400000).toISOString().split('T')[0], end_date: new Date(today.getTime() + 2 * 86400000).toISOString().split('T')[0], total_price: 3000, status: 'rented', payment_status: 'paid' },
            { customer_id: cList[0].id, vehicle_id: vList[0].id, start_date: new Date(today.getTime() - 2 * 86400000).toISOString().split('T')[0], end_date: new Date(today.getTime() + 5 * 86400000).toISOString().split('T')[0], total_price: 2500, status: 'confirmed', payment_status: 'pending' },
        ];

        for (const r of pastResas) {
            const { data: resData, error } = await supabase.from('reservations').insert(r).select().single();
            if (error) console.error('Error resa:', error);
            else if (resData) {
                // Insert transaction
                if (r.payment_status === 'paid') {
                    await supabase.from('transactions').insert({
                        reservation_id: resData.id,
                        customer_id: r.customer_id,
                        amount: r.total_price,
                        transaction_type: 'encaissement',
                        status: 'Payé',
                        transaction_date: r.start_date
                    });
                }
            }
        }
    }

    console.log("Seeding complete!");
}

seed();
