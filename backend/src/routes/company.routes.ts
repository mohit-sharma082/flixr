import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getCompanyDetails } from '../controllers/company.controller';

const router = Router();
router.get('/:id', asyncHandler(getCompanyDetails));

export default router;
