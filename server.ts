import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// High payload limit to allow PDF uploads as base64
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initializer for Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  res.json({
    status: "ok",
    hasApiKey: hasKey,
    model: "gemini-3.8-flash",
  });
});

// Report Generation endpoint
app.post("/api/generate-report", async (req, res) => {
  try {
    const {
      fileName,
      fileType,
      fileBase64,
      rawText,
      reportType = "executive",
      depth = "standard",
      tone = "analytical",
      customFocus = "",
    } = req.body;

    if (!fileBase64 && (!rawText || rawText.trim().length === 0)) {
      return res.status(400).json({
        error: "Please provide either a document file (PDF/Text) or document text to analyze.",
      });
    }

    const ai = getGeminiClient();

    // Determine instructions based on selected report configuration
    const reportTypeDescriptions: Record<string, string> = {
      executive: "High-impact Executive Briefing: focused on strategic takeaways, critical decisions, executive summary, and actionable recommendations for C-suite leaders.",
      technical: "In-depth Technical Audit & Architectural Breakdown: focused on specifications, methodology, infrastructure, system performance, risks, and technical validation.",
      strategic: "Strategic & Competitive Analysis: focused on market positioning, SWOT matrix, risk mitigation, resource allocation, and prioritized execution roadmap.",
      financial: "Financial & Quantitative Audit: focused on revenue metrics, cost structures, variance analysis, projections, and fiscal risk factors.",
      brief: "Concise One-Page Overview: high-density bulleted brief capturing essential findings, key metrics, and immediate next steps in under 5 minutes of reading.",
      research: "Comprehensive Analytical Research Paper: formal methodology review, synthesized findings, data interpretation, citations/references from document, and conclusions.",
    };

    const depthPrompt = depth === "comprehensive" 
      ? "Provide an extensive, exhaustive multi-page breakdown leaving no critical nuance uncovered."
      : depth === "concise"
      ? "Keep the report extremely focused, punchy, and condensed without unnecessary filler."
      : "Provide a balanced, thorough, professional report.";

    const systemInstruction = `You are an elite enterprise AI intelligence analyst and executive report writer.
Your job is to ingest the provided source document or PDF and synthesize it into a pristine, beautifully structured, publication-ready report.

Style & Formatting Rules:
1. Use clean Markdown formatting:
   - Use # for Report Title
   - Use ## for Main Sections
   - Use ### for Sub-sections
   - Use Markdown tables for structured data, comparisons, risks, or KPI matrices
   - Use blockquotes (> ) for vital executive callouts and urgent warnings
   - Use bolding strategically for high-impact figures and terminology
2. Structure the report logically:
   - Header with Metadata block (Title, Document Source, Analysis Date, Executive Classification)
   - Executive Summary (crisp 2-3 paragraph overview of core themes)
   - Key Quantitative & Qualitative Metrics (present in a table or bulleted metrics summary)
   - Detailed Findings & Analysis (split by core logical themes)
   - Risk Assessment & Vulnerability Analysis (with severity ratings: High, Medium, Low)
   - Strategic Recommendations & Action Plan (Prioritized: P0 Immediate, P1 Near-term, P2 Strategic)
   - Conclusion & Sign-Off
3. Avoid generic filler. Cite specific facts, numbers, dates, and conclusions from the provided source document.
4. If there is ambiguity or missing data in the source document, note it constructively.`;

    const userPrompt = `Generate a ${reportTypeDescriptions[reportType] || reportTypeDescriptions.executive}
Depth Level: ${depthPrompt}
Tone of Voice: ${tone}.
${customFocus ? `Special User Focus Instructions: "${customFocus}". Prioritize this aspect heavily.` : ""}
Source Document Name: ${fileName || "Uploaded Document"}

Please analyze the provided document content thoroughly and output the complete, comprehensive report in Markdown format.`;

    const contentsParts: any[] = [];

    // If PDF or image file base64 is provided
    if (fileBase64 && fileType) {
      // Remove data URL header if present (e.g. "data:application/pdf;base64,")
      const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, "");
      contentsParts.push({
        inlineData: {
          mimeType: fileType,
          data: cleanBase64,
        },
      });
    }

    // Append text prompt / raw content
    if (rawText && rawText.trim().length > 0) {
      contentsParts.push({
        text: `Source Document Content:\n\n${rawText}\n\n---\n${userPrompt}`,
      });
    } else {
      contentsParts.push({
        text: userPrompt,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: contentsParts,
      },
      config: {
        systemInstruction,
        temperature: 0.2, // low temperature for accurate document analysis
      },
    });

    const reportMarkdown = response.text || "Report generation finished with an empty response.";

    // Generate quick summary highlights for the dashboard card
    const wordCount = reportMarkdown.split(/\s+/).filter(Boolean).length;
    const estimatedReadingTime = Math.max(1, Math.round(wordCount / 200));

    res.json({
      success: true,
      reportMarkdown,
      metadata: {
        title: fileName ? `Report on ${fileName.replace(/\.[^/.]+$/, "")}` : "Executive Intelligence Report",
        reportType,
        depth,
        tone,
        wordCount,
        readingTimeMinutes: estimatedReadingTime,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error generating report:", error);
    res.status(500).json({
      error: error.message || "Failed to generate report using AI.",
    });
  }
});

// Vite middleware or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MineIntel Server running on http://localhost:${PORT}`);
  });
}

startServer();
