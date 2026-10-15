
const RULES = [
  {
    category: "E-waste",
    keywords: [
      "battery", "batteries", "computer", "computers",
      "laptop", "laptops", "phone", "phones", "mobile",
      "charger", "chargers", "cable", "cables",
      "electronic", "electronics", "electrical",
      "appliance", "appliances"
    ],
    advice:
      "Keep electronic waste separate from general rubbish. " +
      "Check a suitable e-waste collection service."
  },
  {
    category: "Clothing",
    keywords: [
      "clothes", "clothing", "shirt", "shirts",
      "pants", "jeans", "jacket", "jackets",
      "shoes", "textile", "textiles", "fabric"
    ],
    advice:
      "Consider donating usable clothing or using a " +
      "suitable textile collection service."
  },
  {
    category: "Food waste",
    keywords: [
      "food", "scraps", "food scraps", "vegetable",
      "vegetables", "fruit", "compost",
      "organic", "organics"
    ],
    advice:
      "Check whether food waste can go in an eligible " +
      "organics collection or composting service."
  },
  {
    category: "Repair",
    keywords: [
      "broken", "repair", "fix", "bike", "bicycle",
      "furniture", "toaster", "lamp", "chair"
    ],
    advice:
      "Consider a repair service before replacing " +
      "an item that may still be usable."
  },
  {
    category: "Reuse",
    keywords: [
      "reuse", "reusable", "donate", "donation",
      "household goods", "furniture", "table",
      "desk", "cupboard"
    ],
    advice:
      "Consider donating, sharing or reusing " +
      "an item that is still in good condition."
  }
];

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export function onRequestGet(context) {
  const url = new URL(context.request.url);
  const item = (url.searchParams.get("item") || "").trim();

  if (item.length < 2 || item.length > 120) {
    return jsonResponse(
      {
        error: "Enter an item description of 2–120 characters."
      },
      400
    );
  }

  const term = item.toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  for (const rule of RULES) {
    const score = rule.keywords.reduce(
      (total, keyword) =>
        total + (term.includes(keyword) ? 1 : 0),
      0
    );

    if (score > bestScore) {
      bestScore = score;
      bestMatch = rule;
    }
  }

  if (!bestMatch) {
    return jsonResponse({
      item,
      category: null,
      advice:
        "No clear category was found. Try words such as " +
        "battery, clothing, food scraps or broken furniture.",
      source: "Cloudflare Pages Function"
    });
  }

  return jsonResponse({
    item,
    category: bestMatch.category,
    advice: bestMatch.advice,
    source: "Cloudflare Pages Function"
  });
}
