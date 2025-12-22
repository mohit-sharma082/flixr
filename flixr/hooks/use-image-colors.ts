import { useEffect, useState } from 'react';
import { getColors, multiply } from 'react-native-image-palette';

export const useImageColors = (imgUri: string) => {
    const [colors, setColors] = useState(null);
    const [err, setErr] = useState<any>();

    useEffect(() => {
        (async () => {
            try {
                if (!imgUri) return;
                const res = await getColors(imgUri);
                // console.log('colors', res);
                setColors(res);
            } catch (error: any) {
                // console.log('colors', error);
                setErr(JSON.stringify({ error: error?.message ?? error }));
            }
        })();
    }, [imgUri]);

    return colors;
};
