const fs = require('fs');
const pdfParse = require('pdf-parse');

// Predefined Tech Skills
const techSkills = [
    'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'go', 'rust',
    'html', 'css', 'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask',
    'spring', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'aws', 'azure', 'gcp',
    'docker', 'kubernetes', 'git', 'github', 'ci/cd', 'machine learning', 'ai',
    'data analysis', 'pandas', 'numpy', 'tensor flow', 'pytorch', 'system design',
    'microservices', 'api', 'rest', 'graphql', 'typescript'
];

// Job Roles
const jobRoles = {
    'Web Developer': ['html', 'css', 'javascript', 'react', 'git', 'api'],
    'Backend Developer': ['nodejs', 'express', 'python', 'java', 'sql', 'mongodb', 'docker', 'api', 'system design', 'microservices'],
    'Data Analyst': ['python', 'sql', 'data analysis', 'pandas', 'numpy'],
    'AI Engineer': ['python', 'machine learning', 'ai', 'tensor flow', 'pytorch', 'aws']
};

exports.analyzeResume = async (filePath) => {
    try {
        // 1. Read PDF
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        const text = data.text.toLowerCase();

        // 2. Detect Skills
        const detectedSkills = techSkills.filter(skill => text.includes(skill));

        // 3. Score Calculation
        let score = 0;

        if (detectedSkills.length > 15) score += 40;
        else if (detectedSkills.length > 10) score += 30;
        else if (detectedSkills.length > 5) score += 20;
        else score += 10;

        if (text.includes('project') || text.includes('experience')) score += 20;

        const keyWords = ['api', 'database', 'cloud', 'architecture', 'lead', 'managed', 'developed', 'optimized'];
        const keywordMatches = keyWords.filter(kw => text.includes(kw)).length;
        score += Math.min(keywordMatches * 5, 40);

        // 4. Job Role Matching
        const matchPercentages = {};
        const jobRolesKeys = Object.keys(jobRoles);

        jobRolesKeys.forEach(role => {
            const requiredSkills = jobRoles[role];
            const matchedSkills = requiredSkills.filter(skill => detectedSkills.includes(skill));
            const percentage = Math.round((matchedSkills.length / requiredSkills.length) * 100);
            matchPercentages[role] = percentage;
        });

        // Best Match Role
        let bestMatchRole = jobRolesKeys[0];
        let highestPercentage = matchPercentages[bestMatchRole];

        jobRolesKeys.forEach(role => {
            if (matchPercentages[role] > highestPercentage) {
                highestPercentage = matchPercentages[role];
                bestMatchRole = role;
            }
        });

        // 5. Missing Skills
        const missingSkills = {};
        jobRolesKeys.forEach(role => {
            const requiredSkills = jobRoles[role];
            missingSkills[role] = requiredSkills.filter(skill => !detectedSkills.includes(skill));
        });

        // 6. Suggestions
        const improvementSuggestions = [];

        if (!text.includes('github') && !text.includes('portfolio')) {
            improvementSuggestions.push('Include links to GitHub or portfolio.');
        }

        if (!text.includes('%') && !text.includes('improved')) {
            improvementSuggestions.push('Add measurable achievements.');
        }

        if (!detectedSkills.some(s => ['aws', 'azure', 'docker'].includes(s))) {
            improvementSuggestions.push('Add cloud technologies like AWS or Docker.');
        }

        return {
            detectedSkills,
            score,
            matchPercentages,
            bestMatchRole,
            missingSkills,
            improvementSuggestions
        };

    } catch (error) {
        console.error('Error in analyzeResume:', error);
        throw error;
    }
};