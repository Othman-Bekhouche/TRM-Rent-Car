import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { reservationsApi, settingsApi, handoversApi } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';
import { Loader2, Printer } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ContractPrint() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [reservation, setReservation] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);
    const [handover, setHandover] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [contractIndex, setContractIndex] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const action = searchParams.get('action');
    const shouldPrint = action === 'print' || action === 'download';

    useEffect(() => {
        const loadData = async () => {
            try {
                if (!id) return;
                const [resData, set, handData, { data: { user: authUser } }] = await Promise.all([
                    reservationsApi.getById(id),
                    settingsApi.get(),
                    handoversApi.getByReservation(id),
                    supabase.auth.getUser()
                ]);

                if (authUser) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', authUser.id)
                        .single();
                    setRole(profile?.role || 'client');
                }

                setReservation(resData);
                setSettings(set);
                setHandover(handData);

                // Fetch contract sequence if not already in DB
                if (resData && !resData.rental_contracts?.[0]?.contract_number) {
                    const { count, error: countErr } = await supabase
                        .from('rental_contracts')
                        .select('*', { count: 'exact', head: true })
                        .lte('created_at', resData.created_at);

                    if (!countErr) {
                        const seq = (count || 0) + 1;
                        setContractIndex(seq.toString().padStart(4, '0'));
                    }
                }

                if (shouldPrint && resData) {
                    setTimeout(() => {
                        window.print();
                        if (action === 'download') {
                            window.onafterprint = () => window.close();
                        }
                    }, 800);
                }
            } catch (err: any) {
                console.error(err);
                toast.error("Erreur de chargement");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, shouldPrint]);

    const contractNo = reservation?.rental_contracts?.[0]?.contract_number || contractIndex || id?.slice(0, 8).toUpperCase();
    const [editableContractNo, setEditableContractNo] = useState(contractNo);

    useEffect(() => {
        if (reservation || contractIndex) {
            setEditableContractNo(reservation?.rental_contracts?.[0]?.contract_number || contractIndex || id?.slice(0, 8).toUpperCase());
        }
    }, [reservation, contractIndex, id]);

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    if (!reservation) return <div className="p-10 text-center font-bold text-slate-500">CONTRAT INTROUVABLE</div>;

    const daysCount = Math.max(1, Math.ceil((new Date(reservation.end_date).getTime() - new Date(reservation.start_date).getTime()) / (1000 * 60 * 60 * 24)));

    return (
        <div className="min-h-screen bg-slate-50 text-[#0b1c57] antialiased print:bg-white print:text-black overflow-x-hidden">
            <style dangerouslySetInnerHTML={{
                __html: `
                @page { 
                    size: A4; 
                    margin: 0; 
                }
                
                body {
                    margin: 0;
                    padding: 0;
                    background: #f8fafc;
                }

                .contract-wrapper {
                    font-family: Arial, sans-serif;
                    color: #0b1c57;
                    font-size: 10.5px;
                    max-width: 800px;
                    margin: 15px auto;
                    padding: 30px 40px;
                    background: white;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                    line-height: 1.25;
                }
                
                /* --- PAGE 1 : RECTO --- */
                .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
                .logo-area { width: 35%; }
                .logo-img { max-height: 80px; width: auto; object-fit: contain; }
                .company-info { text-align: center; width: 65%; font-weight: bold; font-size: 9px; color: #000; line-height: 1.3; }
                
                .title-row { 
                    display: flex; justify-content: space-between; align-items: baseline; 
                    border-bottom: 2.5px solid #0b1c57; margin-bottom: 8px; padding-bottom: 4px;
                }
                .title-row h2 { margin: 0; font-size: 16px; font-style: italic; }
                .contract-number { font-size: 16px; font-weight: bold; }
                .contract-number-box { border: 1.2px solid #0b1c57; padding: 2px 15px; margin-left: 5px; background: transparent; font-weight: bold; }
                
                .car-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold; font-size: 11px; }
                .section-title { font-size: 13.5px; font-weight: bold; font-style: italic; margin: 8px 0 4px 0; border-bottom: 1.2px solid #0b1c57; }
                
                .flex-row { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
                .box { 
                    border: 1.8px solid #0b1c57; border-radius: 5px; padding: 10px 8px 6px 8px; width: 48.5%; 
                    box-sizing: border-box; position: relative; margin-top: 8px;
                }
                .box-title { 
                    position: absolute; top: -10px; left: 10px; background: white; 
                    padding: 0 5px; font-weight: bold; font-style: italic; color: #0b1c57; font-size: 10.5px;
                }
                
                .line { border-bottom: 1px dotted #0b1c57; margin: 2px 0 6px 0; min-height: 14px; }
                .double-line { line-height: 1.7; }
                
                .contract-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; text-align: center; border: 2.5px solid #0b1c57;}
                .contract-table td { border: 1.2px solid #0b1c57; padding: 4px; font-weight: bold; font-size: 10.5px; }
                .table-header { font-style: italic; background: #f8fafc; font-size: 10px !important; }
                
                .price-box { width: 48%; border: 1.8px solid #0b1c57; padding: 10px 8px 8px 8px; box-sizing: border-box; position: relative; margin-top: 8px;}
                .price-row { display: flex; justify-content: space-between; border-bottom: 1px solid #0b1c57; padding: 4px 0; font-weight: bold; }
                .price-row:last-child { border-bottom: none; }
                
                .situation-box { width: 48%; border: 1.8px solid #0b1c57; padding: 10px 8px 8px 8px; box-sizing: border-box; text-align: center; position: relative; margin-top: 8px;}
                .car-schema { border: 1px dashed #ccc; height: 110px; margin: 8px auto; width: 85%; display: flex; align-items: center; justify-content: center; color: #999; }
                
                .declaration { text-align: center; font-weight: bold; margin: 12px 0; border-top: 2px dashed #0b1c57; padding-top: 8px; line-height: 1.5; font-size: 10px; }
                .signature-area { display: flex; justify-content: space-between; margin-top: 10px; font-weight: bold; }
                .sig-box { text-align: center; width: 33%; font-size: 10.5px; }
                .sig-space { height: 60px; border-bottom: 1px dotted #0b1c57; margin-top: 8px; }

                /* --- PAGE 2 : VERSO (CONDITIONS) --- */
                .page-break { page-break-before: always; }
                .conditions-container { margin-top: 0px; padding: 0px; }
                .article { display: flex; justify-content: space-between; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
                .article-title-row { text-align: center; font-weight: bold; margin-bottom: 5px; background-color: #f4f4f4; padding: 4px; font-size: 10.5px; }
                .article-fr { width: 48%; text-align: justify; line-height: 1.25; font-size: 9px; }
                .article-ar { width: 48%; text-align: justify; direction: rtl; line-height: 1.25; font-size: 10px; }
                
                @media print {
                    .contract-wrapper { 
                        box-shadow: none; 
                        margin: 0; 
                        padding: 1.5cm !important; 
                        max-width: none; 
                        width: auto; 
                        min-height: 297mm;
                    }
                    * { 
                        color: black !important; 
                        border-color: #0b1c57 !important;
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                    }
                    .print\\:hidden { display: none !important; }
                    .contract-number-box { border-color: #0b1c57 !important; }
                    .bg-slate-50, .table-header { background: #f8fafc !important; }
                    .page-break { margin-top: 0; padding-top: 0; }
                }
            `}} />
            <Toaster />

            <div className="print:hidden fixed top-6 right-6 flex gap-3 z-50">
                <Link
                    to={['admin', 'super_admin', 'gestionnaire', 'assistant'].includes(role || '') ? `/admin/reservations/${id}` : '/profile'}
                    className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-slate-600"
                >
                    Retour au dossier
                </Link>
                <button onClick={() => window.print()} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg hover:bg-black transition-all uppercase tracking-widest">
                    <Printer className="w-4 h-4" /> {action === 'download' ? 'Télécharger PDF' : 'Imprimer le contrat'}
                </button>
            </div>

            <div className="contract-wrapper print:m-0">
                {/* RECTO : FORMULAIRE DE LOCATION */}
                <div className="header">
                    <div className="logo-area">
                        <img src="/trm-logo-pour-arriere-blanc.png" alt="TRM RENT CAR" className="logo-img" />
                    </div>
                    <div className="company-info">
                        Location de voitures<br />
                        IF : {settings?.legal_if || '71791283'} - RC : {settings?.legal_rc || '2241'}<br />
                        Patente : {settings?.legal_patente || '12404497'} - ICE : {settings?.legal_ice || '003886910000058'}<br />
                        {settings?.address || 'App, N°6 Bloc A 2 ème Etage Immeuble Sabrine - TAOURIRT'}<br />
                        GSM : {settings?.phone || '06.06.06.64.26'}
                    </div>
                </div>

                <div className="title-row">
                    <h2>Contrat de Location <span style={{ fontSize: '12px', fontWeight: 'normal' }}>Rental agreement / عقد إيجار</span></h2>
                    <div className="contract-number flex items-center">
                        N° :
                        <input
                            type="text"
                            className="contract-number-box text-center focus:outline-none"
                            value={editableContractNo}
                            onChange={(e) => setEditableContractNo(e.target.value)}
                            style={{ width: '130px' }}
                        />
                    </div>
                </div>

                <div className="car-info">
                    <div>Marque : <span className="border-b border-dotted border-[#0b1c57] px-3 min-w-[200px] inline-block uppercase">{reservation.vehicles?.brand} {reservation.vehicles?.model}</span></div>
                    <div>Immat : <span className="border-b border-dotted border-[#0b1c57] px-3 min-w-[150px] inline-block">{reservation.vehicles?.plate_number}</span></div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <div className="w-3.5 h-3.5 border border-[#0b1c57] flex items-center justify-center -mt-0.5">
                                {reservation.vehicles?.fuel_type?.toLowerCase() === 'diesel' ? 'X' : ''}
                            </div> Diesel
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3.5 h-3.5 border border-[#0b1c57] flex items-center justify-center -mt-0.5">
                                {reservation.vehicles?.fuel_type?.toLowerCase() === 'essence' ? 'X' : ''}
                            </div> Essence
                        </span>
                    </div>
                </div>

                <div className="section-title">Le locataire / Tenant / المكتري</div>

                <div className="flex-row">
                    <div className="box">
                        <div className="box-title">Conducteur 1 / Driver 1</div>
                        <div className="double-line">
                            <strong>Nom et Prénom :</strong> <br />
                            <div className="line font-bold">{reservation.customers?.full_name?.toUpperCase()}</div>
                            <strong>Né le :</strong> <span className="border-b border-dotted border-[#0b1c57] px-2">{reservation.customers?.birth_date ? new Date(reservation.customers.birth_date).toLocaleDateString() : '.......................'}</span> <strong>à :</strong> <span className="border-b border-dotted border-[#0b1c57] px-2">{reservation.customers?.birth_place || '.......................'}</span><br />
                            <strong>Adresse au Maroc :</strong><br />
                            <div className="line">{reservation.customers?.address || reservation.customers?.city || '....................................................................'}</div>
                            <strong>Adresse à l'étranger :</strong><br />
                            <div className="line"></div>
                            <strong>Téléphone :</strong> <br />
                            <div className="line">{reservation.customers?.phone}</div>
                            <strong>CNI/Passeport :</strong> <br />
                            <div className="line">{reservation.customers?.cin || reservation.customers?.passport}</div>
                            <strong>Permis de conduire :</strong> <br />
                            <div className="line">{reservation.customers?.license_number || '....................................................................'}</div>
                            <strong>Délivré le :</strong> ............................... <strong>à :</strong> ...............................
                        </div>
                    </div>
                    <div className="box">
                        <div className="box-title">Conducteur 2 / Driver 2</div>
                        <div className="double-line">
                            <strong>Nom et Prénom :</strong> <br />
                            <div className="line"></div>
                            <strong>Né le :</strong> ............................... <strong>à :</strong> ...............................<br />
                            <strong>Adresse au Maroc :</strong><br />
                            <div className="line"></div>
                            <strong>Adresse à l'étranger :</strong><br />
                            <div className="line"></div>
                            <strong>Téléphone :</strong> <br />
                            <div className="line"></div>
                            <strong>CNI/Passeport :</strong> <br />
                            <div className="line"></div>
                            <strong>Permis de conduire :</strong> <br />
                            <div className="line"></div>
                            <strong>Délivré le :</strong> ............................... <strong>à :</strong> ...............................
                        </div>
                    </div>
                </div>

                <table className="contract-table">
                    <thead>
                        <tr className="table-header">
                            <td></td>
                            <td>J/D</td><td>M</td><td>A/Y</td>
                            <td>Heure/Hour<br />الساعة</td>
                            <td>Lieu/Place<br />المكان</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ textAlign: 'left' }}><strong>Départ</strong> Departure الإنطلاق</td>
                            <td>{new Date(reservation.start_date).getDate()}</td>
                            <td>{new Date(reservation.start_date).getMonth() + 1}</td>
                            <td>{new Date(reservation.start_date).getFullYear()}</td>
                            <td>{new Date(reservation.start_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>{reservation.pickup_location || 'Agence Taourirt'}</td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: 'left' }}><strong>Retour</strong> Return العودة</td>
                            <td>{new Date(reservation.end_date).getDate()}</td>
                            <td>{new Date(reservation.end_date).getMonth() + 1}</td>
                            <td>{new Date(reservation.end_date).getFullYear()}</td>
                            <td>{new Date(reservation.end_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>{reservation.dropoff_location || 'Agence Taourirt'}</td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: 'left' }}><strong>Durée</strong> Duration</td>
                            <td colSpan={3}>{daysCount} JOURS</td>
                            <td colSpan={2} style={{ textAlign: 'left' }}><strong>Prolongation</strong> Extension</td>
                        </tr>
                    </tbody>
                </table>

                <div className="flex-row">
                    <div className="price-box">
                        <div className="box-title">Prix</div>
                        <div className="price-row">
                            <span>Par jour / per day / يومي</span>
                            <span>: {reservation.vehicles?.price_per_day} Dhs</span>
                        </div>
                        <div className="price-row">
                            <span>Par mois / per month / في الشهر</span>
                            <span>: ...........................</span>
                        </div>
                        <div className="price-row">
                            <span>Frais de livraison et récupération</span>
                            <span>: ...........................</span>
                        </div>
                        <div className="price-row" style={{ marginTop: '10px' }}>
                            <span>TOTAL / المجموع</span>
                            <span>{reservation.total_price.toLocaleString()} Dhs <sup>ttc</sup></span>
                        </div>
                    </div>

                    <div className="situation-box">
                        <div className="box-title">Situation du véhicule / Car situation</div>
                        <div className="car-schema">
                            <img src="https://cdns-api.leasys.com/api/v1/assets/generic-car-top-view.png" alt="Car Schema" style={{ opacity: 0.1, height: '90px' }} />
                        </div>
                        <div style={{ textAlign: 'left', fontWeight: 'bold', marginBottom: '5px' }}>
                            Franchise : {reservation.vehicles?.deposit_amount || '.........'} Dhs
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>Km D : {handover?.departure_mileage || reservation.vehicles?.mileage || '.........'}</span>
                            <span>Km R : .........</span>
                        </div>
                    </div>
                </div>

                <div className="declaration">
                    Je déclare avoir pris connaissance des conditions générales mentionnées dans le contrat de location de voiture (au verso) que j'accepte sans réserve.<br />
                    أقر بأنني قرأت شروط العقد و وقعت عليها.
                </div>

                <div style={{ fontWeight: 'bold', marginBottom: '15px' }}>Fait le / Sign at / حرر في : {new Date().toLocaleDateString('fr-FR')}</div>

                <div className="signature-area">
                    <div className="sig-box">
                        Le locataire / Tenant / المكتري
                        <div className="sig-space"></div>
                    </div>
                    <div className="sig-box">
                        Départ / عند التسليم
                        <div className="sig-space"></div>
                    </div>
                    <div className="sig-box">
                        Retour / عند العودة
                        <div className="sig-space"></div>
                    </div>
                </div>

                {/* SAUT DE PAGE */}
                <div className="page-break"></div>

                {/* VERSO : CONDITIONS GÉNÉRALES BILINGUES */}
                <div className="conditions-container">

                    <div className="article-title-row">ARTICLE (1) : LES PARTS DE CONTRAT / المادة (1) : أطراف العقدة</div>
                    <div className="article">
                        <div className="article-fr"><strong>Premier part :</strong> société de location de voiture sans chauffeur identifiable sur la première page de ce contrat et qui va s'indiquer with le mot la SOCIÉTÉ.<br /><strong>Deuxième part :</strong> le LOCATAIRE déclaré et identifiable dans la page 1 de ce contrat et qui va s'indiquer with le mot le LOCATAIRE.</div>
                        <div className="article-ar"><strong>الطرف الأول :</strong> شركة كراء السيارات بدون سائق المبينة الهوية في الصفحة الأولى، وسيشار إليها بكلمة الشركة.<br /><strong>الطرف الثاني :</strong> المكتري المبينة هويته في الصفحة الأولى من هذه العقدة وسيشار إليه بكلمة المكتري.</div>
                    </div>

                    <div className="article-title-row">ARTICLE (2) : ÉTAT DE VÉHICULE / المادة (2) : حالة السيارة</div>
                    <div className="article">
                        <div className="article-fr">Le véhicule est livré au LOCATAIRE en parfait état de marche. Ce véhicule sera rendu dans le même état qu'à son départ. À défaut le LOCATAIRE devra acquitter le montant de la remise en état initiale. Les cinq pneus sont en bon état, en cas de détérioration autre que l'usure normale, ou de disparition de l'un d'eux, le client s'engage à le remplacer immédiatement par un pneu de même dimension, de même marque et d'usure sensiblement égale.</div>
                        <div className="article-ar">سلمت السيارة إلى المكتري في حالة جيدة وسترد في نفس الحالة الأولى. في حالة أي عطب أو إتلاف على المكتري دفع مصاريف الإصلاح حتى تعود السيارة à حالتها الأولى. عند تسليم السيارة العجلات الخمس في حالة جيدة وفي حالة التلف أو الضياع على المكتري دفع ثمنها.</div>
                    </div>

                    <div className="article-title-row">ARTICLE (3) : ENTRETIEN ET RÉPARATION / المادة (3) : الصيانة والإصلاح</div>
                    <div className="article">
                        <div className="article-fr">L'usure mécanique normale est à la charge de la SOCIÉTÉ. Toutes les réparations provenant d'une cause accidentelle seront à la charge du LOCATAIRE. Le LOCATAIRE les supporte en totalité en plus des indemnités journalières issues de la panne du véhicule.</div>
                        <div className="article-ar">الأعطاب الميكانيكية الطبيعية تتحملها الشركة المالكة. كل الإصلاحات سواء بسبب الحادثة، أو غيرها يتحمل مصاريفها المكتري ويتحمل هذا الأخير أيضا كل الخسائر اليومية للشركة نتيجة توقف السيارة.</div>
                    </div>

                    <div className="article-title-row">ARTICLE (4) : UTILISATION DE VÉHICULE / المادة (4) : استعمال السيارة</div>
                    <div className="article">
                        <div className="article-fr">La location est personnelle et n'est en aucun cas transmissible. Le LOCATAIRE s'engage à ne pas laisser conduire la voiture par d'autres personnes que celles figurant dans le contrat.</div>
                        <div className="article-ar">الكراء للمكتري شخصيا وليس له الحق في نقله إلى شخص آخر كما لا يحق للمكتري أن يتخذ سائقا آخر غير الذي حدد في العقدة (الصفحة 1).</div>
                    </div>

                    <div className="article-title-row">ARTICLE (5) : ASSURANCE ET ACCIDENTS / المادة (5) : التأمين والحوادث</div>
                    <div className="article">
                        <div className="article-fr">Le LOCATAIRE est assuré suivant les conditions générales des polices d'assurance contractées par la SOCIÉTÉ qu'il déclare bien connaître :<br />
                            A. Les accidents causés aux tiers sans limitation.<br />
                            B. L'assurance du véhicule contre le vol, l'incendie et la responsabilité civile ne garantit pas les accessoires, vêtements et tout objet oublié à l'intérieur de la voiture ou du coffre.<br />
                            C. Les dégâts causés à la voiture ainsi que le vol ou l'incendie, le LOCATAIRE les supporte en totalité en plus des indemnités journalières estimées au tarif de location en cours de la date de la panne jusqu'à la mise en circulation du véhicule.<br />
                            D. Le LOCATAIRE devra déclarer à la SOCIÉTÉ dans le plus bref délai, tout accident, vol ou incendie. Sa déclaration devra mentionner les circonstances exactes, notamment le lieu de l'accident, la date, l'heure, les témoins (avec l'appui d'un constat).<br />
                            E. En cas de constatation d'un défaut dans l'état de la voiture, le LOCATAIRE doit aviser la SOCIÉTÉ dans un délai de trois heures après la signature du contrat, à défaut le LOCATAIRE reste responsable de toute panne.</div>
                        <div className="article-ar">المكتري مؤمن تحت الشروط العامة لوثيقة التأمين التي عقدتها الشركة avec شركة التأمين ولا بأس أن نذكر بها : <br />
                            A - حوادث السير بدون تحديد.<br />
                            B - التأمين ضد سرقة السيارة، الحريق والمسؤوليات المدنية لا تؤمن الأدوات والملابس والأشياء المنسية داخل السيارة أو في الصندوق الخلفي للسيارة.<br />
                            C - الأضرار التي قد تلحق السيارة أو السرقة أو الحريق يتحملها المكتري كاملة وكذا الخسائر اليومية للشركة نتيجة توقف السيارة، ويتم تقديرها حسب ثمن الكراء الحالي من تاريخ العطب إلى تاريخ اشتغال السيارة.<br />
                            D - يجب على المكتري إخبار الشركة في أقرب الآجال بجميع الحوادث، السرقة أو الحريق مع جميع التفاصيل المصاحبة للعملية (المكان، التاريخ، الوقت، الشهود....) مدعومة بمحضر الشرطة.<br />
                            E - في حالة ملاحظة أي عيب في السيارة المكتراة على المكتري إخبار الشركة في أجل لا يتعدى ثلاث ساعات بعد تسلم السيارة، وخارج هذه الآجال يبقى المكتري مسؤولا عن أي ضرر يلحق بالسيارة.</div>
                    </div>

                    <div className="article-title-row">ARTICLE (6) : RÈGLEMENT, VERSEMENT, PRÉPAIEMENT ET RETOUR / المادة (6) : الأداء، الإيداع، التمديد وإرجاع السيارة</div>
                    <div className="article">
                        <div className="article-fr">Les montants de la location et du prépaiement sont déterminés par les tarifs en vigueur et payables d'avance. Le versement ne pourra servir en aucun cas si le LOCATAIRE voudrait conserver la voiture pour un temps supérieur à celui indiqué sur le contrat. La SOCIÉTÉ accepte le paiement par chèque pour le règlement des jours loués ou pour le règlement d'un dommage quel qu'il soit causé au véhicule. Le LOCATAIRE déclare bien connaître que tout chèque donné de sa part constitue un paiement.</div>
                        <div className="article-ar">مستحقات الكراء والأداء المسبق يتم تقييمها حسب الأثمنة الجاري بها العمل في السوق وتؤدى مسبقا. الإيداع لا يمكن إرجاعه في حال من الأحوال إلى المكتري الذي يرغب في الاحتفاظ بالسيارة لوقت يفوق الوقت المحدد في هذه العقدة. الشركة تقبل الأداء بالشيكات سواء بالنسبة لمستحقات الكراء أو بالنسبة للتعويضات عن بعض الأضرار التي قد تلحق بالسيارة. كل شيك يقدمه المكتري للشركة يعتبر أداء تستخلصه الشركة في أي وقت ترغب فيه.</div>
                    </div>

                    <div className="article-title-row">ARTICLE (7) : DÉGÂTS ET DOMMAGES / المادة (7) : الأضرار والخسائر</div>
                    <div className="article">
                        <div className="article-fr">Le LOCATAIRE s'engage à réparer les dégâts et dommages causés à la voiture ainsi que toutes les indemnités journalières, par le règlement d'un montant convenu initialement par chèque. En cas de paiement par chèque le LOCATAIRE déclare reconnaître la sincérité et la validité des conditions de fonds et de forme de tout chèque émis et s'exposer à des poursuites judiciaires en cas d'absence ou d'insuffisance de provision ou de non-conformité de signature, et ne peut en aucun cas poursuivre la SOCIÉTÉ.</div>
                        <div className="article-ar">المكتري يتحمل الأضرار والخسائر التي قد تلحق بالسيارة وكذا الخسائر اليومية للشركة نتيجة توقف السيارة يؤدى نقدا أو بالشيك وفي حالة الأداء بالشيك يبقى المكتري عرضة للمساءلة القانونية أمام القضاء في حالة غياب الرصيد، عدم توفره بالكامل، عدم مطابقة توقيع الشيكات للتوقيع المعلن لدى الوكالة البنكية الخاصة بالمكتري، أو أي تزوير في الشيكات أو الأموال.</div>
                    </div>

                    <div className="article-title-row">ARTICLE (8) : DOCUMENTS DE LA VOITURE / المادة (8) : وثائق السيارة</div>
                    <div className="article">
                        <div className="article-fr">Le LOCATAIRE remettra à la Société dès le retour de la voiture tous les titres de circulation afférents à cette dernière, faute de quoi la location continuera de lui être facturée au prix initial jusqu'à la reprise des papiers.</div>
                        <div className="article-ar">على المكتري إعادة كل الوثائق المتعلقة بالسيارة إلى الشركة عند إرجاع السيارة : يعتبر الكراء مستمرا إلى حين إعادة وثائق السيارة إلى الشركة.</div>
                    </div>

                    <div className="article-title-row">ARTICLE (9) : LES RESPONSABILITÉS / المادة (9) : المسؤوليات</div>
                    <div className="article" style={{ borderBottom: 'none' }}>
                        <div className="article-fr">Le LOCATAIRE demeure seul responsable des amendes, contraventions, procès-verbaux et poursuites douanières établis contre lui.</div>
                        <div className="article-ar">يبقى المكتري هو المسؤول الوحيد عن الغرامات المالية الناتجة عن المخالفات الطرقية وكذا القانونية أو المتابعة الجمركية المقامة ضده.</div>
                    </div>

                </div>
            </div>
        </div>
    );
}
