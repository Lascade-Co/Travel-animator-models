import Footer from "./footer";
import Header from "./maps_header";
import MapsGrid from "./maps_grid";
import './maps_page.css';
import Image from 'next/image';

// Define the Map type
export interface Map {
    id: number;
    name: string;
    thumbnail: string;
    map_url: string;
    premium: boolean;
    free_for: number | null;
}

interface MapsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Map[];
}

// Revalidate every 10 minutes (600 seconds)
// Adjust this based on how often maps are added
export const dynamic = 'force-dynamic';

export default async function MapsPage() {
    // Fetch all maps data on the server
    let maps: Map[] = [];

    try {
        let nextUrl: string | null = `https://dashboard.lascade.com/travel_animator/v0/maps`;

        // Keep fetching until next is null
        while (nextUrl) {
            const res = await fetch(nextUrl, {
                headers: {
                    "accept": "application/json",
                },

            });

            if (res.ok) {
                const data: MapsResponse = await res.json();
                maps = [...maps, ...data.results];
                nextUrl = data.next;
                console.log(`[SERVER] Fetched ${data.results.length} maps. Total: ${maps.length}. Next: ${nextUrl ? 'Yes' : 'No'}`);
            } else {
                console.log(`[SERVER] Failed to fetch maps (${res.status})`);
                nextUrl = null;
            }
        }

        console.log(`[SERVER] Successfully fetched all ${maps.length} maps`);
    } catch (error) {
        console.error(`[SERVER] Error fetching maps:`, error);
    }

    return (
        <>
            <Header />
            <div className="maps-container">
                <MapsGrid maps={maps} />
            </div>
            <Footer />
        </>
    );
}