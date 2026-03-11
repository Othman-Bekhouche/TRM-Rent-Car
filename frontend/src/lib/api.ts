import { supabase } from './supabase';

// ===== TYPES =====
export interface Vehicle {
    id: string;
    brand: string;
    model: string;
    color: string;
    fuel_type: string;
    transmission: string;
    seats: number;
    doors: number;
    traction: string;
    year: number;
    plate_number: string;
    price_per_day: number;
    deposit_amount: number;
    mileage: number;
    status: 'available' | 'booked' | 'maintenance' | 'inactive' | 'rented';
    description: string;
    created_at: string;
    updated_at: string;
    // Maintenance fields
    last_oil_change_mileage?: number;
    next_oil_change_mileage?: number;
    last_service_mileage?: number;
    next_service_mileage?: number;
    // Images
    vehicle_images?: { id?: string; image_url: string; is_cover: boolean }[];
}

export interface Customer {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    cin: string;
    passport: string;
    address: string;
    city: string;
    total_spent: number;
    total_reservations: number;
    status: string;
    notes: string;
    created_at: string;
    updated_at: string;
}

export interface Reservation {
    id: string;
    reservation_number?: string;
    customer_id: string;
    vehicle_id: string;
    start_date: string;
    end_date: string;
    pickup_location: string;
    dropoff_location: string;
    total_price: number;
    status: 'pending' | 'confirmed' | 'rented' | 'returned' | 'completed' | 'cancelled' | 'rejected';
    payment_method: 'Espèces' | 'Carte' | 'Virement';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    notes: string;
    created_at: string;
    updated_at: string;
    // Joined
    customers?: Customer;
    vehicles?: Vehicle;
    handover?: HandoverRecord[]; // Supabase joins return array for HAS_ONE/HAS_MANY
}

export interface Infraction {
    id: string;
    vehicle_id: string;
    reservation_id: string | null;
    customer_id: string | null;
    infraction_type: string;
    infraction_date: string;
    infraction_time: string;
    city: string;
    location: string;
    authority_name: string;
    reference_number: string;
    fine_amount: number;
    description: string;
    admin_notes: string;
    document_url: string;
    status: string;
    created_at: string;
    updated_at: string;
    // Joined
    customer?: Customer;
    vehicle?: Vehicle;
    reservation?: Reservation;
}

export interface MaintenanceRecord {
    id: string;
    vehicle_id: string;
    maintenance_type: string;
    status: 'Planifié' | 'En cours' | 'Terminé' | 'Annulé';
    last_service_date: string;
    last_service_mileage: number;
    next_service_date: string;
    next_service_mileage: number;
    estimated_cost: number;
    actual_cost: number;
    vendor_name: string;
    notes: string;
    created_at: string;
    updated_at: string;
    // Joined
    vehicle?: Vehicle;
}

export interface MileageLog {
    id: string;
    vehicle_id: string;
    mileage_value: number;
    recorded_at: string;
    recorded_by: string;
    notes: string;
    // Joined
    vehicle?: Vehicle;
}

export interface MaintenanceAlert {
    id: string;
    vehicle_id: string;
    maintenance_record_id: string | null;
    alert_type: 'Mileage' | 'Date' | 'Document';
    alert_message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'active' | 'resolved';
    created_at: string;
    // Joined
    vehicle?: Vehicle;
}

export interface Transaction {
    id: string;
    reservation_id: string | null;
    customer_id: string | null;
    transaction_type: string;
    amount: number;
    payment_method: string;
    description: string;
    status: string;
    transaction_date: string;
    created_at: string;
    customer?: Customer;
}

export interface AdminUser {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    created_at: string;
    updated_at: string;
}

// ===== RENTAL OPERATIONS TYPES =====
export interface Invoice {
    id: string;
    reservation_id: string;
    invoice_number: string;
    invoice_date: string;
    subtotal: number;
    deposit_amount: number;
    extras_amount: number;
    total_amount: number;
    payment_status: string;
    pdf_url: string;
    created_at: string;
    updated_at: string;
}

export interface RentalContract {
    id: string;
    reservation_id: string;
    contract_number: string;
    contract_date: string;
    customer_id: string;
    vehicle_id: string;
    departure_mileage: number;
    return_mileage: number;
    fuel_level_departure: string;
    fuel_level_return: string;
    vehicle_condition_departure: string;
    vehicle_condition_return: string;
    total_amount: number;
    deposit_amount: number;
    contract_status: string;
    pdf_url: string;
    signed_at: string;
    created_at: string;
    updated_at: string;
}

export interface HandoverRecord {
    id: string;
    reservation_id: string;
    vehicle_id: string;
    customer_id: string;
    handover_date: string;
    departure_mileage: number;
    departure_fuel_level: string;
    departure_condition_notes: string;
    return_date: string;
    return_mileage: number;
    return_fuel_level: string;
    return_condition_notes: string;
    accessories_checklist: any;
    deposit_collected: boolean;
    payment_collected: boolean;
    extra_charges: number;
    admin_notes: string;
    created_at: string;
    updated_at: string;
}

export interface Quote {
    id: string;
    quote_number: string;
    customer_id: string;
    vehicle_id: string;
    start_date: string;
    end_date: string;
    pickup_location: string;
    dropoff_location: string;
    daily_rate: number;
    total_days: number;
    total_amount: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
    valid_until: string;
    notes: string;
    created_at: string;
    updated_at: string;
    // Joined
    customers?: Customer;
    vehicles?: Vehicle;
}

// ===== VEHICLES =====
export const vehiclesApi = {
    async getAll() {
        const { data, error } = await supabase.from('vehicles').select('*, vehicle_images(*)').order('created_at', { ascending: false });
        if (error) throw error;
        return data as Vehicle[];
    },
    async getById(id: string) {
        const { data, error } = await supabase.from('vehicles').select('*, vehicle_images(*)').eq('id', id).single();
        if (error) throw error;
        return data as Vehicle;
    },
    async create(vehicle: Partial<Vehicle>) {
        const { vehicle_images, ...vehicleData } = vehicle;
        const { data, error } = await supabase.from('vehicles').insert(vehicleData).select().single();
        if (error) throw error;

        if (vehicle_images && vehicle_images.length > 0) {
            const imagesToInsert = vehicle_images.map(img => ({ ...img, vehicle_id: data.id }));
            const { error: imgErr } = await supabase.from('vehicle_images').insert(imagesToInsert);
            if (imgErr) console.error("Error inserting images: ", imgErr);
        }
        return this.getById(data.id);
    },
    async update(id: string, updates: Partial<Vehicle>) {
        const { vehicle_images, ...vehicleData } = updates;
        const { data, error } = await supabase.from('vehicles').update(vehicleData).eq('id', id).select().single();
        if (error) throw error;

        if (vehicle_images !== undefined) { // allow clearing images
            // Delete old images
            await supabase.from('vehicle_images').delete().eq('vehicle_id', id);
            // Insert new ones
            if (vehicle_images.length > 0) {
                const imagesToInsert = vehicle_images.map(img => ({
                    image_url: img.image_url,
                    is_cover: img.is_cover,
                    vehicle_id: id
                }));
                const { error: imgErr } = await supabase.from('vehicle_images').insert(imagesToInsert);
                if (imgErr) console.error("Error inserting images: ", imgErr);
            }
        }
        return this.getById(data.id);
    },
    async delete(id: string) {
        const { error } = await supabase.from('vehicles').delete().eq('id', id);
        if (error) throw error;
    },
    async uploadImage(file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('vehicles')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('vehicles')
            .getPublicUrl(filePath);

        return publicUrl;
    }
};

// ===== CUSTOMERS =====
export const customersApi = {
    async getAll() {
        const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data as Customer[];
    },
    async getById(id: string) {
        const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
        if (error) throw error;
        return data as Customer;
    },
    async create(customer: Partial<Customer>) {
        const { data, error } = await supabase.from('customers').insert(customer).select().single();
        if (error) throw error;
        return data as Customer;
    },
    async update(id: string, updates: Partial<Customer>) {
        const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data as Customer;
    },
    async delete(id: string) {
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (error) throw error;
    },
};

// ===== RESERVATIONS =====
export const reservationsApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('reservations')
            .select('*, customers(*), vehicles(*), handover:rental_handover_records(*)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as (Reservation & { customers: Customer; vehicles: Vehicle })[];
    },
    async getById(id: string) {
        const { data, error } = await supabase
            .from('reservations')
            .select('*, customers(*), vehicles(*), handover:rental_handover_records(*)')
            .eq('id', id).single();
        if (error) throw error;
        return data as (Reservation & { customers: Customer; vehicles: Vehicle });
    },
    async create(reservation: Partial<Reservation>) {
        const { id, created_at, updated_at, customers, vehicles, handover, ...cleanData } = reservation as any;
        const { data, error } = await supabase.from('reservations').insert(cleanData).select().single();
        if (error) throw error;
        return data as Reservation;
    },
    async update(id: string, updates: Partial<Reservation>) {
        const { id: _, created_at, updated_at, customers, vehicles, handover, ...cleanUpdates } = updates as any;
        const { data, error } = await supabase.from('reservations').update(cleanUpdates).eq('id', id).select().single();
        if (error) throw error;
        return data as Reservation;
    },
    async delete(id: string) {
        const { error } = await supabase.from('reservations').delete().eq('id', id);
        if (error) throw error;
    },
    async findByVehicleAndDate(vehicleId: string, date: string) {
        const { data, error } = await supabase
            .from('reservations')
            .select('*, customers:customers(*), vehicles:vehicles(*)')
            .eq('vehicle_id', vehicleId)
            .lte('start_date', date)
            .gte('end_date', date);
        if (error) throw error;
        return data as Reservation[];
    },
};

// ===== INFRACTIONS =====
export const infractionsApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('infractions')
            .select('*, customer:customers(*), vehicle:vehicles(*)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as Infraction[];
    },
    async getById(id: string) {
        const { data, error } = await supabase
            .from('infractions')
            .select('*, customer:customers(*), vehicle:vehicles(*), reservation:reservations(*)')
            .eq('id', id).single();
        if (error) throw error;
        return data as Infraction;
    },
    async create(infraction: Partial<Infraction>) {
        const { id, created_at, updated_at, customer, vehicle, reservation, ...cleanData } = infraction as any;
        const { data, error } = await supabase.from('infractions').insert(cleanData).select().single();
        if (error) throw error;
        return data as Infraction;
    },
    async update(id: string, updates: Partial<Infraction>) {
        const { id: _, created_at, updated_at, customer, vehicle, reservation, ...cleanUpdates } = updates as any;
        const { data, error } = await supabase.from('infractions').update(cleanUpdates).eq('id', id).select().single();
        if (error) throw error;
        return data as Infraction;
    },
    async delete(id: string) {
        const { error } = await supabase.from('infractions').delete().eq('id', id);
        if (error) throw error;
    },
};

// ===== MAINTENANCE (New Version) =====
// Internal mapping to bridge Frontend naming with Backend naming
const mapToDB = (record: Partial<MaintenanceRecord>) => {
    // Labels mapping for enum
    const statusMap: Record<string, string> = {
        'Planifié': 'planned',
        'En cours': 'in_progress',
        'Terminé': 'completed',
        'Annulé': 'cancelled'
    };

    // Create DB object
    const { last_service_date, last_service_mileage, status, vehicle, ...rest } = record;
    return {
        ...rest,
        maintenance_date: last_service_date || undefined,
        mileage_at_maintenance: last_service_mileage || undefined,
        status: status ? (statusMap[status] || 'planned') : undefined,
        next_service_date: record.next_service_date || null,
        next_maintenance_date: record.next_service_date || null // use same for both in DB if needed
    };
};

const mapFromDB = (data: any): MaintenanceRecord => {
    const statusMapRev: Record<string, string> = {
        'planned': 'Planifié',
        'in_progress': 'En cours',
        'completed': 'Terminé',
        'cancelled': 'Annulé'
    };

    return {
        ...data,
        last_service_date: data.maintenance_date || data.last_service_date,
        last_service_mileage: data.mileage_at_maintenance || data.last_service_mileage,
        status: statusMapRev[data.status] || data.status || 'Planifié'
    } as MaintenanceRecord;
};

export const maintenanceApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('vehicle_maintenance_records')
            .select('*, vehicle:vehicles(*)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapFromDB);
    },
    async getByVehicleId(vId: string) {
        const { data, error } = await supabase
            .from('vehicle_maintenance_records')
            .select('*')
            .eq('vehicle_id', vId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapFromDB);
    },
    async create(record: Partial<MaintenanceRecord>) {
        const dbData = mapToDB(record);
        const { data, error } = await supabase.from('vehicle_maintenance_records').insert(dbData).select().single();
        if (error) throw error;
        return mapFromDB(data);
    },
    async update(id: string, updates: Partial<MaintenanceRecord>) {
        const dbData = mapToDB(updates);
        const { data, error } = await supabase.from('vehicle_maintenance_records').update(dbData).eq('id', id).select().single();
        if (error) throw error;
        return mapFromDB(data);
    },
    async delete(id: string) {
        const { error } = await supabase.from('vehicle_maintenance_records').delete().eq('id', id);
        if (error) throw error;
    },
};

// ===== MILEAGE LOGS =====
export const mileageApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('vehicle_mileage_logs')
            .select('*, vehicle:vehicles(*)')
            .order('recorded_at', { ascending: false });
        if (error) throw error;
        return data as MileageLog[];
    },
    async create(log: Partial<MileageLog>) {
        const { data, error } = await supabase.from('vehicle_mileage_logs').insert(log).select().single();
        if (error) throw error;

        // Also update vehicle's current mileage
        if (log.vehicle_id && log.mileage_value) {
            await supabase.from('vehicles').update({ mileage: log.mileage_value }).eq('id', log.vehicle_id);
        }

        return data as MileageLog;
    },
};

// ===== MAINTENANCE ALERTS =====
export const alertsApi = {
    async getAllActive() {
        const { data, error } = await supabase
            .from('maintenance_alerts')
            .select('*, vehicle:vehicles(*)')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as MaintenanceAlert[];
    },
    async resolve(id: string) {
        const { error } = await supabase.from('maintenance_alerts').update({ status: 'resolved' }).eq('id', id);
        if (error) throw error;
    },
};

// ===== TRANSACTIONS =====
export const transactionsApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('transactions')
            .select('*, customer:customers(*)')
            .order('transaction_date', { ascending: false });
        if (error) throw error;
        return data as Transaction[];
    },
    async create(transaction: Partial<Transaction>) {
        const { id, created_at, customer, ...cleanData } = transaction as any;
        const { data, error } = await supabase.from('transactions').insert(cleanData).select().single();
        if (error) throw error;
        return data as Transaction;
    },
    async update(id: string, updates: Partial<Transaction>) {
        const { id: _, created_at, customer, ...cleanUpdates } = updates as any;
        const { data, error } = await supabase.from('transactions').update(cleanUpdates).eq('id', id).select().single();
        if (error) throw error;
        return data as Transaction;
    },
    async delete(id: string) {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
    },
};

// ===== GPS TRACKING =====
export const gpsApi = {
    async getLatestPositions() {
        const { data, error } = await supabase
            .from('gps_tracking')
            .select('*, vehicle:vehicles(*)')
            .order('recorded_at', { ascending: false });
        if (error) throw error;
        return data;
    },
};

// ===== ADMIN USERS (profiles with admin role) =====
export const adminsApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .in('role', ['admin', 'super_admin', 'gestionnaire', 'assistant'])
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data as AdminUser[];
    },
    async update(id: string, updates: Partial<AdminUser>) {
        const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error("Aucun profil trouvé à mettre à jour");
        return data[0] as AdminUser;
    },
    async delete(id: string) {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
    },
};

// ===== AUTH =====
export const authApi = {
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },
    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },
    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },
};

// ===== DASHBOARD STATS =====
export const dashboardApi = {
    async getStats() {
        const [vehicles, customers, reservations, revenue] = await Promise.all([
            supabase.from('vehicles').select('id, status'),
            supabase.from('customers').select('id', { count: 'exact', head: true }),
            supabase.from('reservations').select('id, status', { count: 'exact' }),
            supabase.from('transactions').select('amount').eq('transaction_type', 'encaissement'),
        ]);
        return {
            totalVehicles: vehicles.data?.length || 0,
            availableVehicles: vehicles.data?.filter(v => v.status === 'available').length || 0,
            totalCustomers: customers.count || 0,
            totalReservations: reservations.data?.length || 0,
            activeReservations: reservations.data?.filter(r => r.status === 'confirmed').length || 0,
            totalRevenue: revenue.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0,
        };
    },
};

// ===== SETTINGS =====
export const settingsApi = {
    async get() {
        const { data, error } = await supabase.from('company_settings').select('*').single();
        if (error) throw error;
        return data;
    },
    async update(settingsData: any) {
        const { data, error } = await supabase.from('company_settings').update(settingsData).neq('id', '00000000-0000-0000-0000-000000000000').select().single();
        if (error) throw error;
        return data;
    }
};

// ===== NOTIFICATIONS =====
export const notificationsApi = {
    async getAll() {
        const { data, error } = await supabase.from('system_notifications').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    async markAsRead(id: string) {
        const { error } = await supabase.from('system_notifications').update({ is_read: true }).eq('id', id);
        if (error) throw error;
    },
    async markAllAsRead() {
        const { error } = await supabase.from('system_notifications').update({ is_read: true }).eq('is_read', false);
        if (error) throw error;
    }
};

// ===== RENTAL OPERATIONS APIs =====
export const invoicesApi = {
    async getAll() {
        const { data, error } = await supabase.from('reservations')
            .select(`
                *,
                customers(*),
                vehicles(*),
                invoices(*)
            `)
            .not('invoices', 'is', null)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data.filter(r => r.invoices && Object.keys(r.invoices).length > 0);
    },
    async getByReservation(reservationId: string) {
        const { data, error } = await supabase.from('invoices').select('*').eq('reservation_id', reservationId).maybeSingle();
        if (error) throw error;
        return data as Invoice | null;
    },
    async create(invoice: Partial<Invoice>) {
        const { id, created_at, updated_at, ...cleanData } = invoice as any;
        const { data, error } = await supabase.from('invoices').insert(cleanData).select().single();
        if (error) throw error;
        return data as Invoice;
    }
};

export const contractsApi = {
    async getAll() {
        // Fetch all reservations and their related contracts, so we have customer/vehicle details
        const { data, error } = await supabase.from('reservations')
            .select(`
                *,
                customers(*),
                vehicles(*),
                rental_contracts(*)
            `)
            .not('rental_contracts', 'is', null)
            .order('created_at', { ascending: false });
        if (error) throw error;
        // Filter out reservations that have no contract attached in the DB
        return data.filter(r => r.rental_contracts && Object.keys(r.rental_contracts).length > 0);
    },
    async getByReservation(reservationId: string) {
        const { data, error } = await supabase.from('rental_contracts').select('*').eq('reservation_id', reservationId).maybeSingle();
        if (error) throw error;
        return data as RentalContract | null;
    },
    async create(contract: Partial<RentalContract>) {
        const { id, created_at, updated_at, ...cleanData } = contract as any;
        const { data, error } = await supabase.from('rental_contracts').insert(cleanData).select().single();
        if (error) throw error;
        return data as RentalContract;
    }
};

export const handoversApi = {
    async getByReservation(reservationId: string) {
        const { data, error } = await supabase.from('rental_handover_records').select('*').eq('reservation_id', reservationId).maybeSingle();
        if (error) throw error;
        return data as HandoverRecord | null;
    },
    async create(handover: Partial<HandoverRecord>) {
        const { id, created_at, updated_at, ...cleanData } = handover as any;
        const { data, error } = await supabase.from('rental_handover_records').insert(cleanData).select().single();
        if (error) throw error;
        return data as HandoverRecord;
    },
    async update(id: string, updates: Partial<HandoverRecord>) {
        const { id: _, created_at, updated_at, ...cleanUpdates } = updates as any;
        const { data, error } = await supabase.from('rental_handover_records').update(cleanUpdates).eq('id', id).select().single();
        if (error) throw error;
        return data as HandoverRecord;
    }
};

export const quotesApi = {
    async getAll() {
        const { data, error } = await supabase.from('quotes')
            .select(`
                *,
                customers(*),
                vehicles(*)
            `)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as Quote[];
    },
    async getById(id: string) {
        const { data, error } = await supabase.from('quotes')
            .select(`
                *,
                customers(*),
                vehicles(*)
            `)
            .eq('id', id)
            .single();
        if (error) throw error;
        return data as Quote;
    },
    async create(quote: Partial<Quote>) {
        const { id, created_at, updated_at, customers, vehicles, ...cleanData } = quote as any;
        const { data, error } = await supabase.from('quotes').insert(cleanData).select().single();
        if (error) throw error;
        return data as Quote;
    },
    async update(id: string, updates: Partial<Quote>) {
        const { id: _, created_at, updated_at, customers, vehicles, ...cleanUpdates } = updates as any;
        const { data, error } = await supabase.from('quotes').update(cleanUpdates).eq('id', id).select().single();
        if (error) throw error;
        return data as Quote;
    },
    async delete(id: string) {
        const { error } = await supabase.from('quotes').delete().eq('id', id);
        if (error) throw error;
    }
};
