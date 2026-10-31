export const summarizeDocument = async (req, res, next) => {
    try {
        const { documentId } = req.body;
        
        // In a real app, you would fetch the document text from Supabase 
        // and send it to an AI API (like Gemini or OpenAI) here.
        // For now, we return a mock summary to unblock the frontend.
        res.status(200).json({
            success: true,
            summary: "This document details the architectural significance of the stepwell, focusing on its inverted temple structure, 7 levels of stairs, and intricate deity carvings."
        });
    } catch (error) {
        next(error);
    }
};

export const chatWithAssistant = async (req, res, next) => {
    try {
        const { monumentId, question } = req.body;

        // Mock AI response mapping to the UI's chat feature
        res.status(200).json({
            success: true,
            answer: `Based on the archives, the unique features include multi-level structures, inverted temple design, and advanced water management techniques.`,
            sources: ["Archaeological Survey Report 2012", "Historical Significance PDF"]
        });
    } catch (error) {
        next(error);
    }
};