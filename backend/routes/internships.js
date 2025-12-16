const express = require('express');
const router = express.Router();
const db = require('../db');

/* ------------------------------------------
   GET ALL INTERNSHIPS
-------------------------------------------*/
router.get('/', async (req, res) => {
  try {
    const internships = await db('internships').select('*');

    const formatted = internships.map(i => ({
      ...i,
      skills: (() => {
        try {
          return i.skills ? JSON.parse(i.skills) : [];
        } catch {
          return [];
        }
      })()
    }));

    res.json(formatted);
  } catch (error) {
    console.error("GET INTERNSHIPS ERROR:", error);
    res.status(500).json({ message: 'Failed to fetch internships' });
  }
});

/* ------------------------------------------
   ADD INTERNSHIP
-------------------------------------------*/
router.post('/', async (req, res) => {
  try {
    console.log("REQUEST BODY:", req.body);

    const {
      title,
      organization,
      location,
      description,
      skills,
      status,
      type,
      experienceLevel
    } = req.body;

    if (!title || !organization || !description) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    await db('internships').insert({
      title,
      organization,
      location: location || '',
      description,
      skills: JSON.stringify(skills || []),
      status: status || 'Active',
      type: type || 'On-site',
      experienceLevel: experienceLevel || 'Entry-level'
    });

    res.status(201).json({ message: 'Internship added successfully' });

  } catch (error) {
    console.error("ADD INTERNSHIP ERROR:", error);
    res.status(500).json({
      message: 'Failed to add internship',
      error: error.message
    });
  }
});

/* ------------------------------------------
   UPDATE INTERNSHIP STATUS
-------------------------------------------*/
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;

  if (!['Active', 'Closed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    await db('internships')
      .where({ id: req.params.id })
      .update({ status });

    res.json({ message: 'Internship status updated' });
  } catch (error) {
    console.error("STATUS UPDATE ERROR:", error);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

module.exports = router;
