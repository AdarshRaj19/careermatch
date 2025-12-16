const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../db');
const router = express.Router();
const multer = require('multer');
const papa = require('papaparse');
const fs = require('fs');

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
async function getSkillMatchScore(student, internship, log) {
    // Parse skills if they're JSON strings
    let studentSkills = [];
    let internshipSkills = [];
    
    try {
        if (typeof student.skills === 'string') {
            studentSkills = JSON.parse(student.skills || '[]');
        } else if (Array.isArray(student.skills)) {
            studentSkills = student.skills;
        }
    } catch (e) {
        studentSkills = [];
    }
    
    try {
        if (typeof internship.skills === 'string') {
            internshipSkills = JSON.parse(internship.skills || '[]');
        } else if (Array.isArray(internship.skills)) {
            internshipSkills = internship.skills;
        }
    } catch (e) {
        internshipSkills = [];
    }

    // Fallback: Simple skill matching if AI fails
    const calculateSimpleScore = () => {
        if (internshipSkills.length === 0) return 50; // Default score if no skills specified
        if (studentSkills.length === 0) return 20; // Low score if student has no skills
        
        const matchingSkills = studentSkills.filter(s => 
            internshipSkills.some(is => 
                s.toLowerCase().includes(is.toLowerCase()) || 
                is.toLowerCase().includes(s.toLowerCase())
            )
        );
        
        const matchRatio = matchingSkills.length / internshipSkills.length;
        return Math.round(matchRatio * 100);
    };

    const prompt = `Analyze the skill match between a student and an internship.
Student skills: ${JSON.stringify(studentSkills)}.
Student profile: ${student.name || 'Unknown'}, ${student.degree || 'N/A'}, ${student.branch || 'N/A'}.
Internship: ${internship.title || 'Unknown'} at ${internship.organization || 'Unknown'}.
Required skills: ${JSON.stringify(internshipSkills)}.
Provide a score from 0–100. Return only the number.`;

    try {
        const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = (response.text() || "").trim();
        const score = parseInt(text);

        if (isNaN(score) || score < 0 || score > 100) {
            log(`AI returned invalid score: ${text}, using fallback`);
            return calculateSimpleScore();
        }
        
        return score;
    } catch (err) {
        log(`AI Error: ${err.message}, using fallback scoring`);
        return calculateSimpleScore();
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

        // NOTE: SQLite typically doesn't support `.returning()` reliably,
        // so we grab the inserted id directly from the insert result.
        const insertResult = await db('audit_logs')
            .insert({ initiated_by: adminUser, status: "Running" });
        const runId = Array.isArray(insertResult) ? insertResult[0] : insertResult;

        log("Clearing previous allocations...");
        await db('allocations').del();

        const students = await db('student_profiles');
        const preferences = await db('student_preferences');
        const internships = await db('internships').where({ status: 'Active' });

        log(`Found ${students.length} students, ${preferences.length} preferences, ${internships.length} active internships`);

        if (students.length === 0) {
            log("ERROR: No students found in database");
            throw new Error("No students found");
        }

        if (internships.length === 0) {
            log("ERROR: No active internships found");
            throw new Error("No active internships found");
        }

        if (preferences.length === 0) {
            log("WARNING: No student preferences found. Students need to submit preferences first.");
            throw new Error("No student preferences found. Students must submit preferences before allocation can run.");
        }

        log("Building matches...");
        const potential = [];

        for (const student of students) {
            const prefs = preferences
                .filter(p => p.user_id === student.user_id)
                .sort((a, b) => a.rank - b.rank);

            if (prefs.length === 0) {
                log(`Student ${student.name || student.user_id} has no preferences, skipping`);
                continue;
            }

            for (const internship of internships) {
                const pref = prefs.find(p => p.internship_id === internship.id);
                if (pref) {
                    potential.push({ student, internship, pref });
                }
            }
        }

        log(`Found ${potential.length} potential matches. Scoring...`);

        if (potential.length === 0) {
            log("ERROR: No matches found. Students may not have preferences for available internships.");
            throw new Error("No matches found between student preferences and available internships");
        }

        let processed = 0;
        for (const match of potential) {
            const skillScore = await getSkillMatchScore(match.student, match.internship, log);
            const preferenceScore = 100 - (match.pref.rank - 1) * 10;
            const fairnessScore = match.student.district === 'Aspirational' ? fairnessBoost : 0;

            match.total = (skillScore * (skillWeight / 100)) +
                          (preferenceScore * (preferenceWeight / 100)) +
                          fairnessScore;

            processed++;
            if (processed % 10 === 0) log(`Processed ${processed}/${potential.length} matches`);
        }

        log("Sorting matches by score...");
        potential.sort((a, b) => b.total - a.total);

        log("Allocating internships...");
        const usedStudents = new Set();
        const usedInternships = new Set();
        const finalAllocations = [];

        for (const m of potential) {
            if (!usedStudents.has(m.student.user_id) &&
                !usedInternships.has(m.internship.id)) {

                finalAllocations.push({
                    student_id: m.student.user_id,
                    internship_id: m.internship.id,
                    match_score: parseFloat(m.total.toFixed(2)),
                    status: "Matched"
                });

                usedStudents.add(m.student.user_id);
                usedInternships.add(m.internship.id);
                
                log(`Allocated: ${m.student.name || m.student.user_id} -> ${m.internship.title} (score: ${m.total.toFixed(2)})`);
            }
        }

        if (finalAllocations.length > 0) {
            log(`Saving ${finalAllocations.length} allocations to database...`);
            try {
                await db('allocations').insert(finalAllocations);
                log(`Successfully saved ${finalAllocations.length} allocations`);
            } catch (insertError) {
                log(`ERROR inserting allocations: ${insertError.message}`);
                throw insertError;
            }
        } else {
            log("WARNING: No allocations created. All students or internships may already be matched.");
        }

        const summary = `Allocation complete! Placed ${finalAllocations.length} students out of ${students.length} total students.`;

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

router.get('/fairness-report/download', async (_, res) => {
    try {
        const totals = await db('student_profiles')
            .groupBy('district')
            .select('district', db.raw('count(*) as total'));

        const placed = await db('allocations')
            .join('student_profiles', 'allocations.student_id', 'student_profiles.user_id')
            .groupBy('district')
            .select('district', db.raw('count(*) as placed'));

        const reportData = totals.map(t => {
            const p = placed.find(x => x.district === t.district);
            return {
                District: t.district,
                'Total Students': t.total,
                'Placed Students': p?.placed || 0,
                'Placement Rate (%)': t.total ? Math.round((p?.placed || 0) / t.total * 100) : 0
            };
        });

        const csv = papa.unparse(reportData);
        res.header("Content-Type", "text/csv");
        res.attachment("fairness_report.csv");
        res.send(csv);

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
        // Parse CSV file
        const filePath = req.file.path;
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        let recordsProcessed = 0;
        let errorMessage = null;

        try {
            const parsed = papa.parse(fileContent, { header: true, skipEmptyLines: true });
            const rows = parsed.data || [];
            recordsProcessed = rows.length;

            // Determine file type based on columns
            const firstRow = rows[0] || {};
            const columns = Object.keys(firstRow);

            if (columns.some(col => ['name', 'email', 'university', 'degree'].includes(col.toLowerCase()))) {
                // Student data upload
                for (const row of rows) {
                    try {
                        // Check if user exists
                        let user = await db('users').where({ email: row.email }).first();
                        
                        if (!user) {
                            // Create user (SQLite compatible)
                            const insertResult = await db('users').insert({
                                name: row.name || 'Unknown',
                                email: row.email,
                                password_hash: 'uploaded', // Placeholder - should be set properly
                                role: 'student'
                            });
                            // SQLite returns lastInsertRowid as a number
                            const userId = typeof insertResult === 'number' ? insertResult : (Array.isArray(insertResult) ? insertResult[0] : insertResult);
                            user = await db('users').where({ id: userId }).first();
                        }

                        // Create or update student profile
                        const profileData = {
                            user_id: user.id,
                            name: row.name || '',
                            email: row.email || '',
                            phone: row.phone || '',
                            university: row.university || '',
                            college: row.college || '',
                            degree: row.degree || '',
                            branch: row.branch || '',
                            year: parseInt(row.year) || null,
                            cgpa: row.cgpa || '',
                            creditsEarned: parseInt(row.creditsEarned) || 0,
                            district: row.district || '',
                            skills: JSON.stringify((row.skills || '').split(',').map(s => s.trim()).filter(Boolean))
                        };

                        await db('student_profiles')
                            .where({ user_id: user.id })
                            .update(profileData)
                            .then(async (updated) => {
                                if (updated === 0) {
                                    await db('student_profiles').insert(profileData);
                                }
                            });
                    } catch (rowError) {
                        console.error(`Error processing row:`, rowError);
                    }
                }
            } else if (columns.some(col => ['title', 'organization', 'description'].includes(col.toLowerCase()))) {
                // Internship data upload
                for (const row of rows) {
                    try {
                        const internshipData = {
                            title: row.title || '',
                            organization: row.organization || '',
                            location: row.location || '',
                            description: row.description || '',
                            skills: JSON.stringify((row.skills || '').split(',').map(s => s.trim()).filter(Boolean)),
                            status: row.status || 'Active',
                            type: row.type || 'On-site',
                            experienceLevel: row.experienceLevel || 'Entry-level'
                        };

                        await db('internships').insert(internshipData);
                    } catch (rowError) {
                        console.error(`Error processing row:`, rowError);
                    }
                }
            }
        } catch (parseError) {
            errorMessage = `Failed to parse file: ${parseError.message}`;
            recordsProcessed = 0;
        }

        // Clean up uploaded file
        try {
            fs.unlinkSync(filePath);
        } catch (unlinkError) {
            console.error('Failed to delete temp file:', unlinkError);
        }

        await db('upload_history').insert({
            filename: req.file.originalname,
            status: errorMessage ? "Failed" : "Completed",
            user: req.user?.email || "System",
            records: recordsProcessed,
            error_message: errorMessage
        });

        if (errorMessage) {
            return res.status(400).json({ message: errorMessage });
        }

        res.json({ message: `File processed successfully. ${recordsProcessed} records imported.` });

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Failed to process file", error: error.message });
    }
});

/* ------------------------------------------
   TEMPLATE DOWNLOADS
-------------------------------------------*/
router.get('/templates/students', async (_, res) => {
    try {
        const headers = ['name', 'email', 'phone', 'university', 'college', 'degree', 'branch', 'year', 'cgpa', 'creditsEarned', 'district', 'skills'];
        const csv = papa.unparse([headers], { header: true });
        
        res.header("Content-Type", "text/csv");
        res.attachment("student_template.csv");
        res.send(csv);
    } catch {
        res.status(500).json({ message: "Failed to generate template" });
    }
});

router.get('/templates/internships', async (_, res) => {
    try {
        const headers = ['title', 'organization', 'location', 'description', 'skills', 'status', 'type', 'experienceLevel'];
        const csv = papa.unparse([headers], { header: true });
        
        res.header("Content-Type", "text/csv");
        res.attachment("internship_template.csv");
        res.send(csv);
    } catch {
        res.status(500).json({ message: "Failed to generate template" });
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

/* ------------------------------------------
   AUDIT LOGS
-------------------------------------------*/
router.get('/audit-logs', async (_, res) => {
    try {
        const logs = await db('audit_logs')
            .orderBy('created_at', 'desc')
            .select('*');
        res.json(logs);
    } catch {
        res.status(500).json({ message: "Failed to fetch audit logs" });
    }
});

/* ------------------------------------------
   WHAT-IF SIMULATOR
-------------------------------------------*/
router.get('/what-if-simulator/initial-data', async (_, res) => {
    try {
        // Get current allocation stats by district
        const currentAllocations = await db('allocations')
            .join('student_profiles', 'allocations.student_id', 'student_profiles.user_id')
            .groupBy('student_profiles.district')
            .select('student_profiles.district as name', db.raw('COUNT(*) * 100.0 / (SELECT COUNT(*) FROM student_profiles WHERE district = student_profiles.district) as "Current"'))
            .then(rows => rows.map(r => ({
                name: r.name || 'Unknown',
                Current: parseFloat(r.Current) || 0,
                Simulated: parseFloat(r.Current) || 0
            })));

        res.json(currentAllocations.length > 0 ? currentAllocations : [
            { name: 'Aspirational', Current: 0, Simulated: 0 },
            { name: 'Developed', Current: 0, Simulated: 0 }
        ]);
    } catch {
        res.status(500).json({ message: "Failed to fetch initial data" });
    }
});

router.post('/what-if-simulator/run', async (req, res) => {
    const { skillWeight = 50, preferenceWeight = 30, fairnessBoost = 10 } = req.body;
    
    try {
        // Run a simulation without saving allocations
        const students = await db('student_profiles');
        const preferences = await db('student_preferences');
        const internships = await db('internships').where({ status: 'Active' });

        const potential = [];
        for (const student of students) {
            const prefs = preferences
                .filter(p => p.user_id === student.user_id)
                .sort((a, b) => a.rank - b.rank);

            for (const internship of internships) {
                const pref = prefs.find(p => p.internship_id === internship.id);
                if (pref) {
                    // Simple scoring without AI
                    const preferenceScore = 100 - (pref.rank - 1) * 10;
                    const fairnessScore = student.district === 'Aspirational' ? fairnessBoost : 0;
                    const skillScore = 50; // Default score for simulation
                    
                    potential.push({
                        student,
                        internship,
                        total: (skillScore * (skillWeight / 100)) +
                               (preferenceScore * (preferenceWeight / 100)) +
                               fairnessScore
                    });
                }
            }
        }

        potential.sort((a, b) => b.total - a.total);

        const usedStudents = new Set();
        const usedInternships = new Set();
        const simulatedAllocations = [];

        for (const m of potential) {
            if (!usedStudents.has(m.student.user_id) && !usedInternships.has(m.internship.id)) {
                simulatedAllocations.push({
                    student_id: m.student.user_id,
                    district: m.student.district
                });
                usedStudents.add(m.student.user_id);
                usedInternships.add(m.internship.id);
            }
        }

        // Calculate simulated placement rates by district
        const districtCounts = {};
        simulatedAllocations.forEach(a => {
            const district = a.district || 'Unknown';
            districtCounts[district] = (districtCounts[district] || 0) + 1;
        });

        const totalByDistrict = {};
        students.forEach(s => {
            const district = s.district || 'Unknown';
            totalByDistrict[district] = (totalByDistrict[district] || 0) + 1;
        });

        const chartData = Object.keys(totalByDistrict).map(district => ({
            name: district,
            Current: 0, // Would need to fetch from actual allocations
            Simulated: totalByDistrict[district] > 0 
                ? Math.round((districtCounts[district] || 0) / totalByDistrict[district] * 100)
                : 0
        }));

        res.json(chartData.length > 0 ? chartData : [
            { name: 'Aspirational', Current: 0, Simulated: 0 },
            { name: 'Developed', Current: 0, Simulated: 0 }
        ]);
    } catch (error) {
        console.error("Simulation error:", error);
        res.status(500).json({ message: "Failed to run simulation" });
    }
});

module.exports = router;