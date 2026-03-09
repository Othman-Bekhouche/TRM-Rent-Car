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
    status: 'available' | 'booked' | 'maintenance' | 'inactive';
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
    status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';
    payment_method: 'Espèces' | 'Carte' | 'Virement';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    notes: string;
    created_at: string;
    updated_at: string;
    // Joined
    customers?: Customer;
    vehicles?: Vehicle;
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
            .select('*, customers:customers(*), vehicles:vehicles(*)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as Reservation[];
    },
    async getById(id: string) {
        const { data, error } = await supabase
            .from('reservations')
            .select('*, customers:customers(*), vehicles:vehicles(*)')
            .eq('id', id).single();
        if (error) throw error;
        return data as Reservation;
    },
    async create(reservation: Partial<Reservation>) {
        const { data, error } = await supabase.from('reservations').insert(reservation).select().single();
        if (error) throw error;
        return data as Reservation;
    },
    async update(id: string, updates: Partial<Reservation>) {
        const { data, error } = await supabase.from('reservations').update(updates).eq('id', id).select().single();
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
            .select('*, customers:customers(*), vehicles:vehicles(*)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as Infraction[];
    },
    async getById(id: string) {
        const { data, error } = await supabase
            .from('infractions')
            .select('*, customers:customers(*), vehicles:vehicles(*), reservations:reservations(*)')
            .eq('id', id).single();
        if (error) throw error;
        return data as Infraction;
    },
    async create(infraction: Partial<Infraction>) {
        const { data, error } = await supabase.from('infractions').insert(infraction).select().single();
        if (error) throw error;
        return data as Infraction;
    },
    async update(id: string, updates: Partial<Infraction>) {
        const { data, error } = await supabase.from('infractions').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data as Infraction;
    },
    async delete(id: string) {
        const { error } = await supabase.from('infractions').delete().eq('id', id);
        if (error) throw error;
    },
};

// ===== MAINTENANCE (New Version) =====
export const maintenanceApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('vehicle_maintenance_records')
            .select('*, vehicle:vehicles(*)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as MaintenanceRecord[];
    },
    async getByVehicleId(vId: string) {
        const { data, error } = await supabase
            .from('vehicle_maintenance_records')
            .select('*')
            .eq('vehicle_id', vId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as MaintenanceRecord[];
    },
    async create(record: Partial<MaintenanceRecord>) {
        const { data, error } = await supabase.from('vehicle_maintenance_records').insert(record).select().single();
        if (error) throw error;
        return data as MaintenanceRecord;
    },
    async update(id: string, updates: Partial<MaintenanceRecord>) {
        const { data, error } = await supabase.from('vehicle_maintenance_records').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data as MaintenanceRecord;
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
        const { data, error } = await supabase.from('transactions').insert(transaction).select().single();
        if (error) throw error;
        return data as Transaction;
    },
    async update(id: string, updates: Partial<Transaction>) {
        const { data, error } = await supabase.from('transactions').update(updates).eq('id', id).select().single();
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
            .select('*, vehicles:vehicles(*)')
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
