import Similar from "/components/Similar";
import { useRouter } from "next/router";

export default function TvRecommendations() {
    const router = useRouter();
    const {id} = router.query;
    return <Similar mediaType="tv" mediaId={id}/>
}
