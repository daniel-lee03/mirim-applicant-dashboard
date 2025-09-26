import React, { useEffect, useRef } from 'react';
import { RECRUITMENT_DATA, SEOUL_GEOJSON_URL, MIRIM_LOCATION } from '../constants';
import { SchoolData } from '../types';

// Since we are using Leaflet via CDN, we declare 'L' as a global variable for TypeScript
declare const L: any;

const MapComponent: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);

    // Color palette function
    const getColor = (d: number): string => {
        return d > 40 ? '#006d2c' :
               d > 30 ? '#2ca25f' :
               d > 20 ? '#66c2a4' :
               d > 15 ? '#99d8c9' :
               d > 10 ? '#ccece6' :
               d > 5  ? '#e5f5f9' :
                        '#f7fcfd';
    };

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            // Initialize map
            const map = L.map(mapContainerRef.current, {
                zoomControl: false // Hide zoom control
            }).setView([37.5465, 126.9780], 11);
            mapRef.current = map;

            // Add layers after map initialization
            addLayers(map);
            
            // Add custom controls
            addTotalInfoControl(map);
            addLegendControl(map);
        }
        
        // Cleanup function to remove map on component unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addLayers = (map: any) => {
        // Fetch and add Seoul GeoJSON layer
        fetch(SEOUL_GEOJSON_URL)
            .then(response => response.json())
            .then(geojson => {
                L.geoJSON(geojson, {
                    style: {
                        color: "#9ca3af", // gray-400 (border)
                        weight: 1.5,
                        opacity: 1,
                        fillColor: "#ffffff", // white (fill)
                        fillOpacity: 1
                    }
                }).addTo(map);

                // Add data markers on top of the GeoJSON layer
                addDataMarkers(map);
            });
    };
    
    const addDataMarkers = (map: any) => {
        RECRUITMENT_DATA.forEach((item: SchoolData) => {
            const circle = L.circle([item.lat, item.lon], {
                color: '#333',
                weight: 1,
                fillColor: getColor(item.총인원),
                fillOpacity: 0.85,
                radius: item.총인원 * 50 + 250
            }).addTo(map);

            const tooltipContent = `${item.교육지원청}<br/>${item.총인원}명`;
            circle.bindTooltip(tooltipContent, {
                permanent: true,
                direction: 'center',
                className: 'custom-tooltip'
            }).openTooltip();

            const popupContent = `<b>${item.교육지원청}</b><br><br>` +
                `총 인원: ${item.총인원}명<br>` +
                `공통 참여자: ${item.공통참여자}명<br>` +
                `설명회만 참여: ${item.입학설명회만}명<br>` +
                `캠프만 참여: ${item.캠프만}명`;
            
            circle.bindPopup(popupContent);

            circle.on('mouseover', function (this: any) {
                this.setStyle({ weight: 3, color: '#111' });
                this.openPopup();
            });

            circle.on('mouseout', function (this: any) {
                this.setStyle({ weight: 1, color: '#333' });
                this.closePopup();
            });
        });

        // Add Mirim Meister High School marker
        const mirimIcon = L.divIcon({
            html: '<div class="w-4 h-4 bg-rose-500 rounded-full border-2 border-white shadow-md"></div>',
            className: '',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
        });
        const mirimMarker = L.marker(MIRIM_LOCATION, {icon: mirimIcon}).addTo(map);
        mirimMarker.bindPopup("<b>미림마이스터고등학교</b>").openPopup();
    };

    const addTotalInfoControl = (map: any) => {
        const totalParticipants = RECRUITMENT_DATA.reduce((sum, item) => sum + item.총인원, 0);
        const TotalInfoControl = L.Control.extend({
            onAdd: function() {
                const div = L.DomUtil.create('div', 'p-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg text-center');
                div.innerHTML = `<h4 class="font-bold text-base mb-1 text-slate-700">캠프 및 입학설명회 신청 인원</h4><span class="text-3xl font-bold text-emerald-600">${totalParticipants}</span><span class="font-semibold text-slate-600"> 명</span>`;
                return div;
            }
        });
        new TotalInfoControl({ position: 'topright' }).addTo(map);
    };

    const addLegendControl = (map: any) => {
        const LegendControl = L.Control.extend({
            onAdd: function() {
                const div = L.DomUtil.create('div', 'p-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg text-sm');
                const grades = [40, 30, 20, 15, 10, 5, 0];
                const labels = [
                    '41명 이상', '31 - 40명', '21 - 30명', '16 - 20명', '11 - 15명', '6 - 10명', '1 - 5명'
                ];
                let legendHtml = '<h4 class="font-bold text-base mb-2 text-slate-700">총 인원 수</h4>';
                for (let i = 0; i < grades.length; i++) {
                    legendHtml +=
                        `<div class="flex items-center my-1.5">` +
                        `<i class="inline-block w-4 h-4 mr-2 rounded border border-gray-300" style="background:${getColor(grades[i] + 1)}"></i> ` +
                        `<span class="text-slate-600">${labels[i]}</span>` +
                        `</div>`;
                }
                div.innerHTML = legendHtml;
                return div;
            }
        });
        new LegendControl({ position: 'bottomright' }).addTo(map);
    };

    return <div id="map" ref={mapContainerRef} className="w-full h-[75vh] rounded-xl bg-slate-200" />;
};

export default MapComponent;
