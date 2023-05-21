import Recommendations from "/components/Recommendations";
import { useRouter } from "next/router";

export default function TvRecommendations() {
    const router = useRouter();
    const {id} = router.query;
    return <Recommendations mediaType="tv" mediaId={id}/>
}
