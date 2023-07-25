import { useState, useEffect } from 'react';
import db from '/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export function usePassportUpdates() {

    const [dates, setDates] = useState([]);
    const [firstDate, setFirstDate] = useState();

    useEffect(() => {
        if(!dates.length){return;}
        const sortedDates = dates.sort((a,b) => a.last_recorded > b.last_recorded ? -1 : 1);
        setFirstDate(sortedDates[0]);
    },[dates])

    useEffect(() => {
        const fetchData = async () => {
            const passportUpdateCollection = collection(db, 'passport-update');
            const passportUpdateSnapshot = await getDocs(passportUpdateCollection);
            const passportUpdateData = passportUpdateSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setDates(passportUpdateData);
        };

        fetchData(); // Fetch data immediately after component mounts

        const intervalId = setInterval(fetchData, 1000); // Then fetch every 10 seconds

        return () => clearInterval(intervalId); // Clear interval on component unmount
    }, []); // Empty dependency array means this effect runs once on component mount.

    return [dates, firstDate];
}
