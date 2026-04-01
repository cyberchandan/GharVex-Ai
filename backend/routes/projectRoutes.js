const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getMyProjects,
  getProjectById,
  submitBid,
  getProjectBids,
  acceptBid,
} = require('../controllers/projectController');
const { protect, contractor } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createProject)
  .get(protect, contractor, getProjects);

router.route('/myprojects')
  .get(protect, getMyProjects);

router.route('/:id')
  .get(protect, getProjectById);

router.route('/:id/bids')
  .post(protect, contractor, submitBid)
  .get(protect, getProjectBids);

router.route('/:id/bids/:bidId/accept')
  .put(protect, acceptBid);

module.exports = router;
