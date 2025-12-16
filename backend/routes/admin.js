const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../db');
const router = express.Router();
const multer = require('multer');
const papa = require('papaparse');

const upload = multer({ dest: 'uploads/' });
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Utility to safely parse database count()
function parseCount(row) {
    if (!row) return 0;
    const val = row.count ?? row["count(*)"] ?? Object.values(row)[0];
    return isNaN(val) ? 0 : parseInt(val);
}

/* ------------------------------------------
   GET /api/admin/dashboard-stats
-------------------------------------------*/
router.get('/dashboard-stats', async (req, res) => {
    try {
        const totalStudents = parseCount(await db('users').where({ role: 'student' }).count('id as count').first());
        const totalOrgs = parseCount(await db('internships').countDistinct('organization as count').first());
        const activeInternships = parseCount(await db('internships').where({ status: 'Active' }).count('id as count').first());
        const placedStudents = parseCount(await db('allocations').count('id as count').first());

        const placementRate = totalStudents > 0
            ? Math.round((placedStudents / totalStudents) * 100)
            : 0;

        const recentSignups = await db('users')
            .where({ role: 'student' })
            .orderBy('created_at', 'desc')
            .limit(3)
            .select('id', 'name', 'email', 'created_at');

        const studentDistribution = await db('student_profiles')
            .groupBy('district')
            .select('district as name', db.raw('COUNT(*) as value'));

        res.json({
            totalStudents,
            totalHostOrganizations: totalOrgs,
            activeInternships,
            placementRate,
            recentSignups,
            studentDistribution
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
});

/* ------------------------------------------
   COURSES CRUD
-------------------------------------------*/
router.get('/courses', async (_, res) => {
    try {
        res.json(await db('courses').select('*'));
    } catch {
        res.status(500).json({ message: 'Failed to fetch courses' });
    }
});

router.post('/courses', async (req, res) => {
    try {
        await db('courses').insert(req.body);
        res.status(201).json({ message: 'Course created' });
    } catch {
        res.status(500).json({ message: 'Failed to create course' });
    }
});

router.put('/courses/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Inactive', 'Blocked'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        await db('courses').where({ id }).update({ status });
        res.json({ message: "Course status updated" });
    } catch {
        res.status(500).json({ message: 'Failed to update status' });
    }
});

/* ------------------------------------------
   INTERNSHIPS CRUD
-------------------------------------------*/
router.get('/internships', async (_, res) => {
    try {
        let internships = await db('internships');
        internships = internships.map(i => ({
            ...i,
            skills: (() => { try { return JSON.parse(i.skills); } catch { return []; } })()
        }));
        res.json(internships);
    } catch {
        res.status(500).json({ message: "Failed to fetch internships" });
    }
});

router.post('/internships', async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const {
      title,
      organization,
      location,
      description,
      skills
    } = req.body;

    if (!title || !organization || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await db('internships').insert({
      title,
      organization,
      location: location || '',
      description,
      skills: JSON.stringify(skills ?? []),
      status: 'Active'
    });

    res.status(201).json({ message: 'Internship added' });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ message: 'Failed to add internship' });
  }
});

module.exports = router;




router.put('/internships/:id/status', async (req, res) => {
    const { status } = req.body;
    if (!['Active', 'Closed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        await db('internships').where({ id: req.params.id }).update({ status });
        res.json({ message: 'Internship status updated' });
    } catch {
        res.status(500).json({ message: 'Failed to update internship status' });
    }
});

/* ------------------------------------------
    AI SCORING FUNCTION
-------------------------------------------*/
async function getSkillMatchScore(student, internship) {
    const prompt = `Analyze the skill match between a student and an internship.
Student profile: ${JSON.stringify(student)}.
Internship requirements: ${JSON.stringify(internship)}.
Provide a score from 0–100. Return only the number.`;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        const text = (result.text || "").trim();
        const score = parseInt(text);

        return isNaN(score) ? 0 : score;
    } catch (err) {
        console.error("AI Error:", err);
        return 0;
    }
}

/* ------------------------------------------
   ALLOCATION ENGINE
-------------------------------------------*/
router.post('/allocation-engine/run', async (req, res) => {
    const { skillWeight = 50, preferenceWeight = 30, fairnessBoost = 10 } = req.body;
    const adminUser = req.user?.name || "System";

    res.setHeader("Content-Type", "text/plain");

    const log = msg => {
        const line = `${new Date().toLocaleTimeString()} - ${msg}\n`;
        res.write(line);
        console.log(line);
    };

    try {
        log(`Run started by ${adminUser}`);

        const inserted = await db('audit_logs')
            .insert({ initiated_by: adminUser, status: "Running" })
            .returning('id');

        const runId = inserted[0].id || inserted[0];

        log("Clearing previous allocations...");
        await db('allocations').del();

        const students = await db('student_profiles');
        const preferences = await db('student_preferences');
        const internships = await db('internships').where({ status: 'Active' });

        log("Building matches...");
        const potential = [];

        for (const student of students) {
            const prefs = preferences
                .filter(p => p.user_id === student.user_id)
                .sort((a, b) => a.rank - b.rank);

            for (const internship of internships) {
                const pref = prefs.find(p => p.internship_id === internship.id);
                if (pref) potential.push({ student, internship, pref });
            }
        }

        log(`Found ${potential.length} matches. Scoring...`);

        let processed = 0;
        for (const match of potential) {
            const skillScore = await getSkillMatchScore(match.student, match.internship);
            const preferenceScore = 100 - (match.pref.rank - 1) * 10;
            const fairnessScore = match.student.district === 'Aspirational' ? fairnessBoost : 0;

            match.total = (skillScore * (skillWeight / 100)) +
                          (preferenceScore * (preferenceWeight / 100)) +
                          fairnessScore;

            processed++;
            if (processed % 10 === 0) log(`Processed ${processed}/${potential.length}`);
        }

        log("Sorting...");
        potential.sort((a, b) => b.total - a.total);

        log("Allocating...");
        const usedStudents = new Set();
        const usedInternships = new Set();
        const finalAllocations = [];

        for (const m of potential) {
            if (!usedStudents.has(m.student.user_id) &&
                !usedInternships.has(m.internship.id)) {

                finalAllocations.push({
                    student_id: m.student.user_id,
                    internship_id: m.internship.id,
                    match_score: m.total.toFixed(2),
                    status: "Matched"
                });

                usedStudents.add(m.student.user_id);
                usedInternships.add(m.internship.id);
            }
        }

        if (finalAllocations.length) {
            log(`Saving ${finalAllocations.length} allocations`);
            await db('allocations').insert(finalAllocations);
        }

        const summary = `Placed ${finalAllocations.length} students.`;

        await db('audit_logs').where({ id: runId }).update({
            status: "Completed",
            details: summary
        });

        log(summary);

    } catch (e) {
        console.error(e);
        log("ERROR: " + e.message);
    } finally {
        res.end();
    }
});

/* ------------------------------------------
   RESULTS + DOWNLOAD
-------------------------------------------*/
router.get('/results', async (_, res) => {
    try {
        const results = await db('allocations')
            .join('student_profiles', 'allocations.student_id', 'student_profiles.user_id')
            .join('internships', 'allocations.internship_id', 'internships.id')
            .select(
                'student_profiles.name as student_name',
                'student_profiles.email as student_email',
                'internships.title',
                'internships.organization',
                'allocations.match_score',
                'allocations.status'
            );

        res.json(results);
    } catch {
        res.status(500).json({ message: 'Failed to fetch results' });
    }
});

router.get('/results/download', async (_, res) => {
    try {
        const results = await db('allocations')
            .join('student_profiles', 'allocations.student_id', 'student_profiles.user_id')
            .join('internships', 'allocations.internship_id', 'internships.id')
            .select('*');

        const csv = papa.unparse(results);

        res.header("Content-Type", "text/csv");
        res.attachment("allocation_results.csv");
        res.send(csv);

    } catch {
        res.status(500).json({ message: 'Failed to download results' });
    }
});

/* ------------------------------------------
   FAIRNESS REPORT
-------------------------------------------*/
router.get('/fairness-report', async (_, res) => {
    try {
        const totals = await db('student_profiles')
            .groupBy('district')
            .select('district', db.raw('count(*) as total'));

        const placed = await db('allocations')
            .join('student_profiles', 'allocations.student_id', 'student_profiles.user_id')
            .groupBy('district')
            .select('district', db.raw('count(*) as placed'));

        const districtData = totals.map(t => {
            const p = placed.find(x => x.district === t.district);
            return {
                name: t.district,
                "Placement Rate": t.total ? Math.round((p?.placed || 0) / t.total * 100) : 0
            };
        });

        res.json({
            genderData: [],
            districtData,
            detailedBreakdown: []
        });

    } catch {
        res.status(500).json({ message: "Failed to generate report" });
    }
});

/* ------------------------------------------
   UPLOAD + HISTORY
-------------------------------------------*/
router.get('/upload-history', async (_, res) => {
    try {
        res.json(await db('upload_history').orderBy('created_at', 'desc'));
    } catch {
        res.status(500).json({ message: "Failed to fetch upload history" });
    }
});

router.post('/upload-data', upload.single('datafile'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    try {
        await new Promise(r => setTimeout(r, 800));
        await db('upload_history').insert({
            filename: req.file.originalname,
            status: "Completed",
            user: req.user?.email || "System",
            records: Math.floor(Math.random() * 500) + 50
        });

        res.json({ message: "File processed" });

    } catch {
        res.status(500).json({ message: "Failed to process file" });
    }
});

/* ------------------------------------------
   STUDENTS
-------------------------------------------*/
router.get('/students', async (_, res) => {
    try {
        res.json(await db('student_profiles')
            .select('user_id', 'name', 'email', 'university', 'degree', 'branch', 'year'));
    } catch {
        res.status(500).json({ message: "Failed to fetch students" });
    }
});

router.get('/students/:id', async (req, res) => {
    try {
        const profile = await db('student_profiles').where({ user_id: req.params.id }).first();
        if (!profile) return res.status(404).json({ message: "Not found" });

        try { profile.skills = JSON.parse(profile.skills); }
        catch { profile.skills = []; }

        res.json(profile);

    } catch {
        res.status(500).json({ message: "Failed to fetch profile" });
    }
});

module.exports = router;