import { MapPin, Navigation, Car, Clock, Shield, Zap } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const activeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const parkedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const TRACKED_VEHICLES = [
    { vehicle: 'Dacia Logan Blanc', plate: 'LOG-C-003', client: 'Hassan Benali', status: 'En route', location: 'Route N6 — Oujda → Fès', speed: '95 km/h', lastUpdate: 'il y a 3 min', lat: 34.68, lng: -1.91, color: 'text-emerald-600 bg-emerald-50', moving: true },
    { vehicle: 'Dacia Logan Gris', plate: 'LOG-C-004', client: 'Youssef Ziani', status: 'Stationnée', location: 'Nador Centre', speed: '0 km/h', lastUpdate: 'il y a 12 min', lat: 35.17, lng: -2.93, color: 'text-blue-600 bg-blue-50', moving: false },
];

const MAP_CENTER: [number, number] = [34.68, -2.00]; // Eastern Morocco

export default function GPS() {
    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Suivi GPS</h1>
                    <p className="text-slate-500 text-sm mt-1">Localisez votre flotte en temps réel sur le territoire marocain</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full font-bold">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    {TRACKED_VEHICLES.length} véhicules trackés en temps réel
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-[#1C0770] flex items-center gap-2"><Navigation className="w-4 h-4 text-[#3A9AFF]" /> Carte Interactive — Maroc Oriental</h2>
                        <span className="text-xs text-slate-400">Mise à jour auto toutes les 30s</span>
                    </div>
                    <div className="h-[520px]">
                        <MapContainer
                            center={MAP_CENTER}
                            zoom={8}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {TRACKED_VEHICLES.map((v, i) => (
                                <Marker
                                    key={i}
                                    position={[v.lat, v.lng]}
                                    icon={v.moving ? activeIcon : parkedIcon}
                                >
                                    <Popup>
                                        <div className="text-sm min-w-[200px]">
                                            <p className="font-bold text-slate-800 text-base">{v.vehicle}</p>
                                            <p className="text-blue-600 font-mono text-xs mb-2">{v.plate}</p>
                                            <div className="space-y-1 text-xs text-slate-600">
                                                <p>👤 Client : <strong>{v.client}</strong></p>
                                                <p>📍 {v.location}</p>
                                                <p>🏎️ Vitesse : <strong>{v.speed}</strong></p>
                                                <p>🕐 {v.lastUpdate}</p>
                                            </div>
                                            <div className={`mt-2 px-2 py-1 rounded text-xs font-bold text-center ${v.moving ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {v.status}
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* Vehicle List */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                        <h2 className="font-bold text-[#1C0770]">Véhicules en location</h2>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {TRACKED_VEHICLES.map((v, i) => (
                            <div key={i} className="p-5 hover:bg-[#F8FAFF] transition-colors cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{v.vehicle}</p>
                                        <p className="text-xs font-mono text-[#261CC1]">{v.plate}</p>
                                    </div>
                                    <span className={`${v.color} text-xs font-bold px-2.5 py-1 rounded-full border`}>{v.status}</span>
                                </div>
                                <div className="space-y-2 text-xs text-slate-500">
                                    <p className="flex items-center gap-2"><Car className="w-3 h-3" /> Client : <span className="text-slate-800 font-medium">{v.client}</span></p>
                                    <p className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {v.location}</p>
                                    <p className="flex items-center gap-2"><Zap className="w-3 h-3" /> Vitesse : {v.speed}</p>
                                    <p className="flex items-center gap-2"><Clock className="w-3 h-3" /> {v.lastUpdate}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Alert */}
                    <div className="p-5 border-t border-slate-100 bg-[#F0F4FF]">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-[#261CC1] mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-[#1C0770]">Alerte Géofence</p>
                                <p className="text-xs text-slate-500 mt-1">Configurez des zones de sécurité pour recevoir des alertes si un véhicule en sort.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
