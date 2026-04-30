// ... inside the try block after receiving DeepSeek response

    console.log("[generate-article] DeepSeek response received successfully");

    const rawContent = data.choices?.[0]?.message?.content || "{}";
    let result: any = null;

    try {
      result = JSON.parse(rawContent);
    } catch (parseError) {
      console.warn("[generate-article] Initial JSON parse failed, trying cleanup", { error: parseError.message });
      let cleaned = rawContent.trim();
      if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
      if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
      if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
      try {
        result = JSON.parse(cleaned);
      } catch (secondError) {
        console.error("[generate-article] Failed to parse AI JSON after cleanup", { error: secondError.message });
        return new Response(
          JSON.stringify({ error: "AI trả về JSON không hợp lệ. Vui lòng thử lại." }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!result || (!result.title && !result.content)) {
      console.error("[generate-article] Parsed result is missing required fields", { result });
      return new Response(
        JSON.stringify({ error: "AI trả về dữ liệu không đầy đủ." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

// ... rest of the function uses `result` as before