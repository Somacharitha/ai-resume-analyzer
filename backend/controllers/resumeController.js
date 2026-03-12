const db = require('../database/db');
const analyzerService = require('../services/analyzerService');

exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a PDF file' });
        }

        const userId = req.user.id;
        const filePath = req.file.path;
        const fileName = req.file.originalname;

        // 1. Analyze the resume
        const analysis = await analyzerService.analyzeResume(filePath);

        // 2. Save Resume Metadata to DB
        const resumeResult = await db.query(
            'INSERT INTO resumes (user_id, file_name, file_path, original_text) VALUES ($1, $2, $3, $4) RETURNING id',
            [userId, fileName, filePath, analysis.originalText]
        );
        const resumeId = resumeResult.rows[0].id;

        // 3. Save Analysis Results to DB
        const analysisResultQuery = `
            INSERT INTO analysis_results 
            (resume_id, score, detected_skills, best_match_role, match_percentages, missing_skills, improvement_suggestions) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `;
        const analysisValues = [
            resumeId,
            analysis.score,
            analysis.detectedSkills,
            analysis.bestMatchRole,
            JSON.stringify(analysis.matchPercentages),
            JSON.stringify(analysis.missingSkills),
            analysis.improvementSuggestions
        ];

        const savedAnalysis = await db.query(analysisResultQuery, analysisValues);

        res.status(200).json({
            message: 'Resume analyzed successfully',
            analysis: {
                id: savedAnalysis.rows[0].id,
                score: analysis.score,
                detectedSkills: analysis.detectedSkills,
                bestMatchRole: analysis.bestMatchRole,
                matchPercentages: analysis.matchPercentages,
                missingSkills: analysis.missingSkills,
                improvementSuggestions: analysis.improvementSuggestions
            }
        });

    } catch (error) {
        console.error('Error processing resume:', error);
        res.status(500).json({ message: 'Error processing resume', error: error.message });
    }
};

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch latest resume analysis for the user
        const result = await db.query(`
            SELECT ar.*, r.file_name 
            FROM analysis_results ar 
            JOIN resumes r ON ar.resume_id = r.id 
            WHERE r.user_id = $1 
            ORDER BY ar.created_at DESC LIMIT 1
        `, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No resume analysis found' });
        }

        res.status(200).json({ data: result.rows[0] });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Error fetching dashboard data' });
    }
};
