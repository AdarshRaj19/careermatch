
const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/public/internships
router.get('/internships', async (req, res) => {
    try {
        const internships = await db('internships').where({ status: 'Active' });
        // Knex returns skills as a JSON string, so we need to parse it.
        const parsedInternships = internships.map(internship => ({
            ...internship,
            skills: JSON.parse(internship.skills)
        }));
        res.json(parsedInternships);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch internships' });
    }
});

// GET /api/public/courses
router.get('/courses', async (req, res) => {
    try {
        const courses = await db('courses').where({ status: 'Active' });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch courses' });
    }
});


module.exports = router;
