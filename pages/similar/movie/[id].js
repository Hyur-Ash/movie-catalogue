import Similar from "/components/Similar";
import { useRouter } from "next/router";

export default function MovieRecommendations() {
    const router = useRouter();
    const {id} = router.query;
    return <Similar mediaType="movie" mediaId={id}/>
}
