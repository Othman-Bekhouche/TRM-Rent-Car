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
    customer_id: string;
    vehicle_id: string;
    start_date: string;
    end_date: string;
    pickup_location: string;
    return_location: string;
    total_price: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
    payment_status: string;
    notes: string;
    created_at: string;
    updated_at: string;
    // Joined
    customer?: Customer;
    vehicle?: Vehicle;
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
    description: string;
    maintenance_date: string;
    next_maintenance_date: string;
    mileage_at_maintenance: number;
    cost: number;
    status: string;
    notes: string;
    created_at: string;
    updated_at: string;
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
        const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data as Vehicle[];
    },
    async getById(id: string) {
        const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single();
        if (error) throw error;
        return data as Vehicle;
    },
    async create(vehicle: Partial<Vehicle>) {
        const { data, error } = await supabase.from('vehicles').insert(vehicle).select().single();
        if (error) throw error;
        return data as Vehicle;
    },
    async update(id: string, updates: Partial<Vehicle>) {
        const { data, error } = await supabase.from('vehicles').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data as Vehicle;
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
            .select('*, customer:customers(*), vehicle:vehicles(*)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as Reservation[];
    },
    async getById(id: string) {
        const { data, error } = await supabase
            .from('reservations')
            .select('*, customer:customers(*), vehicle:vehicles(*)')
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
            .select('*, customer:customers(*), vehicle:vehicles(*)')
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

// ===== MAINTENANCE =====
export const maintenanceApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('maintenance')
            .select('*, vehicle:vehicles(*)')
            .order('maintenance_date', { ascending: false });
        if (error) throw error;
        return data as MaintenanceRecord[];
    },
    async create(record: Partial<MaintenanceRecord>) {
        const { data, error } = await supabase.from('maintenance').insert(record).select().single();
        if (error) throw error;
        return data as MaintenanceRecord;
    },
    async update(id: string, updates: Partial<MaintenanceRecord>) {
        const { data, error } = await supabase.from('maintenance').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data as MaintenanceRecord;
    },
    async delete(id: string) {
        const { error } = await supabase.from('maintenance').delete().eq('id', id);
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
            .in('role', ['admin', 'super_admin'])
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data as AdminUser[];
    },
    async update(id: string, updates: Partial<AdminUser>) {
        const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data as AdminUser;
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
