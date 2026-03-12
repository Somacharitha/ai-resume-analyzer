const fs = require('fs');
const pdfParse = require('pdf-parse');

// Predefined Tech Dictionary
const techSkills = [
    'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'go', 'rust',
    'html', 'css', 'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask',
    'spring', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'aws', 'azure', 'gcp',
    'docker', 'kubernetes', 'git', 'github', 'ci/cd', 'machine learning', 'ai',
    'data analysis', 'pandas', 'numpy', 'tensor flow', 'pytorch', 'system design',
    'microservices', 'api', 'rest', 'graphql', 'typescript'
];

// Predefined Job Roles and Required Skills
const jobRoles = {
    'Web Developer': ['html', 'css', 'javascript', 'react', 'git', 'api'],
    'Backend Developer': ['nodejs', 'express', 'python', 'java', 'sql', 'mongodb', 'docker', 'api', 'system design', 'microservices'],
    'Data Analyst': ['python', 'sql', 'data analysis', 'pandas', 'numpy'],
    'AI Engineer': ['python', 'machine learning', 'ai', 'tensor flow', 'pytorch', 'aws']
};

exports.analyzeResume = async (filePath) => {
    try {
        // 1. Extract Text from PDF
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        const text = data.text.toLowerCase();

        // 2. Identify Skills
        const detectedSkills = [];
        techSkills.forEach(skill => {
            if (text.includes(skill)) {
                detectedSkills.push(skill);
            }
        });

        // 3. Score System (out of 100)
        let score = 0;
        
        // Base score for skills quantity
        if (detectedSkills.length > 15) score += 40;
        else if (detectedSkills.length > 10) score += 30;
        else if (detectedSkills.length > 5) score += 20;
        else score += 10;

        // Score for projects/experience keywords
        if (text.includes('project') || text.includes('experience')) score += 20;
        
        // Score for key industry words
        const keyWords = ['api', 'database', 'cloud', 'architecture', 'lead', 'managed', 'developed', 'optimized'];
        let keywordMatches = 0;
        keyWords.forEach(kw => { if (text.includes(kw)) keywordMatches++; });
        score += Math.min(keywordMatches * 5, 40);

        // 4. Job Role Matching & Match Percentages
        const matchPercentages = {};
        jobRolesKeys = Object.keys(jobRoles);
        
        jobRolesKeys.forEach(role => {
            const requiredSkills = jobRoles[role];
            const matchedSkills = requiredSkills.filter(skill => detectedSkills.includes(skill));
            const percentage = Math.round((matchedSkills.length / requiredSkills.length) * 100);
            matchPercentages[role] = percentage;
        });

        // Find Best Match
        let bestMatchRole = jobRolesKeys[0];
        let highestPercentage = matchPercentages[bestMatchRole];
        
        jobRolesKeys.forEach(role => {
            if (matchPercentages[role] > highestPercentage) {
                highestPercentage = matchPercentages[role];
                bestMatchRole = role;
            }
        });

        // 5. Missing Skills Detector for Best Role
        const missingSkills = {};
        jobRolesKeys.forEach(role => {
            const requiredSkills = jobRoles[role];
            missingSkills[role] = requiredSkills.filter(skill => !detectedSkills.includes(skill));
        });

        // 6. Improvement Suggestions
        const improvementSuggestions = [];
        if (!text.includes('github') && !text.includes('portfolio')) {
            improvementSuggestions.push('Include links to GitHub projects or a personal portfolio.');
        }
        if (!text.includes('optimized') && !text.includes('improved') && !text.includes('%')) {
            improvementSuggestions.push('Add measurable achievements (e.g., "improved performance by 20%").');
        }
        if (detectedSkills.filter(s => ['aws', 'azure', 'gcp', 'docker'].includes(s)).length === 0) {
            improvementSuggestions.push('Add modern cloud or container technologies (AWS, Docker) to stand out.');
        }

        return {
            originalText: text,
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
