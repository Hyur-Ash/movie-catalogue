import Recommendations from "/components/Recommendations";
import { useRouter } from "next/router";

export default function MovieRecommendations() {
    const router = useRouter();
    const {id} = router.query;
    return <Recommendations mediaType="movie" mediaId={id}/>
}
