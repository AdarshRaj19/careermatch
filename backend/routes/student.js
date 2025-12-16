const express = require('express');
const db = require('../db');
const multer = require('multer');
const path = require('path');
//const { GoogleGenAI } = require('@google/genai');
//const { GoogleGenerativeAI } = require("@google/generative-ai");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const router = express.Router();
//const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, req.user.id + '-' + file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// GET /api/student/profile
router.get('/profile', async (req, res) => {
    try {
        const profile = await db('student_profiles').where({ user_id: req.user.id }).first();
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        // Parse skills from JSON string
        profile.skills = JSON.parse(profile.skills || '[]');
        
        // Fetch quick stats
        const preferences = await db('student_preferences').where({ user_id: req.user.id }).count('id as count').first();
        const allocation = await db('allocations').where({ student_id: req.user.id }).first();
        
        const quickStats = {
            preferencesSubmitted: preferences.count,
            allocationStatus: allocation ? 'Allocated' : 'Not Allocated',
        };

        res.json({ profile, quickStats });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
});

// PUT /api/student/profile
router.put('/profile', async (req, res) => {
    const { id, user_id, email, ...profileData } = req.body;
    try {
        const dataToUpdate = { ...profileData };
        // Stringify skills array if it exists
        if (profileData.skills) {
            dataToUpdate.skills = JSON.stringify(profileData.skills);
        }
        await db('student_profiles').where({ user_id: req.user.id }).update(dataToUpdate);
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
});

// POST /api/student/profile/avatar
router.post('/profile/avatar', upload.single('avatar'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded.' });
    }
    try {
        const avatarUrl = `/uploads/${req.file.filename}`;
        await db('student_profiles').where({ user_id: req.user.id }).update({ avatar_url: avatarUrl });
        res.status(200).json({ message: 'Avatar updated successfully', avatarUrl });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update avatar' });
    }
});

// POST /api/student/resume/upload
router.post('/resume/upload', upload.single('resume'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded.' });
    }
    try {
        const resumeUrl = `/uploads/${req.file.filename}`;
        await db('student_profiles').where({ user_id: req.user.id }).update({ resume_url: resumeUrl });
        res.status(200).json({ message: 'Resume uploaded successfully', resumeUrl });
    } catch (error) {
        res.status(500).json({ message: 'Failed to upload resume' });
    }
});


// POST /api/student/resume/analyze
router.post('/resume/analyze', async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText) {
    return res.status(400).json({ message: 'resumeText is required' });
  }

  try {
    const prompt = `Extract all the technical and soft skills from the following resume text. Respond with only a JSON object containing a single key "skills" which is an array of strings. Do not include any other text or formatting. Resume text: "${resumeText}"`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    
    // The response text is expected to be a stringified JSON.
    const result = JSON.parse(response.text);
    res.json({ skills: result.skills || [] });

  } catch (error) {
    console.error("Gemini resume analysis error:", error);
    res.status(500).json({ message: 'Failed to analyze resume with AI.' });
  }
});

// GET /api/student/preferences
router.get('/preferences', async (req, res) => {
    try {
        const preferences = await db('student_preferences')
            .join('internships', 'student_preferences.internship_id', 'internships.id')
            .where({ 'student_preferences.user_id': req.user.id })
            .select('internships.*', 'student_preferences.rank')
            .orderBy('rank', 'asc');
        
        const parsedPreferences = preferences.map(p => ({ ...p, skills: JSON.parse(p.skills) }));
        res.json(parsedPreferences);
    } catch (error) {
        console.error('Failed to fetch preferences:', error);
        res.status(500).json({ message: 'Failed to fetch preferences' });
    }
});

// POST /api/student/preferences
router.post('/preferences', async (req, res) => {
    const { rankedIds } = req.body; // Expecting an array of internship IDs in order
    const userId = req.user.id;

    if (!Array.isArray(rankedIds)) {
        return res.status(400).json({ message: 'rankedIds must be an array' });
    }

    try {
        await db.transaction(async (trx) => {
            // Delete old preferences for this user
            await trx('student_preferences').where({ user_id: userId }).del();

            // Insert new preferences
            if (rankedIds.length > 0) {
                const preferencesToInsert = rankedIds.map((internshipId, index) => ({
                    user_id: userId,
                    internship_id: internshipId,
                    rank: index + 1,
                }));
                await trx('student_preferences').insert(preferencesToInsert);
            }
        });
        res.status(200).json({ message: 'Preferences saved successfully' });
    } catch (error) {
        console.error('Failed to save preferences:', error);
        res.status(500).json({ message: 'Failed to save preferences' });
    }
});


// GET /api/student/allocation
router.get('/allocation', async (req, res) => {
    try {
        const allocation = await db('allocations')
            .join('internships', 'allocations.internship_id', 'internships.id')
            .where({ 'allocations.student_id': req.user.id })
            .select('internships.*', 'allocations.status as allocation_status', 'allocations.match_score')
            .first();

        if (allocation) {
             allocation.skills = JSON.parse(allocation.skills);
        }
        
        const completedCourses = await db('student_courses')
            .join('courses', 'student_courses.course_id', 'courses.id')
            .where({ 'student_courses.user_id': req.user.id, 'student_courses.status': 'completed' })
            .select('courses.*');

        res.json({ allocation, completedCourses });
    } catch(e) {
        res.status(500).json({ message: 'Failed to fetch allocation data' });
    }
});

// POST /api/student/allocation/respond
router.post('/allocation/respond', async (req, res) => {
    const { status } = req.body; // 'Accepted' or 'Declined'
    if (!['Accepted', 'Declined'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }
    try {
        await db('allocations').where({ student_id: req.user.id }).update({ status });
        res.status(200).json({ message: `Offer ${status.toLowerCase()}` });
    } catch (e) {
        res.status(500).json({ message: 'Failed to update offer status' });
    }
});


// GET /api/student/notifications
router.get('/notifications', async (req, res) => {
    try {
        const notifications = await db('notifications')
            .where({ user_id: req.user.id })
            .orderBy('created_at', 'desc');
        res.json(notifications);
    } catch (e) {
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
});

// GET /api/student/notifications/summary
router.get('/notifications/summary', async (req, res) => {
    try {
        const unreadCountResult = await db('notifications')
            .where({ user_id: req.user.id, is_read: false })
            .count('id as count')
            .first();

        const recent = await db('notifications')
            .where({ user_id: req.user.id })
            .orderBy('created_at', 'desc')
            .limit(3);
            
        res.json({
            unreadCount: unreadCountResult.count,
            recent,
        });
    } catch (e) {
        res.status(500).json({ message: 'Failed to fetch notification summary' });
    }
});

// POST /api/student/notifications/mark-read
router.post('/notifications/mark-read', async (req, res) => {
    const { notificationId } = req.body;
    try {
        await db('notifications')
            .where({ id: notificationId, user_id: req.user.id })
            .update({ is_read: true });
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (e) {
        res.status(500).json({ message: 'Failed to mark notification as read' });
    }
});

// --- New Endpoints for Notification Settings ---

// GET /api/student/notification-settings
router.get('/notification-settings', async (req, res) => {
    try {
        let settings = await db('notification_settings').where({ user_id: req.user.id }).first();
        if (!settings) {
            // If no settings exist for the user, create and return default ones.
            [settings] = await db('notification_settings').insert({
                user_id: req.user.id,
                new_internship_alerts: true,
                alert_frequency: 'daily',
                alert_method_in_app: true,
                alert_method_email: false,
            }).returning('*');
        }
        res.json(settings);
    } catch (e) {
        res.status(500).json({ message: 'Failed to fetch notification settings' });
    }
});

// PUT /api/student/notification-settings
router.put('/notification-settings', async (req, res) => {
    const { new_internship_alerts, alert_frequency, alert_method_in_app, alert_method_email } = req.body;
    try {
        await db('notification_settings')
            .where({ user_id: req.user.id })
            .update({
                new_internship_alerts,
                alert_frequency,
                alert_method_in_app,
                alert_method_email
            });
        res.status(200).json({ message: 'Settings updated successfully' });
    } catch (e) {
        console.error("Failed to update settings:", e);
        res.status(500).json({ message: 'Failed to update notification settings' });
    }
});


// GET /api/student/saved-items
router.get('/saved-items', async (req, res) => {
    try {
        const saved = await db('saved_items').where({ user_id: req.user.id });
        const courseIds = saved.filter(i => i.item_type === 'course').map(i => i.item_id);
        const internshipIds = saved.filter(i => i.item_type === 'internship').map(i => i.item_id);

        const savedCourses = courseIds.length > 0 ? await db('courses').whereIn('id', courseIds) : [];
        let savedInternships = internshipIds.length > 0 ? await db('internships').whereIn('id', internshipIds) : [];
        savedInternships = savedInternships.map(i => ({...i, skills: JSON.parse(i.skills)}));
        
        res.json({ savedCourses, savedInternships });
    } catch (e) {
         res.status(500).json({ message: 'Failed to fetch saved items' });
    }
});

// POST /api/student/saved-items
router.post('/saved-items', async (req, res) => {
    const { itemId, itemType } = req.body;
    try {
        await db('saved_items').insert({ user_id: req.user.id, item_id: itemId, item_type: itemType });
        res.status(201).json({ message: 'Item saved' });
    } catch (e) {
        // Ignore unique constraint violation errors (already saved)
        if (e.code !== 'SQLITE_CONSTRAINT') {
             return res.status(500).json({ message: 'Failed to save item' });
        }
        res.status(200).json({ message: 'Item already saved' });
    }
});

// DELETE /api/student/saved-items
router.delete('/saved-items', async (req, res) => {
    const { itemId, itemType } = req.body;
    try {
        await db('saved_items').where({ user_id: req.user.id, item_id: itemId, item_type: itemType }).del();
        res.status(200).json({ message: 'Item removed' });
    } catch (e) {
        res.status(500).json({ message: 'Failed to remove item' });
    }
});

// GET /api/student/courses
router.get('/courses', async (req, res) => {
    try {
        const studentCourses = await db('student_courses').where({ user_id: req.user.id });
        const allCourses = await db('courses').where({ status: 'Active' });

        const inProgressCourses = allCourses
            .filter(c => studentCourses.find(sc => sc.course_id === c.id && sc.status === 'in-progress'))
            .map(c => ({ ...c, progress: studentCourses.find(sc => sc.course_id === c.id).progress }));
            
        const studentCourseIds = studentCourses.map(sc => sc.course_id);
        const exploreCourses = allCourses.filter(c => !studentCourseIds.includes(c.id));
        
        res.json({ inProgressCourses, exploreCourses });
    } catch (e) {
        res.status(500).json({ message: 'Failed to fetch courses' });
    }
});

// POST /api/student/courses/enroll
router.post('/courses/enroll', async (req, res) => {
    const { courseId } = req.body;
    try {
        await db('student_courses').insert({
            user_id: req.user.id,
            course_id: courseId,
            status: 'in-progress',
            progress: 0
        });
        res.status(201).json({ message: 'Enrolled successfully' });
    } catch (e) {
        res.status(400).json({ message: 'Already enrolled or invalid course.' });
    }
});

// POST /api/student/ai-advisor/career-quiz
router.post('/ai-advisor/career-quiz', async (req, res) => {
    const { answers } = req.body;
    const courses = await db('courses').where({ status: 'Active' }).select('id', 'title', 'provider', 'category', 'description');
    
    const prompt = `A student has answered a career quiz. Their answers are: ${answers.join(', ')}. Based on these answers, suggest 2 suitable tech career paths with a brief, encouraging description for each. Also, recommend 3 relevant courses from the following list that would be a good starting point. Course list: ${JSON.stringify(courses)}. Respond with a JSON object with two keys: "careerPaths" (an array of objects with "path" and "description") and "recommendedCourses" (an array of objects, each object being a full course item from the provided list).`;

    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: 'application/json' } });
        const result = JSON.parse(response.text);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Failed to get AI recommendations." });
    }
});

// POST /api/student/ai-advisor/analyze-skills
router.post('/ai-advisor/analyze-skills', async (req, res) => {
    const { jobTitle } = req.body;
    const profile = await db('student_profiles').where({ user_id: req.user.id }).first();
    const studentSkills = JSON.parse(profile.skills || '[]');
    const courses = await db('courses').where({ status: 'Active' }).select('id', 'title', 'provider', 'category');

    const prompt = `A student with the skills [${studentSkills.join(', ')}] wants to become a "${jobTitle}". Analyze the skill gap. Identify 3-5 crucial skills they are likely missing. Then, recommend the 3 most relevant courses from this list to help them bridge that gap: ${JSON.stringify(courses)}. Respond with a JSON object with two keys: "missingSkills" (an array of strings) and "recommendedCourses" (an array of full course objects from the provided list).`;
    
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: 'application/json' } });
        const result = JSON.parse(response.text);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Failed to get AI recommendations." });
    }
});

// POST /api/student/ai-advisor/chat
router.post('/ai-advisor/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ message: "Message is required." });
    }

    try {
        const profile = await db('student_profiles').where({ user_id: req.user.id }).first();
        profile.skills = JSON.parse(profile.skills || '[]');
        const { id, user_id, ...profileContext } = profile;

        const systemInstruction = `You are a friendly and professional career advisor named CareerMatch AI. You are talking to a student. Use their profile information to provide personalized, helpful, and encouraging advice. Be concise. Student Profile: ${JSON.stringify(profileContext)}`;

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
        });

        const response = await chat.sendMessage({ message });
        
        res.json({ reply: response.text });

    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ message: "Failed to get response from AI advisor." });
    }
});


// --- New Endpoints for Internship Page Features ---

// GET /api/student/applications
router.get('/applications', async (req, res) => {
    try {
        const statuses = await db('internship_applications')
            .where({ user_id: req.user.id })
            .select('internship_id', 'status');
        res.json(statuses);
    } catch (e) {
        res.status(500).json({ message: 'Failed to fetch application statuses' });
    }
});

// POST /api/student/applications
router.post('/applications', async (req, res) => {
    const { internshipId, status } = req.body;
    const userId = req.user.id;
    
    try {
        if (status) {
            // Upsert logic: insert or update status
            await db('internship_applications')
                .insert({ user_id: userId, internship_id: internshipId, status: status })
                .onConflict(['user_id', 'internship_id'])
                .merge();
        } else {
            // If status is null, delete the record
            await db('internship_applications')
                .where({ user_id: userId, internship_id: internshipId })
                .del();
        }
        res.status(200).json({ message: 'Status updated' });
    } catch (e) {
        res.status(500).json({ message: 'Failed to update status' });
    }
});

// GET /api/student/saved-searches
router.get('/saved-searches', async (req, res) => {
    try {
        const searches = await db('saved_searches').where({ user_id: req.user.id });
        res.json(searches);
    } catch(e) {
        res.status(500).json({ message: 'Failed to fetch saved searches' });
    }
});

// POST /api/student/saved-searches
router.post('/saved-searches', async (req, res) => {
    const { name, params } = req.body;
    try {
        const [newSearch] = await db('saved_searches').insert({
            user_id: req.user.id,
            name,
            params
        }).returning('*');
        res.status(201).json(newSearch);
    } catch(e) {
        res.status(500).json({ message: 'Failed to save search' });
    }
});

// POST /api/student/support-ticket
router.post('/support-ticket', async (req, res) => {
    const { subject, message } = req.body;
    try {
        await db('support_tickets').insert({
            user_id: req.user.id,
            subject,
            message,
            status: 'Open'
        });
        res.status(201).json({ message: 'Support ticket created successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create support ticket.' });
    }
});


module.exports = router;