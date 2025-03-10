import { authApi } from "@/lib/api/auth";
import { useQuery } from "@tanstack/react-query";

export default function ProfilePage() {
    const { data } = useQuery({
        queryKey: ['profile'],
        queryFn: () => authApi.getProfile(),
    })
    return (
        <div>
            <p>{JSON.stringify(data)}</p>
        </div>
    )
}