import {DateField, useRecordContext} from "react-admin";
import {useState, useEffect} from "react";
import axiosNest from "../../../api/axiosNest";
import {
    Button,
    Card,
    CardContent,
    Stack,
    Typography
} from "@mui/material";
import {SearchParameters} from "./SearchParameters";
import {OffersTable} from "./OffersTable";
import {CarPlanTimeline} from "./CarPlanTimeline";
import {OfferDetailsCard} from "./OfferDetailsCard";
import {getUnloadingPlace} from "../../../data/helpers";
import {CarPlanSummary} from "./CarPlanSummary";

export const ScheduleList = () => {
    const record = useRecordContext();
    const [offers, setOffers] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchServices, setSearchServices] = useState(['timocom', 'transEu', 'smartsearch']);

    const [numUnloadingCities, setNumUnloadingCities] = useState(10);
    const [searchArea, setSearchArea] = useState(100);
    const [perPage, setPerPage] = useState(50);
    const [assignedOffers, setAssignedOffers] = useState([]);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [currentOfferMapped, setCurrentOfferMapped] = useState(null);
    const [timelineMarkedOffer, setTimelineMarkedOffer] = useState(null);
    const [useDestinationCityService, setUseDestinationCityService] = useState(false);



    const futureSchedules = (record?.schedules || []).filter(schedule => {
        return new Date(schedule.to) >= new Date();
    });

    const currentSchedule = futureSchedules[0];
    const fetchAssignedOffers = async () => {
        if (!record?.id || !currentSchedule?.id) return;

        try {
            const res = await axiosNest.get(`/car-schedule-offers`, {
                params: {
                    'pagination[page]': 1,
                    'pagination[perPage]': 100,
                    'sort[field]': 'id',
                    'sort[order]': 'ASC',
                    'filter[carId]': record.id,
                    'filter[carScheduleId]': currentSchedule.id,
                }
            });

            setAssignedOffers(res.data); // ← pełna lista obiektów
            setCurrentOfferMapped(null); // resetuj aktualną ofertę
        } catch (e) {
            console.error("Błąd podczas pobierania assignedOffers", e);
        }
    };
    useEffect(() => {
        if (selectedOffer) {
            setCurrentOfferMapped(mapOfferToTimelineFormat(selectedOffer));
            setTimelineMarkedOffer(null);
        } else {
            setCurrentOfferMapped(null);
        }
    }, [selectedOffer]);

    useEffect(() => {
        if (record && currentSchedule) {
            fetchAssignedOffers();
        }
    }, [record, currentSchedule]);
    const handleDeleteOffer = async (offerId) => {
        const confirmed = window.confirm("Czy na pewno chcesz usunąć tę ofertę?");
        if (!confirmed) return;

        try {
            await axiosNest.delete(`/car-schedule-offers/${offerId}`);
            await fetchAssignedOffers(); // odśwież listę
            setTimelineMarkedOffer(null); // odznacz usuniętą ofertę
        } catch (err) {
            console.error("Błąd podczas usuwania oferty:", err);
        }
    };

    const changeOfferStatus = async (offerId, newStatus) => {
        try {
            await axiosNest.patch(`/car-schedule-offers/${offerId}`, { status: newStatus });
            await fetchAssignedOffers(); // odświeżenie timeliny
            if(timelineMarkedOffer && timelineMarkedOffer.id === offerId) {
                setTimelineMarkedOffer(prev => ({ ...prev, status: newStatus }));
            }
        } catch (err) {
            console.error("Błąd przy zmianie statusu:", err);
        }
    };
    const handleSearchFromUnloading = (offer) => {
        const unloading = getUnloadingPlace(offer.details || {});
        if (!unloading || !unloading.address?.geoCoordinate) return;
        const coords = unloading.address.geoCoordinate;
        const plannedLocationOverride = {
            lat: coords.latitude,
            lng: coords.longitude,
            date: unloading.latestLoadingDate,
            address:{
                city: unloading.address.city || "Nieznane",
                country: unloading.address.country || "Nieznane",
                location:[coords.latitude, coords.longitude]
            }
        };

        handleSearchOffers(JSON.stringify(plannedLocationOverride));
    };


    const handleSearchOffers = async (plannedLocationOverride = null) => {
        setLoading(true);
        setError(null);
        setOffers(null);

        try {
            const params = {
                numUnloadingCities,
                searchArea,
                perPage,
                searchServices: JSON.stringify(searchServices),
            };

            if (plannedLocationOverride) {
                params.plannedLocationOverride = plannedLocationOverride;
            }
            params.useDestinationCityService = useDestinationCityService?1:0;

            console.log(params);

            const res = await axiosNest.get(`/offerSearch/car/${record.id}`, { params });
            setOffers(res.data);
        } catch (error) {
            setError("Błąd podczas pobierania ofert.");
            setOffers(null);
        }
        setLoading(false);
    };

    function mapOfferToTimelineFormat(offer) {
        const loadingPlace = offer.loadingPlaces.find(lp => lp.loadingType === "LOADING");
        const unloadingPlace = offer.loadingPlaces.find(lp => lp.loadingType === "UNLOADING");

        const fromDate = loadingPlace?.earliestLoadingDate ? new Date(loadingPlace.earliestLoadingDate + 'T' + (loadingPlace.startTime || "07:00:00")) : null;
        const toDate = unloadingPlace?.latestLoadingDate ? new Date(unloadingPlace.latestLoadingDate + 'T' + (loadingPlace.endTime || "17:00:00")) : null;

        const latestFrom = loadingPlace?.latestLoadingDate ? new Date(loadingPlace.latestLoadingDate + 'T' + (unloadingPlace.startTime || "17:00:00")) : null;
        const earliestTo = unloadingPlace?.earliestLoadingDate ? new Date(unloadingPlace.earliestLoadingDate + 'T' + (unloadingPlace.endTime || "07:00:00")) : null;


        const res = {
            id: offer.id,
            from: fromDate,
            to: toDate,
            latestFrom: latestFrom,
            earliestTo: earliestTo,
            status: "hover",
            fromCity: loadingPlace?.address?.city || "Nieznane",
            fromCountry: loadingPlace?.address?.country || "Nieznane",
            toCity: unloadingPlace?.address?.city || "Nieznane",
            toCountry: unloadingPlace?.address?.country || "Nieznane",
            details: offer.freightDescription || "Brak opisu"
        };
        return res;
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>Harmonogramy (aktywne okresy okresy)</Typography>
                <Stack spacing={2}>
                    {futureSchedules.map((s, idx) => (
                        <Stack key={idx} direction="row" spacing={2}>
                            <Typography>Od: <DateField record={s} source="from"/></Typography>
                            <Typography>Do: <DateField record={s} source="to"/></Typography>
                            <Typography>Status: {s.status}</Typography>
                        </Stack>
                    ))}

                    <SearchParameters
                        numUnloadingCities={numUnloadingCities}
                        setNumUnloadingCities={setNumUnloadingCities}
                        searchArea={searchArea}
                        setSearchArea={setSearchArea}
                        perPage={perPage}
                        setPerPage={setPerPage}
                        searchServices={searchServices}
                        setSearchServices={setSearchServices}
                        useDestinationCityService={useDestinationCityService}
                        setUseDestinationCityService={setUseDestinationCityService}
                    />
                    <CarPlanSummary
                        from={currentSchedule?.from}
                        to={currentSchedule?.to}
                        offers={assignedOffers}
                        baseAddress={record?.baseAddress}
                    />

                    <CarPlanTimeline
                        from={currentSchedule?.from}
                        to={currentSchedule?.to}
                        startCity={`${record?.baseAddress?.city} ${record?.baseAddress?.country}`}
                        assignedOffers={assignedOffers}
                        currentOffer={currentOfferMapped}
                        selectedOfferId={timelineMarkedOffer?.id || null}
                        onSelectOffer={(id) => {
                            const found = assignedOffers.find(o => o.id === id);
                            if(timelineMarkedOffer && timelineMarkedOffer?.id === id) {
                                setTimelineMarkedOffer(null);
                                return;
                            }
                            setTimelineMarkedOffer(found);
                        }}
                    />
                    {timelineMarkedOffer && (
                        <OfferDetailsCard
                            offer={timelineMarkedOffer}
                            onChangeStatus={(newStatus) => changeOfferStatus(timelineMarkedOffer.id, newStatus)}
                            onSearchFromUnloading={() => handleSearchFromUnloading(timelineMarkedOffer)}
                            onDelete={() => handleDeleteOffer(timelineMarkedOffer.id)}
                        />
                    )}




                    <Button variant="contained" onClick={()=>handleSearchOffers(null)} disabled={loading}>
                        {loading ? 'Szukam...' : 'Szukaj ofert'}
                    </Button>

                    {error && <Typography color="error">{error}</Typography>}
                    {offers && offers.offers && (
                        <OffersTable
                            offers={offers}
                            onSelectOffer={setSelectedOffer}
                            selectedOffer={selectedOffer}
                            fetchAssignedOffers={fetchAssignedOffers}
                        />
                    )}


                    {offers && (
                        <pre style={{background: '#f4f4f4', padding: '10px', whiteSpace: 'pre-wrap', overflow: 'auto', height: '600px'}}>
                            {JSON.stringify(offers, null, 2)}
                        </pre>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};
