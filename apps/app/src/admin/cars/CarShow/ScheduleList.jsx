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

export const ScheduleList = () => {
    const record = useRecordContext();
    const [offers, setOffers] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [numLoadingCities, setNumLoadingCities] = useState(3);
    const [numUnloadingCities, setNumUnloadingCities] = useState(10);
    const [searchArea, setSearchArea] = useState(50);
    const [perPage, setPerPage] = useState(100);
    const [assignedOffers, setAssignedOffers] = useState([]);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [currentOfferMapped, setCurrentOfferMapped] = useState(null);


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
        } catch (e) {
            console.error("Błąd podczas pobierania assignedOffers", e);
        }
    };
    useEffect(() => {
        if (selectedOffer) {
            setCurrentOfferMapped(mapOfferToTimelineFormat(selectedOffer));
        } else {
            setCurrentOfferMapped(null);
        }
    }, [selectedOffer]);

    useEffect(() => {
        if (record && currentSchedule) {
            fetchAssignedOffers();
        }
    }, [record, currentSchedule]);



    const handleSearchOffers = async () => {
        setLoading(true);
        setError(null);
        setOffers(null);
        try {
            const params = {
                numLoadingCities,
                numUnloadingCities,
                searchArea,
                perPage,
            };

            const res = await axiosNest.get(`/offerSearch/car/${record.id}`, {params});
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
        console.log(res);
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
                        numLoadingCities={numLoadingCities}
                        setNumLoadingCities={setNumLoadingCities}
                        numUnloadingCities={numUnloadingCities}
                        setNumUnloadingCities={setNumUnloadingCities}
                        searchArea={searchArea}
                        setSearchArea={setSearchArea}
                        perPage={perPage}
                        setPerPage={setPerPage}
                    />

                    <CarPlanTimeline
                        from={currentSchedule?.from}
                        to={currentSchedule?.to}
                        startCity={`${record?.baseAddress?.city} ${record?.baseAddress?.country}`}
                        assignedOffers={assignedOffers}
                        currentOffer={currentOfferMapped}
                    />


                    <Button variant="contained" onClick={handleSearchOffers} disabled={loading}>
                        {loading ? 'Szukam...' : 'Szukaj ofert'}
                    </Button>

                    {error && <Typography color="error">{error}</Typography>}
                    {offers && offers.offers && (
                        <OffersTable offers={offers} onSelectOffer={setSelectedOffer} selectedOffer={selectedOffer} />
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
