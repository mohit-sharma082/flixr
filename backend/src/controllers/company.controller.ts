import { Request, Response, NextFunction } from 'express';
import { TMDB_ROUTES, tmdbClient } from '../services/tmdbClient';

/**
 * 
 * dummy tmdb response
    details : {
        "description": "",
        "headquarters": "San Francisco, California",
        "homepage": "https://www.lucasfilm.com",
        "id": 1,
        "logo_path": "/o86DbpburjxrqAzEDhXZcyE8pDb.png",
        "name": "Lucasfilm Ltd.",
        "origin_country": "US",
        "parent_company": null
    }
    alternativeNames : {
        "id": 1,
        "results": [
            {
            "name": "루카스필름",
            "type": ""
            },
            {
            "name": "Lucasfilm Limited, LLC",
            "type": ""
            },
            {
            "name": "Lucasfilm Ltd. LLC",
            "type": ""
            },
            {
            "name": "Lucasfilm",
            "type": ""
            }
        ]
    }

    images: {
        "id": 1,
        "logos": [
            {
            "aspect_ratio": 2.97979797979798,
            "file_path": "/o86DbpburjxrqAzEDhXZcyE8pDb.png",
            "height": 99,
            "id": "5aa080d6c3a3683fea00011e",
            "file_type": ".svg",
            "vote_average": 5.384,
            "vote_count": 2,
            "width": 295
            },
            {
            "aspect_ratio": 3.03951367781155,
            "file_path": "/tlVSws0RvvtPBwViUyOFAO0vcQS.png",
            "height": 329,
            "id": "63306b352b8a430096598b3d",
            "file_type": ".svg",
            "vote_average": 5.312,
            "vote_count": 1,
            "width": 1000
            }
        ]
    }

 */
export const getCompanyDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: 'Company ID is required',
            });
        }

        const [details, alternativeNames, images] = await Promise.allSettled([
            tmdbClient.raw(TMDB_ROUTES.companies.details(id)),
            tmdbClient.raw(TMDB_ROUTES.companies.alternative_names(id)),
            tmdbClient.raw(TMDB_ROUTES.companies.images(id)),
        ]);

        return res.json({
            data: {
                details: details.status === 'fulfilled' ? details.value : null,
                alternativeNames:
                    alternativeNames.status === 'fulfilled'
                        ? alternativeNames.value
                        : null,
                images: images.status === 'fulfilled' ? images.value : null,
            },
        });
    } catch (error) {
        next(error);
    }
};
