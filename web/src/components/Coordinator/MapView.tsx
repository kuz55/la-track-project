import React, { useEffect, useRef } from 'react';

const MapView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Загрузка скрипта 2ГИС API (это пример, точный способ зависит от документации 2ГИС)
    // Лучше всего использовать официальный npm пакет, если он есть, или загружать скрипт динамически
    const script = document.createElement('script');
    script.src = 'https://maps.api.2gis.ru/3.0/loader.js'; // Пример URL
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.DG) {
        // @ts-ignore
        const map = DG.map(mapContainerRef.current, {
          center: [54.98, 82.89], // Новосибирск
          zoom: 13,
          fullscreenControl: true,
        });

        // Пример добавления маркера
        DG.marker([54.98, 82.89]).addTo(map).bindPopup('Новосибирск');

        // Здесь будет логика для отображения зон поиска, маршрутов, позиций
        // Загрузка данных с сервера через api.get и отрисовка на карте
        // DG.polygon([...], {...}).addTo(map);
        // DG.polyline([...], {...}).addTo(map);
        // DG.marker([...], {...}).addTo(map);
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      // Очистка карты при размонтировании компонента
      // if (window.DG && map) {
      //   map.remove();
      // }
    };
  }, []);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }}></div>;
};

export default MapView;