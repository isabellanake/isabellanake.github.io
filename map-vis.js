// White theme (CartoDB Positron)
const white = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
});

// Initialize map centered on Germany
const map = L.map('map', {
    center: [51.1657, 10.4515], // Germany
    zoom: 6,
    layers: [white] // Use white theme as default
});

// Helper: Parse query params for routes
// Example: ?routes=48.783333,9.183333,53.5511,9.9937;52.52,13.405,52.2297,21.0122
function getRoutesFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const routesParam = params.get('routes');
    if (!routesParam) return [];
    return routesParam.split(';').map(routeStr => {
        const [fromLat, fromLng, toLat, toLng] = routeStr.split(',');
        return {
            from: { coords: [parseFloat(fromLat), parseFloat(fromLng)] },
            to: { coords: [parseFloat(toLat), parseFloat(toLng)] }
        };
    });
}

// Default routes if none in query
let routes = getRoutesFromQuery();
if (routes.length === 0) {
    routes = [
        {
            from: { coords: [48.783333, 9.183333] }, // Stuttgart
            to: { coords: [53.5511, 9.9937] }        // Hamburg
        },
        {
            from: { coords: [52.52, 13.405] },       // Berlin
            to: { coords: [52.2297, 21.0122] }       // Warsaw
        }
    ];
}

// Add markers and green lines for each route, and sum up total route distance
let totalRouteKm = 0;
routes.forEach(route => {
    L.marker(route.from.coords).addTo(map);
    L.marker(route.to.coords).addTo(map);
    L.polyline([route.from.coords, route.to.coords], { color: '#00529e', weight: 3 }).addTo(map);

    // Calculate distance in km
    const fromLatLng = L.latLng(route.from.coords);
    const toLatLng = L.latLng(route.to.coords);
    totalRouteKm += fromLatLng.distanceTo(toLatLng) / 1000;
});

// Draw the red dashed gap only if there is a gap, and sum up total gap distance
let totalGapKm = 0;
for (let i = 0; i < routes.length - 1; i++) {
    const prevTo = routes[i].to.coords;
    const nextFrom = routes[i + 1].from.coords;
    // Draw gap only if coordinates are not the same
    if (prevTo[0] !== nextFrom[0] || prevTo[1] !== nextFrom[1]) {
        L.polyline([prevTo, nextFrom], {
            color: 'red',
            weight: 3,
            dashArray: '10,10'
        }).addTo(map);

        // Calculate gap distance in km
        const prevToLatLng = L.latLng(prevTo);
        const nextFromLatLng = L.latLng(nextFrom);
        totalGapKm += prevToLatLng.distanceTo(nextFromLatLng) / 1000;
    }
}

// Update info box
document.getElementById('infoBox').innerHTML =
    `Total route distance: <b style="color:#00529e;">${totalRouteKm.toFixed(0)} km</b><br>` +
    `Total gap distance: <b style="color:red;">${totalGapKm.toFixed(0)} km</b>`;
